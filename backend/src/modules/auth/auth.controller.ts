import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, fullName } = req.body;

    // Check existing
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return sendError(res, 'User with this email or phone already exists.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        fullName,
        role: 'CUSTOMER',
        isVerified: true,
        customer: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    // Store Refresh Token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return sendSuccess(res, 'Customer registered successfully', {
      user,
      accessToken,
      refreshToken,
    }, 201);
  } catch (error) {
    return sendError(res, 'Registration failed', 500, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError(res, 'Invalid credentials.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated.', 403);
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return sendSuccess(res, 'Login successful', {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return sendError(res, 'Login failed', 500, error);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return sendError(res, 'Refresh Token is required.', 400);
    }

    const decoded = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      return sendError(res, 'Invalid or expired Refresh Token.', 401);
    }

    const newAccessToken = generateAccessToken({ userId: decoded.userId, email: decoded.email, role: decoded.role });

    return sendSuccess(res, 'Access token refreshed successfully', {
      accessToken: newAccessToken,
    });
  } catch (error) {
    return sendError(res, 'Token refresh failed', 401, error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      await prisma.refreshToken.deleteMany({
        where: { userId: req.user.userId },
      });
    }
    return sendSuccess(res, 'Logged out successfully from all devices');
  } catch (error) {
    return sendError(res, 'Logout failed', 500, error);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        customer: {
          include: {
            addresses: true,
          },
        },
      },
    });

    return sendSuccess(res, 'Profile retrieved successfully', user);
  } catch (error) {
    return sendError(res, 'Failed to fetch profile', 500, error);
  }
};

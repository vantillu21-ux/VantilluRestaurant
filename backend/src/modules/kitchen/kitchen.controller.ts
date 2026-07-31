import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';

export const getKitchenQueue = async (req: Request, res: Response) => {
  try {
    const queue = await prisma.kitchenQueue.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACCEPTED', 'PREPARING', 'COOKING', 'PACKING'],
        },
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return sendSuccess(res, 'Kitchen display queue retrieved', queue);
  } catch (error) {
    return sendError(res, 'Failed to fetch kitchen queue', 500, error);
  }
};

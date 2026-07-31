import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';

// Get Menu Catalog for Website & Mobile (Public)
export const getMenuCatalog = async (req: Request, res: Response) => {
  try {
    const { category, cuisine, isVeg, search, page = 1, limit = 100 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      isAvailable: true,
      isDeleted: false,
    };

    if (category && category !== 'All') {
      where.category = { name: String(category) };
    }

    if (cuisine && cuisine !== 'All') {
      where.cuisine = String(cuisine);
    }

    if (isVeg !== undefined) {
      where.isVeg = isVeg === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: true,
          stock: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.menuItem.count({ where }),
    ]);

    return sendSuccess(res, 'Menu catalog fetched successfully', items, 200, {
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch menu catalog', 500, error);
  }
};

// Get Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return sendSuccess(res, 'Categories fetched successfully', categories);
  } catch (error) {
    return sendError(res, 'Failed to fetch categories', 500, error);
  }
};

// Create Dish (Admin Only)
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      name,
      description,
      isVeg,
      cuisine,
      spiceLevel,
      portionType,
      prepTime,
      price,
      halfPrice,
      fullPrice,
      singlePrice,
      familyPrice,
      jumboPrice,
      isBestSeller,
      isChefSpecial,
    } = req.body;

    const menuItem = await prisma.menuItem.create({
      data: {
        categoryId,
        name,
        description,
        isVeg: isVeg ?? true,
        cuisine: cuisine || 'Indian',
        spiceLevel: spiceLevel || 'MEDIUM',
        portionType: portionType || 'STANDARD',
        prepTime: prepTime || '15 mins',
        price: Number(price) || 0,
        halfPrice: halfPrice ? Number(halfPrice) : null,
        fullPrice: fullPrice ? Number(fullPrice) : null,
        singlePrice: singlePrice ? Number(singlePrice) : null,
        familyPrice: familyPrice ? Number(familyPrice) : null,
        jumboPrice: jumboPrice ? Number(jumboPrice) : null,
        isBestSeller: isBestSeller ?? false,
        isChefSpecial: isChefSpecial ?? false,
        stock: {
          create: { inStock: true },
        },
      },
      include: {
        category: true,
      },
    });

    return sendSuccess(res, 'Menu dish created successfully', menuItem, 201);
  } catch (error) {
    return sendError(res, 'Failed to create menu dish', 500, error);
  }
};

// Update Dish (Admin Only)
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, 'Menu dish updated successfully', menuItem);
  } catch (error) {
    return sendError(res, 'Failed to update menu dish', 500, error);
  }
};

// Toggle Availability (Admin Only)
export const toggleItemAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
    });

    return sendSuccess(res, `Dish status updated to ${isAvailable ? 'Available' : 'Disabled'}`, menuItem);
  } catch (error) {
    return sendError(res, 'Failed to toggle availability', 500, error);
  }
};

// Soft Delete Dish (Admin Only)
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.menuItem.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isAvailable: false,
      },
    });

    return sendSuccess(res, 'Dish deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete dish', 500, error);
  }
};

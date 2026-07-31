import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';

export const getRestaurantSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.restaurantSetting.findFirst({
      where: { id: 'default-settings' },
    });
    return sendSuccess(res, 'Restaurant settings retrieved', settings);
  } catch (error) {
    return sendError(res, 'Failed to fetch settings', 500, error);
  }
};

export const updateRestaurantSettings = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;

    const settings = await prisma.restaurantSetting.upsert({
      where: { id: 'default-settings' },
      update: updateData,
      create: {
        id: 'default-settings',
        ...updateData,
      },
    });

    return sendSuccess(res, 'Restaurant settings updated successfully', settings);
  } catch (error) {
    return sendError(res, 'Failed to update settings', 500, error);
  }
};

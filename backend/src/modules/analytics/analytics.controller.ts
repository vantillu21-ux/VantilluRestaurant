import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      revenueResult,
      statusCounts,
      totalCustomers,
      totalReservations,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { isPaid: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.customer.count(),
      prisma.reservation.count({ where: { createdAt: { gte: today } } }),
    ]);

    const formattedStatusCounts: Record<string, number> = {};
    statusCounts.forEach((s) => {
      formattedStatusCounts[s.status] = s._count.status;
    });

    return sendSuccess(res, 'Dashboard analytics summary retrieved', {
      totalOrders,
      todayOrders,
      revenue: revenueResult._sum.grandTotal || 0,
      status_counts: formattedStatusCounts,
      totalCustomers,
      todayReservations: totalReservations,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch analytics summary', 500, error);
  }
};

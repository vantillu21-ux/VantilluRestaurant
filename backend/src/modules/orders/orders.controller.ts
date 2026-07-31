import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { getIO } from '../../sockets/socket.server';

// Calculate order costs & Place Order
export const placeOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      guestName,
      guestPhone,
      addressId,
      orderType,
      items,
      couponCode,
      notes,
      tableNumber,
      paymentMethod = 'COD',
    } = req.body;

    if (!items || items.length === 0) {
      return sendError(res, 'Order must contain at least one item.', 400);
    }

    // 1. Fetch Setting Rules
    const settings = await prisma.restaurantSetting.findFirst() || {
      packingCharge: 25.0,
      deliveryCharge: 40.0,
      gstPercent: 5.0,
    };

    // 2. Compute Item Subtotal
    let subTotal = 0;
    const orderItemData: any[] = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem || !menuItem.isAvailable) {
        return sendError(res, `Dish '${item.name || item.menuItemId}' is currently unavailable.`, 400);
      }

      const unitPrice = item.unitPrice || menuItem.price || menuItem.fullPrice || menuItem.singlePrice || 0;
      const totalPrice = unitPrice * item.quantity;
      subTotal += totalPrice;

      orderItemData.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        portion: item.portion || 'Standard',
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        notes: item.notes,
      });
    }

    // 3. Compute Charges & Taxes
    const packingCharge = orderType === 'DELIVERY' || orderType === 'PICKUP' ? settings.packingCharge : 0.0;
    const deliveryCharge = orderType === 'DELIVERY' ? settings.deliveryCharge : 0.0;
    let discountAmount = 0.0;

    // Evaluate Coupon Discount if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon && coupon.isActive && coupon.expiresAt > new Date()) {
        if (subTotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }
    }

    const taxableAmount = Math.max(0, subTotal - discountAmount);
    const gstAmount = (taxableAmount * settings.gstPercent) / 100;
    const grandTotal = Math.round(taxableAmount + gstAmount + packingCharge + deliveryCharge);

    // 4. Generate Unique Order Number
    const count = await prisma.order.count();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `VAN-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    // 5. Save Order Transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: req.user ? req.user.userId : null,
        addressId: addressId || null,
        guestName,
        guestPhone,
        orderType: orderType || 'DELIVERY',
        status: 'PENDING',
        subTotal,
        gstAmount,
        packingCharge,
        deliveryCharge,
        discountAmount,
        grandTotal,
        couponCode,
        notes,
        tableNumber,
        isPaid: paymentMethod === 'PAY_AT_RESTAURANT',
        items: {
          create: orderItemData,
        },
        payments: {
          create: {
            gateway: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
            method: paymentMethod === 'COD' ? 'CASH' : 'UPI',
            amount: grandTotal,
            status: paymentMethod === 'PAY_AT_RESTAURANT' ? 'SUCCESS' : 'PENDING',
          },
        },
        kitchenQueue: {
          create: {
            status: 'PENDING',
            priority: 1,
          },
        },
      },
      include: {
        items: true,
        payments: true,
        address: true,
      },
    });

    // 6. Socket.IO Real-time Broadcast to Kitchen & Admin Dashboards
    try {
      const io = getIO();
      io.to('kitchen').to('admin').emit('order:created', {
        message: `New Order Received! ${order.orderNumber}`,
        order,
      });
    } catch (e) {
      console.warn('Socket emit warning:', e);
    }

    return sendSuccess(res, 'Order placed successfully', order, 201);
  } catch (error) {
    return sendError(res, 'Failed to place order', 500, error);
  }
};

// Update Order Status (Kitchen / Admin / Cashier)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, estimatedTime } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        estimatedTime,
      },
      include: {
        items: true,
      },
    });

    // Sync Kitchen Queue Status
    await prisma.kitchenQueue.updateMany({
      where: { orderId: id },
      data: { status },
    });

    // Broadcast Socket Status Change
    try {
      const io = getIO();
      io.to('admin').to('kitchen').to(`customer_${order.customerId}`).emit('order:status_changed', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      });
    } catch (e) {
      console.warn('Socket emit warning:', e);
    }

    return sendSuccess(res, `Order status updated to ${status}`, order);
  } catch (error) {
    return sendError(res, 'Failed to update order status', 500, error);
  }
};

// Fetch Active Orders (Dashboard API)
export const getActiveOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          notIn: ['COMPLETED', 'CANCELLED', 'REFUNDED'],
        },
      },
      include: {
        items: true,
        address: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Active orders retrieved', orders);
  } catch (error) {
    return sendError(res, 'Failed to fetch active orders', 500, error);
  }
};

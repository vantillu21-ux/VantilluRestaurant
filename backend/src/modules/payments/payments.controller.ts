import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { sendSuccess, sendError } from '../../utils/response';
import { getIO } from '../../sockets/socket.server';

// Create Razorpay Order
export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return sendError(res, 'Order not found.', 404);
    }

    const options = {
      amount: Math.round(order.grandTotal * 100), // amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
    };

    // Construct mock Razorpay order or integrate SDK
    const mockRazorpayOrderId = `rzp_order_${Date.now()}`;

    // Update payment record with razorpay order id
    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: {
        razorpayOrderId: mockRazorpayOrderId,
      },
    });

    return sendSuccess(res, 'Razorpay order created successfully', {
      keyId: env.RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency,
      razorpayOrderId: mockRazorpayOrderId,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    return sendError(res, 'Failed to initialize payment gateway', 500, error);
  }
};

// Verify Razorpay Payment Webhook / Client Callback
export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // HMAC Signature Validation
    const bodyData = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(bodyData)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature || process.env.NODE_ENV === 'development';

    if (isAuthentic) {
      // Mark Payment as SUCCESS
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: 'SUCCESS',
        },
      });

      // Update Order Status to PAID & ACCEPTED
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          status: 'ACCEPTED',
        },
      });

      // Socket Notify Kitchen & Admin
      try {
        const io = getIO();
        io.to('kitchen').to('admin').emit('payment:verified', {
          message: `Payment Received for Order ${updatedOrder.orderNumber}!`,
          orderId,
        });
      } catch (e) {
        console.warn('Socket warning:', e);
      }

      return sendSuccess(res, 'Payment verified successfully', updatedOrder);
    } else {
      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: 'FAILED', failureReason: 'Invalid Payment Signature' },
      });
      return sendError(res, 'Payment verification failed. Invalid signature.', 400);
    }
  } catch (error) {
    return sendError(res, 'Payment verification processing error', 500, error);
  }
};

// Cashier COD Status Toggle (Admin / Cashier)
export const updateCODPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { isPaid } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid,
      },
    });

    await prisma.payment.updateMany({
      where: { orderId },
      data: {
        status: isPaid ? 'SUCCESS' : 'PENDING',
      },
    });

    return sendSuccess(res, `COD Payment status updated to ${isPaid ? 'Paid' : 'Pending'}`, order);
  } catch (error) {
    return sendError(res, 'Failed to update COD status', 500, error);
  }
};

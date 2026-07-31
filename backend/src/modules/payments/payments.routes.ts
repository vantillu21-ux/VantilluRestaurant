import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpayPayment, updateCODPaymentStatus } from './payments.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.patch('/cod/:orderId', authenticateJWT, authorizeRoles('OWNER', 'MANAGER', 'CASHIER'), updateCODPaymentStatus);

export default router;

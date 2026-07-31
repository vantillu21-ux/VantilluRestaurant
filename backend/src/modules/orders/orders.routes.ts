import { Router } from 'express';
import { placeOrder, updateOrderStatus, getActiveOrders } from './orders.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.post('/', placeOrder);
router.get('/active', authenticateJWT, authorizeRoles('OWNER', 'MANAGER', 'KITCHEN', 'CASHIER'), getActiveOrders);
router.patch('/:id/status', authenticateJWT, authorizeRoles('OWNER', 'MANAGER', 'KITCHEN', 'CASHIER'), updateOrderStatus);

export default router;

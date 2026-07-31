import { Router } from 'express';
import {
  createReservation,
  createPartyInquiry,
  getReservations,
  getPartyOrders,
} from './reservations.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.post('/table', createReservation);
router.post('/party', createPartyInquiry);

router.get('/table', authenticateJWT, authorizeRoles('OWNER', 'MANAGER', 'CASHIER'), getReservations);
router.get('/party', authenticateJWT, authorizeRoles('OWNER', 'MANAGER'), getPartyOrders);

export default router;

import { Router } from 'express';
import { getDashboardSummary } from './analytics.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/summary', authenticateJWT, authorizeRoles('OWNER', 'MANAGER'), getDashboardSummary);

export default router;

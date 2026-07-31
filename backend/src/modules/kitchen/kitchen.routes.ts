import { Router } from 'express';
import { getKitchenQueue } from './kitchen.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/queue', authenticateJWT, authorizeRoles('OWNER', 'MANAGER', 'KITCHEN'), getKitchenQueue);

export default router;

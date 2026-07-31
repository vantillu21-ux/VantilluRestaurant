import { Router } from 'express';
import { getRestaurantSettings, updateRestaurantSettings } from './settings.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/', getRestaurantSettings);
router.put('/', authenticateJWT, authorizeRoles('OWNER', 'MANAGER'), updateRestaurantSettings);

export default router;

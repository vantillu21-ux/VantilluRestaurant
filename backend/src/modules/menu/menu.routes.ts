import { Router } from 'express';
import {
  getMenuCatalog,
  getCategories,
  createMenuItem,
  updateMenuItem,
  toggleItemAvailability,
  deleteMenuItem,
} from './menu.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

// Public Routes
router.get('/', getMenuCatalog);
router.get('/categories', getCategories);

// Admin Protected Routes
router.post('/', authenticateJWT, authorizeRoles('OWNER', 'MANAGER'), createMenuItem);
router.put('/:id', authenticateJWT, authorizeRoles('OWNER', 'MANAGER'), updateMenuItem);
router.patch('/:id/availability', authenticateJWT, authorizeRoles('OWNER', 'MANAGER'), toggleItemAvailability);
router.delete('/:id', authenticateJWT, authorizeRoles('OWNER', 'MANAGER'), deleteMenuItem);

export default router;

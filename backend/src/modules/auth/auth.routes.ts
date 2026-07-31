import { Router } from 'express';
import { registerCustomer, login, refreshToken, logout, getProfile } from './auth.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', registerCustomer);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticateJWT, logout);
router.get('/me', authenticateJWT, getProfile);

export default router;

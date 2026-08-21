// /routes/authRoutes.js
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { 
	validateRegisterData, 
	validateLoginData, 
	stopAuthenticated, 
	stopGuest 
} from '../middleware/validations.js';

import { authLimiter} from '../middleware/rateLimiter.js'

const router = Router();

// Invitados solamente (Si están logueados, el middleware los rebota con 403)
router.post('/register', authLimiter, stopAuthenticated, validateRegisterData, authController.register);
router.post('/login', authLimiter, stopAuthenticated, validateLoginData, authController.login);

// Usuarios autenticados solamente (Si no hay token válido, los rebota con 401)
router.post('/logout', stopGuest, authController.logout);

export default router;
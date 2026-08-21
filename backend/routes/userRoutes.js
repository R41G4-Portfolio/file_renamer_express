import express from 'express';
import { stopGuest } from '../middleware/validations.js';
import requireRole from '../middleware/rbacMiddleware.js';
import { getUsersByRole } from '../controllers/userController.js';

const router = express.Router();

router.get('/role/:role',
	stopGuest,
	requireRole(['ADMIN', 'UPLOADER']),
	getUsersByRole
);

export default router;
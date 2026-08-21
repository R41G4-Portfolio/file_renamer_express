import express from 'express';
import { stopGuest } from '../middleware/validations.js';
import requireRole from '../middleware/rbacMiddleware.js';
import { getAdminTemplates } from '../controllers/adminController.js';

const router = express.Router();

router.get('/templates',
	stopGuest,
	requireRole(['ADMIN']),
	getAdminTemplates
);

export default router;
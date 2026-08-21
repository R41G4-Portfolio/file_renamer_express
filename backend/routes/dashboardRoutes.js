import express from 'express';
import { stopGuest } from '../middleware/validations.js';
import requireRole from '../middleware/rbacMiddleware.js';
import { getDashboardTemplates } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/templates',
	stopGuest,
	requireRole(['ADMIN', 'UPLOADER']),
	getDashboardTemplates
);

export default router;
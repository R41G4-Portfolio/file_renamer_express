import express from 'express';
import { stopGuest } from '../middleware/validations.js';
import requireRole from '../middleware/rbacMiddleware.js';
import { getAuditLogs } from '../controllers/auditController.js';

const router = express.Router();

router.get('/',
	stopGuest,
	requireRole(['ADMIN']),
	getAuditLogs
);

export default router;
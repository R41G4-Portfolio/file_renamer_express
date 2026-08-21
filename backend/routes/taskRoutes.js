import express from 'express';
import { stopGuest } from '../middleware/validations.js';
import requireRole from '../middleware/rbacMiddleware.js';
import { getMyTemplates, viewFile, getMyTasks } from '../controllers/taskController.js';

const router = express.Router();

router.get('/assignments',
	stopGuest,
	requireRole(['DOWNLOADER', 'ADMIN']),
	getMyTasks
);

router.get('/files/:assignmentId',
	stopGuest,
	requireRole(['DOWNLOADER', 'ADMIN', 'UPLOADER']),
	viewFile
);

export default router;
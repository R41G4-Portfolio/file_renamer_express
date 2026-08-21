// /routes/assignmentRoutes.s
import express from 'express';
import { stopGuest } from '../middleware/validations.js';
import requireRole from '../middleware/rbacMiddleware.js';
import { uploadDocument, uploadExcel } from '../middleware/uploadMiddleware.js'; 
import { createAssignment, uploadAssignmentDoc, reviewAssignmentDoc } from '../controllers/assignmentController.js';

const router = express.Router();

/**
 * @route   POST /api/v1/assignments/template/:templateSid
 * @desc    Desglosa e indexa individualmente las filas de una plantilla vinculándolas a un Downloader.
 * @access  Private (ADMIN, UPLOADER)
 */
router.post('/template/:templateSid',
	stopGuest,
	requireRole(['ADMIN', 'UPLOADER']),
	createAssignment
);

/**
 * @route   PATCH /api/v1/assignments/upload
 * @desc    Atiende una fila específica subiendo el documento solicitado.
 * @access  Private (DOWNLOADER)
 */
router.post('/upload',
	stopGuest,
	requireRole(['DOWNLOADER']),
	uploadDocument, // Multer procesa el form-data completo (archivo y campos de texto)
	uploadAssignmentDoc
);

/**
 * @route   PATCH /api/v1/assignments/review
 * @desc    Aprueba o rechaza el documento de una fila indexada.
 * @access  Private (ADMIN, UPLOADER)
 */
router.patch('/review',
	stopGuest,
	requireRole(['ADMIN', 'UPLOADER']),
	reviewAssignmentDoc
);

export default router;
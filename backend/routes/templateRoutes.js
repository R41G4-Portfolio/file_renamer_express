// /routes/templateRoutes.js
import express from 'express';
import { stopGuest } from '../middleware/validations.js';
import requireRole from '../middleware/rbacMiddleware.js';
import { uploadExcel } from '../middleware/uploadMiddleware.js';

import { 
	uploadTemplate, 
	getTemplates, 
	getTemplateBySid,
	assignTemplate,
	approveTemplate,
	cancelTemplate,
	downloadEmptyTemplate,
	downloadTemplateExcel
} from '../controllers/templateController.js';

const router = express.Router();

// Plantilla base (archivo fijo)
router.get('/download-template', 
	stopGuest, 
	requireRole(['ADMIN', 'UPLOADER', 'DOWNLOADER']),
	downloadEmptyTemplate
);

// Excel original del template (parámetro al final)
router.get('/download-excel/:sid',
	stopGuest,
	requireRole(['ADMIN', 'UPLOADER', 'DOWNLOADER']),
	downloadTemplateExcel
);


/**
 * @route   GET /api/v1/templates
 * @desc    Lista las solicitudes filtrando por pertenencia (excepto ADMIN).
 * @access  Private (ADMIN, UPLOADER)
 */
router.get('/', 
	stopGuest, // Reemplaza al inexistente authMiddleware
	requireRole(['ADMIN', 'UPLOADER']), 
	getTemplates
);

/**
 * @route   GET /api/v1/templates/:sid
 * @desc    Obtiene el detalle completo de un template por su SID.
 * @access  Private (ADMIN, UPLOADER)
 */
router.get('/:sid', 
	stopGuest, 
	requireRole(['ADMIN', 'UPLOADER']), 
	getTemplateBySid
);

/**
 * @route   POST /api/v1/templates/upload
 * @desc    Crea una nueva solicitud a partir del procesamiento y firmado del Excel.
 * @access  Private (ADMIN, UPLOADER)
 */
router.post('/upload', 
	stopGuest, 
	requireRole(['ADMIN', 'UPLOADER']), 
	uploadExcel, 
	uploadTemplate
);

/**
 * @route   POST /api/v1/templates/:sid/approve
 * @desc    Finaliza el flujo transmutando el estado a COMPLETED.
 * @access  Private (ADMIN, UPLOADER)
 */
router.patch('/:sid/approve', 
	stopGuest, 
	requireRole(['ADMIN', 'UPLOADER']), 
	approveTemplate
);

/**
 * @route   PATCH /api/v1/templates/:sid
 * @desc    Cancelación lógica del registro (No se hace limpieza en disco del template ni de collection)
 * @access  Private (ADMIN, UPLOADER)
 */
router.patch('/:sid', 
	stopGuest, 
	requireRole(['ADMIN', 'UPLOADER']), 
	cancelTemplate
);

router.put('/:sid/assign',
	stopGuest,
	requireRole(['ADMIN', 'UPLOADER']),
	assignTemplate
);

export default router;
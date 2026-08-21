// /routes/zipRoutes.js
import express from 'express';
import { generateZip, downloadZip } from '../controllers/zipController.js';
import { stopGuest } from '../middleware/validations.js'; // El que valida el JWT
import requireRole from '../middleware/rbacMiddleware.js'; // El que valida el Rol

const router = express.Router();

// Generar ZIP: Solo ADMIN y UPLOADER deberían poder disparar la compresión final
router.post('/generate/:templateSid', 
	stopGuest, 
	requireRole(['ADMIN', 'UPLOADER']), 
	generateZip
);

// Descargar ZIP: Acceso para los roles que gestionan la entrega
router.get('/download/:templateSid', 
	stopGuest, 
	requireRole(['ADMIN', 'UPLOADER']), 
	downloadZip
);

export default router;
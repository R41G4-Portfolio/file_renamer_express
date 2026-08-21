import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/index.js';
import Template from '../models/Templates.js';
import { templateResponses } from '../governance/templateGovernance.js';

import { 
	executeUpload, 
	executeListByOwner, 
	executeGetDetail, 
	executeCancellation,
	executeAssignment,
	executeApproval
} from '../commands/templateWorkflow.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
	Template Controller: Orquestador de solicitudes de plantillas y reglas de renombrado.
	Delega la lógica pesada (Excel, FS, BD) al Workflow.
	Delega la estructura de respuesta y códigos HTTP a Governance.

	POST / - Sube un Excel y crea la solicitud con sus reglas.
*/
export const uploadTemplate = async (req, res) => {
	try {
		// 1. Extraemos datos del archivo y el cuerpo
		const { file } = req;
		const { title, assignedTo } = req.body;

		// 2. Ejecución del Workflow: delegamos procesamiento de Excel y creación en BD
		const result = await executeUpload(req, file, title, assignedTo);

		// 3. Respuesta de éxito vía Governance
		const response = templateResponses.uploadSuccess(result);
		return res.status(response.status).json(response.body);

	} catch (error) {
		// Mapeo de errores semánticos definidos en el Workflow
		if (error.message === 'FILE_REQUIRED')
		{
			const response = templateResponses.fileMissing();
			return res.status(response.status).json(response.body);
		}

		if (error.message === 'INVALID_TEMPLATE_STRUCTURE')
		{
			// Este error puede devolver un buffer con el Excel de errores
			const response = templateResponses.invalidStructure(error.details);
			return res.status(response.status).send(response.body);
		}

		console.error('[TEMPLATE_CONTROLLER_UPLOAD_ERROR]', error.message);
		const response = templateResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};

/*
	GET / - Lista solicitudes filtradas por propiedad o rol.
*/
export const getTemplates = async (req, res) => {
	try {
		const { sid, role } = req.user;

		const result = await executeListByOwner(req, sid, role);

		const response = templateResponses.listSuccess(result);
		return res.status(response.status).json(response.body);

	} catch (error) {
		console.error('[TEMPLATE_CONTROLLER_LIST_ERROR]', error.message);
		const response = templateResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};

/*
	GET /:sid - Detalle de una solicitud específica.
*/
export const getTemplateBySid = async (req, res) => {
	try {
		const { sid: templateSid } = req.params;
		const { sid: userSid, role } = req.user;

		const result = await executeGetDetail(req, templateSid, userSid, role);

		console.log('req.user:', req.user); 
		const response = templateResponses.detailSuccess(result);
		return res.status(response.status).json(response.body);

	} catch (error) {
		if (error.message === 'TEMPLATE_NOT_FOUND') {
			const response = templateResponses.notFound();
			return res.status(response.status).json(response.body);
		}

		if (error.message === 'ACCESS_DENIED') {
			const response = templateResponses.forbidden();
			return res.status(response.status).json(response.body);
		}

		console.error('[TEMPLATE_CONTROLLER_DETAIL_ERROR]', error.message);
		const response = templateResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};

/*
	DELETE /:sid - Cancelación lógica y limpieza de archivos.
*/
export const cancelTemplate = async (req, res) => {
	try {
		const { sid: templateSid } = req.params;
		const { sid: userSid, role } = req.user;

		await executeCancellation(req, templateSid, userSid, role);

		const response = templateResponses.cancelSuccess();
		return res.status(response.status).json(response.body);

	} catch (error) {
		if (error.message === 'TEMPLATE_NOT_FOUND') {
			const response = templateResponses.notFound();
			return res.status(response.status).json(response.body);
		}

		console.error('[TEMPLATE_CONTROLLER_CANCEL_ERROR]', error.message);
		const response = templateResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};

// PUT /:sid/assign - Vincula un usuario DOWNLOADER a la solicitud.
export const assignTemplate = async (req, res) => {
	try {
		const { sid: templateSid } = req.params;
		const { assignedTo } = req.body; 
		const { sid: userSid, role } = req.user;

		const result = await executeAssignment(req, templateSid, assignedTo, userSid, role);

		const response = templateResponses.reassignSuccess();
		return res.status(response.status).json(response.body);

	} catch (error) {
		if (error.message === 'TEMPLATE_NOT_FOUND') {
			const response = templateResponses.notFound();
			return res.status(response.status).json(response.body);
		}
		if (error.message === 'ACCESS_DENIED') {
			const response = templateResponses.forbidden();
			return res.status(response.status).json(response.body);
		}

		console.error('[TEMPLATE_CONTROLLER_ASSIGN_ERROR]', error.message);
		const response = templateResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};

// POST /:sid/approve - Finaliza el flujo transmutando el estado a COMPLETED.
export const approveTemplate = async (req, res) => {
	try {
		const { sid: templateSid } = req.params;
		const { sid: userSid, role } = req.user;

		const result = await executeApproval(req, templateSid, userSid, role);

		const response = templateResponses.approveSuccess(result);
		return res.status(response.status).json(response.body);

	} catch (error) {
		if (error.message === 'TEMPLATE_NOT_FOUND') {
			const response = templateResponses.notFound();
			return res.status(response.status).json(response.body);
		}
		if (error.message === 'PENDING_ASSIGNMENTS') {
			const response = templateResponses.invalidWorkflowState('Hay archivos o tareas pendientes por cargar.');
			return res.status(response.status).json(response.body);
		}

		console.error('[TEMPLATE_CONTROLLER_APPROVE_ERROR]', error.message);
		const response = templateResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};



/*
	Descarga plantilla base (archivo fijo)
*/
export const downloadEmptyTemplate = async (req, res) => {
	try {
		const templatePath = path.join(process.cwd(), config.emptyTemplatePath);
		
		if (!fs.existsSync(templatePath)) {
			return res.status(404).json({ error: 'Plantilla base no encontrada' });
		}
		
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=plantilla_base.xlsx');
		
		return res.sendFile(templatePath);  // <-- Enviar archivo, no JSON
	} catch (error) {
		console.error('[DOWNLOAD_EMPTY_TEMPLATE_ERROR]', error.message);
		return res.status(500).json({ error: 'Error al descargar la plantilla' });
	}
};

/*
	Descarga el Excel original que subió el UPLOADER
*/
export const downloadTemplateExcel = async (req, res) => {
	try {
		const { sid } = req.params;
		const userSid = req.user.sid;
		const userRole = req.user.role;

		const template = await Template.findOne({ sid }).lean();
		if (!template)
			return res.status(404).json({ error: 'Plantilla no encontrada' });

		const isOwner = template.uploadedBy === userSid;
		const isAdmin = userRole === 'ADMIN';
		const isAssignedDownloader = template.assignedTo === userSid;

		if (!isOwner && !isAdmin && !isAssignedDownloader)
			return res.status(403).json({ error: 'No autorizado' });

		const filePath = path.join(process.cwd(), template.excelFilePath);
		
		if (!fs.existsSync(filePath))
			return res.status(404).json({ error: 'El archivo Excel ya no existe en el servidor' });

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', `attachment; filename=${template.excelFileName}`);
		
		return res.sendFile(filePath);  // <-- Enviar archivo, no JSON
	}
	catch (error)
	{
		console.error('[DOWNLOAD_TEMPLATE_EXCEL_ERROR]', error.message);
		return res.status(500).json({ error: 'Error al descargar el archivo' });
	}
};
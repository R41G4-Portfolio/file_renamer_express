import Assignment from '../models/Assignments.js';
import Template from '../models/Templates.js';
import * as auditQueries from '../queries/auditQueries.js';
import * as assignmentWorkflow from '../commands/assignmentWorkflow.js';
import { assignmentResponses } from '../governance/assignmentGovernance.js';

export const createAssignment = async (req, res) => {
	try
	{
		const { templateSid } = req.params;
		const { assignedTo } = req.body;

		const result = await assignmentWorkflow.executeTemplateAssignment(req, templateSid, assignedTo);

		const response = assignmentResponses.assignSuccess(result);
		return res.status(response.status).json(response.body);

	}
	catch (error)
	{
		if (error.message === 'ASSIGNED_TO_REQUIRED')
		{
			const response = assignmentResponses.assignedToRequired();
			return res.status(response.status).json(response.body);
		}

		if (error.message === 'TEMPLATE_NOT_FOUND')
		{
			const response = assignmentResponses.templateNotFound();
			return res.status(response.status).json(response.body);
		}

		if (error.message === 'ALREADY_ASSIGNED')
		{
			const response = assignmentResponses.alreadyAssigned();
			return res.status(response.status).json(response.body);
		}

		const response = assignmentResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};

/**
 * Procesa la subida y almacenamiento del documento para una fila específica.
 * @param {Object} req - Objeto de petición HTTP Express.
 * @param {Object} res - Objeto de respuesta HTTP Express.
 * @returns {Promise<Object>} Respuesta JSON con los metadatos del archivo indexado.
 */
export const uploadAssignmentDoc = async (req, res) => {
	try 
	{
		const { templateSid, rowIndex } = req.body;
		const file = req.file;

		const result = await assignmentWorkflow.executeAssignmentUpload(req, templateSid, rowIndex, file);

		// Blindamos el mapeo hacia la gobernanza usando cortocircuitos por si el DAO/Query usa nombres distintos en BD
		const response = assignmentResponses.uploadDocSuccess({
			sid: result?.sid,
			templateSid: result?.templateSid || templateSid,
			rowIndex: result?.rowIndex || rowIndex,
			status: result?.status,
			originalName: result?.originalName || file?.originalname,
			sha256: result?.sha256 || result?.fileHash
		});
		
		return res.status(response.status).json(response.body);

	}
	catch (error)
	{
		// Evaluamos primero las fallas de petición de datos obligatorios
		if (error.message === 'MISSING_REQUIRED_FIELDS')
		{
			const response = assignmentResponses.missingFields();
			return res.status(response.status).json(response.body);
		}

		if (error.message === 'FILE_REQUIRED')
		{
			const response = assignmentResponses.fileRequired();
			return res.status(response.status).json(response.body);
		}

		// Evaluamos las reglas de negocio de la asignación
		if (error.message === 'ASSIGNMENT_NOT_FOUND')
		{
			const response = assignmentResponses.assignmentNotFound();
			return res.status(response.status).json(response.body);
		}

		if (error.message === 'ACCESS_DENIED')
		{
			const response = assignmentResponses.accessDenied();
			return res.status(response.status).json(response.body);
		}

		if (error.message === 'INVALID_STATUS_FOR_UPLOAD')
		{
			const response = assignmentResponses.invalidStatusForUpload();
			return res.status(response.status).json(response.body);
		}

		// Si cae aquí, es un error real de JS (como leer una propiedad de algo undefined). 
		// Lo mandamos al log para que lo puedas auditar en tu consola.
		console.error('[CRITICAL CONTROLLER ERROR]:', error);

		const response = assignmentResponses.uploadInternalError();
		return res.status(response.status).json(response.body);
	}
};

/**
 * Procesa la decisión del Administrador o Uploader (Aprobar/Rechazar) sobre un documento.
 * @param {Object} req - Objeto de petición HTTP Express.
 * @param {Object} res - Objeto de respuesta HTTP Express.
 */
export const reviewAssignmentDoc = async (req, res) => {
	try {
		const { assignmentSid, status, comments, templateSid, rowIndex } = req.body;
		
		console.log('reviewAssignmentDoc - Datos recibidos:', { assignmentSid, status, comments, templateSid, rowIndex });
		
		// Validar campos requeridos
		if (!assignmentSid || !status || !templateSid || rowIndex === undefined) {
			return res.status(400).json({ error: 'Faltan campos requeridos: assignmentSid, status, templateSid, rowIndex' });
		}
		
		// Buscar el assignment
		const assignment = await Assignment.findOne({ sid: assignmentSid });
		if (!assignment) {
			return res.status(404).json({ error: 'Asignación no encontrada' });
		}
		
		// Verificar permisos (opcional, el middleware ya lo hace)
		const userRole = req.user.role || req.user.rol;
		if (userRole !== 'ADMIN' && userRole !== 'UPLOADER') {
			return res.status(403).json({ error: 'No autorizado' });
		}
		
		// Actualizar el assignment
		assignment.status = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
		assignment.comments = comments || null;
		assignment.reviewedAt = new Date();
		assignment.reviewedBy = req.user.sid;
		
		await assignment.save();
		
		// Si es rechazado, opcionalmente mover el archivo
		if (status === 'REJECTED') {
			// Lógica de rechazo si es necesaria
		}
		
		// Registrar auditoría
		await auditQueries.logEvent({
			userId: req.user.sid,
			action: status === 'APPROVED' ? 'APPROVE_FILE' : 'REJECT_FILE',
			targetId: assignmentSid,
			ipAddress: req.ip || null,
			userAgent: req.headers['user-agent'] || null,
			details: { templateSid, rowIndex, comments }
		});
		
		return res.status(200).json({ success: true, message: `Documento ${status === 'APPROVED' ? 'aprobado' : 'rechazado'}` });
		
	} catch (error) {
		console.error('[REVIEW_ASSIGNMENT_ERROR]', error.message);
		return res.status(500).json({ error: 'Error al revisar el documento' });
	}
};
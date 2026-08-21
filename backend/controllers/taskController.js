import path from 'path';
import fs from 'fs';
import Assignment from '../models/Assignments.js';
import Template from '../models/Templates.js';

import { executeGetMyTemplates, executeGetMyTasks } from '../executions/taskWorkflow.js';
import { taskResponses } from '../governance/taskGovernance.js';


export const getMyTemplates = async (req, res) => {
	try {
		const userSid = req.user.sid;
		const userRole = req.user.role; 
		const templates = await executeGetMyTemplates(userSid);
		const response = taskResponses.listSuccess(templates);
		return res.status(response.status).json(response.body);
	} catch (error) {
		console.error('[TASK_CONTROLLER_ERROR]', error.message);
		const response = taskResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};

export const viewFile = async (req, res) => {
	try {
		const { assignmentId } = req.params;
		const userSid = req.user.sid;
		const userRole = req.user.role;
		
		const assignment = await Assignment.findOne({ sid: assignmentId }).lean();
		
		if (!assignment) {
			return res.status(404).json({ error: 'Archivo no encontrado' });
		}
		
		// Verificar permisos
		const isOwner = assignment.assignedTo === userSid;
		const isAdmin = userRole === 'ADMIN';
		const isUploader = userRole === 'UPLOADER';
		
		if (!isOwner && !isAdmin && !isUploader) {
			return res.status(403).json({ error: 'No autorizado' });
		}
		
		if (!assignment.filePath) {
			return res.status(404).json({ error: 'El archivo no ha sido subido aún' });
		}
		
		const fullPath = path.join(process.cwd(), assignment.filePath);
		
		if (!fs.existsSync(fullPath)) {
			return res.status(404).json({ error: 'Archivo no existe en el servidor' });
		}
		
		// Obtener el nombre original o desiredName
		// Necesitamos el template para obtener el desiredName
		const template = await Template.findOne({ sid: assignment.templateSid }).lean();
		const rule = template?.renamingRules?.find(r => r.rowIndex === assignment.rowIndex);
		const fileName = rule?.desiredName || assignment.originalName || `${assignmentId}.pdf`;
		
		// Configurar header para que el navegador use el nombre correcto
		res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
		
		return res.sendFile(fullPath);
		
	} catch (error) {
		console.error('[VIEW_FILE_ERROR]', error.message);
		return res.status(500).json({ error: 'Error al obtener el archivo' });
	}
};

export const getMyTasks = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const userSid = req.user.sid;
		const userRole = req.user.role;  // solo role
		
		const result = await executeGetMyTasks(userSid, userRole, page, limit);
		const response = taskResponses.listSuccess(result);
		return res.status(response.status).json(response.body);
	} catch (error) {
		console.error('[TASK_CONTROLLER_GET_MY_TASKS_ERROR]', error.message);
		const response = taskResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};
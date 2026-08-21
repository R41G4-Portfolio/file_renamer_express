import { zipResponses } from '../governance/zipGovernance.js';
import { executeZipGeneration } from '../executions/zipWorkflow.js';
import * as zipQueries from '../queries/zipQueries.js';
import fs from 'fs-extra';
import path from 'path';

export const generateZip = async (req, res) => {
	try {
		const { templateSid } = req.params;
		
		// La ejecución maneja validaciones, caché y seguridad de hilos
		const result = await executeZipGeneration(templateSid, req.user);
		
		const response = zipResponses.generateSuccess(result);
		return res.status(response.status).json(response.body);

	} catch (error) {
		// Mapeo de errores conocidos a respuestas de gobernanza
		if (error.message === 'TEMPLATE_NOT_FOUND') return res.status(404).json(zipResponses.zipNotFound().body);
		if (error.message === 'INCOMPLETE_OR_UNAPPROVED_ASSIGNMENTS') return res.status(400).json(zipResponses.incompleteAssignments().body);
		if (error.message === 'ZIP_GENERATION_IN_PROGRESS') return res.status(423).json(zipResponses.processingInProgress().body);
		
		console.error(`[ZIP_CONTROLLER_ERROR]: ${error.message}`);
		const errRes = zipResponses.internalError(error);
		return res.status(errRes.status).json(errRes.body);
	}
};

export const downloadZip = async (req, res) => {
	try {
		const { templateSid } = req.params;
		const template = await zipQueries.findTemplateBySidForZip(templateSid);

		if (!template || !template.zipPath || !fs.existsSync(template.zipPath)) {
			const errRes = zipResponses.zipNotFound();
			return res.status(errRes.status).json(errRes.body);
		}

		// Podríamos añadir validación de permisos aquí si es necesario (RBAC)
		
		const fileName = `entrega_${templateSid.substring(0, 8)}.zip`;
		return res.download(template.zipPath, fileName);

	} catch (error) {
		const errRes = zipResponses.internalError(error);
		return res.status(errRes.status).json(errRes.body);
	}
};
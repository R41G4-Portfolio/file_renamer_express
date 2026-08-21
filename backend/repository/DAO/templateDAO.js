import { randomUUID } from 'crypto';
import { generatePublicSid } from '../../utils/templateHelpers.js';

/*
	DAO: Transforma datos de entrada en estructuras para la persistencia.
	Recibe parámetros limpios y estructurados; no genera lógica interna de rutas.
*/

export const createTemplateDAO = (uploadedBy, excelFileName, excelFilePath, title, rowCount, renamingRules, assignedTo = null) => ({
	sid: randomUUID(),
	title,
	uploadedBy,
	assignedTo,  // <-- Agregar
	excelFileName,
	excelFilePath,
	rowCount,
	renamingRules,
	status: 'ACTIVE',
	schemaVersion: 1
});

export const createAssignmentDAO = (templateSid, rowIndex, rule) => {
	return {
		sid: generatePublicSid(),
		templateSid: templateSid,
		rowIndex: rowIndex,
		folderPath: rule.folderPath,
		desiredName: rule.desiredName,
		status: 'PENDING'
	};
};
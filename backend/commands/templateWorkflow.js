import crypto from 'crypto';
import config from '../config/index.js';
import fs from 'fs-extra';
import path from 'path';

import * as templateQueries from '../queries/templateQueries.js';
import * as auditQueries from '../queries/auditQueries.js'; 
import * as templateDAO from '../repository/DAO/templateDAO.js';
import * as templateDTO from '../repository/DTO/templateDTO.js';

import { processExcelRules } from '../utils/templateHelpers.js';

/*
	WORKFLOW / COMMANDS: Núcleo de orquestación de flujos complejos.
	Gobierna la lógica de negocio, validaciones y transformación de entornos.
*/

/*
	Comportamiento 1: Carga de plantilla Excel.
	Calcula la ruta relativa e invoca al DAO pasivo.
*/
export const executeUpload = async (req, file, title, assignedTo = null) => {
    try {
        const { rowCount, renamingRules } = await processExcelRules(file.path);

        if (rowCount > config.maxExcelRows) {
            if (fs.existsSync(file.path)) {
                await fs.unlink(file.path);
            }
            throw new Error('EXCEL_ROWS_EXCEEDED');
        }

        const relativeFilePath = path.relative(process.cwd(), file.path);

        // Crear template con assignedTo
        const templateObject = templateDAO.createTemplateDAO(
            req.user.sid,
            file.originalname,
            relativeFilePath,
            title,
            rowCount,
            renamingRules,
            assignedTo  // <-- Pasar assignedTo
        );

        const finalPersistData = {
            ...templateObject,
            renamingRules: templateObject.renamingRules.map((rule, index) => ({
                ...rule,
                rowIndex: index + 2
            }))
        };

        const newTemplate = await templateQueries.saveTemplate(finalPersistData);
        const targetSid = newTemplate.sid;

        // Crear assignments con el mismo assignedTo
        const assignmentsToCreate = renamingRules.map((rule, index) => ({
            sid: crypto.randomUUID(),
            templateSid: targetSid,
            rowIndex: index + 2,
            assignedTo: assignedTo,  // <-- Asignar a todas las filas
            status: 'PENDING',
            originalName: null,
            sha256: null,
            filePath: null,
            comments: null,
            schemaVersion: 1
        }));

        if (assignmentsToCreate.length > 0) {
            await templateQueries.saveBulkAssignments(assignmentsToCreate);
        }

        await auditQueries.logEvent({
            userId: req.user.sid,
            action: 'UPLOAD_TEMPLATE',
            targetId: targetSid,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
            details: { title, rowCount, assignedTo }
        });

        return {
            sid: targetSid,
            rowCount
        };
    } catch (error) {
        console.error(`[COMMAND ERROR] Fallo en executeUpload: ${error.message}`);
        throw error;
    }
};

/*
	Orquesta la obtención del listado con paginación y filtrado DTO.
*/
export const executeListByOwner = async (req, userSid, role) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const ownerSid = (role === 'ADMIN' ? null : userSid);
	
	const result = await templateQueries.fetchTemplatesByOwner(ownerSid, page, limit);

	return {
		...result,
		data: templateDTO.templateListDTO(result.data)
	};
};

/*
	Orquesta el detalle de una solicitud, validando propiedad pública (SID).
*/
export const executeGetDetail = async (req, templateSid, userSid, role) => {
	const template = await templateQueries.fetchTemplateWithAssignments(templateSid);
	if (!template) throw new Error('TEMPLATE_NOT_FOUND');

	console.log('DEBUG executeGetDetail:', {
		userSid,
		role,
		templateUploadedBy: template.uploadedBy,
		sonIguales: template.uploadedBy === userSid
	});

	if (role !== 'ADMIN' && template.uploadedBy !== userSid) {
		throw new Error('ACCESS_DENIED');
	}

	return templateDTO.templateDetailDTO(template);
};

/*
	Orquesta la cancelación de la solicitud y su registro histórico.
*/
export const executeCancellation = async (req, templateSid, userSid, role) => {
	const { reason } = req.body;
	if (!reason) throw new Error('REASON_REQUIRED');

	const template = await templateQueries.fetchTemplateBySid(templateSid);
	if (!template) throw new Error('TEMPLATE_NOT_FOUND');

	if (role !== 'ADMIN' && template.uploadedBy !== userSid) {
		throw new Error('ACCESS_DENIED');
	}

	await templateQueries.cancelTemplateWithReason(templateSid, reason);

	await auditQueries.logEvent({
		userId: userSid,
		action: 'CANCEL_TEMPLATE',
		targetId: templateSid,
		ipAddress: req.ip || null,
		userAgent: req.headers['user-agent'] || null,
		details: { reason }
	});

	return true;
};

/*
	Orquesta la asignación de un usuario DOWNLOADER a la plantilla.
	Usa la query real reassignTemplateUser.
*/
export const executeAssignment = async (req, templateSid, assignedTo, userSid, role) => {
	const template = await templateQueries.fetchTemplateBySid(templateSid);
	if (!template) throw new Error('TEMPLATE_NOT_FOUND');

	if (role !== 'ADMIN' && template.uploadedBy !== userSid) {
		throw new Error('ACCESS_DENIED');
	}

	await templateQueries.reassignTemplateUser(templateSid, assignedTo);
	
	await auditQueries.logEvent({
		userId: userSid,
		action: 'ASSIGN_TEMPLATE',
		targetId: templateSid,
		ipAddress: req.ip || null,
		userAgent: req.headers['user-agent'] || null,
		details: { assignedTo }
	});

	const updatedTemplate = await templateQueries.fetchTemplateWithAssignments(templateSid);
	return templateDTO.templateDetailDTO(updatedTemplate);
};

/*
	Comportamiento 2: Cierre definitivo del flujo.
	Mueve físicamente el archivo Excel resolviendo desde la ruta relativa del esquema.
*/
export const executeApproval = async (req, templateSid, userSid, role) => {
	const template = await templateQueries.fetchTemplateWithAssignments(templateSid);
	if (!template) throw new Error('TEMPLATE_NOT_FOUND');

	if (role !== 'ADMIN' && template.uploadedBy !== userSid) {
		throw new Error('ACCESS_DENIED');
	}

	const hasPending = template.assignments && template.assignments.some(asm => asm.status !== 'COMPLETED');
	if (hasPending) {
		throw new Error('PENDING_ASSIGNMENTS');
	}

	// Traslado físico usando el campo unificado excelFilePath
	if (template.excelFilePath) {
		const currentPath = path.join(process.cwd(), template.excelFilePath);
		
		if (fs.existsSync(currentPath)) {
			const processedFolder = path.join(process.cwd(), config.processedExcelDir);
			await fs.ensureDir(processedFolder);

			const targetPath = path.join(processedFolder, path.basename(template.excelFilePath));
			await fs.move(currentPath, targetPath);
		}
	}

	await templateQueries.updateTemplateStatus(templateSid, 'COMPLETED');

	await auditQueries.logEvent({
		userId: userSid,
		action: 'APPROVE_TEMPLATE',
		targetId: templateSid,
		ipAddress: req.ip || null,
		userAgent: req.headers['user-agent'] || null,
		details: { finalStatus: 'COMPLETED' }
	});

	return {
		sid: templateSid,
		status: 'COMPLETED'
	};
};
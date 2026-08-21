import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import config from '../config/index.js';

import * as templateQueries from '../queries/templateQueries.js';
import * as assignmentQueries from '../queries/assignmentQueries.js';
import * as assignmentDAO from '../repository/DAO/assignmentDAO.js';
import * as auditQueries from '../queries/auditQueries.js';

/**
 * Desglosa las reglas de una plantilla e indexa las filas individualmente vinculándolas a un Downloader.
 * @param {Object} req - Objeto de petición de Express.
 * @param {string} templateSid - Identificador único de la plantilla madre.
 * @param {string} assignedTo - SID del Downloader responsable.
 * @returns {Promise<Object>} Resumen de las tareas insertadas en la base de datos.
 */
export const executeTemplateAssignment = async (req, templateSid, assignedTo) => {
    try 
    {
        if (!assignedTo) 
            throw new Error('ASSIGNED_TO_REQUIRED');

        const template = await templateQueries.fetchTemplateBySid(templateSid);
        if (!template) 
            throw new Error('TEMPLATE_NOT_FOUND');

        const hasAssignments = await assignmentQueries.checkExistingAssignments(templateSid);
        if (hasAssignments) 
            throw new Error('ALREADY_ASSIGNED');

        const assignmentsToPersist = template.renamingRules.map(rule => 
            assignmentDAO.createAssignmentDAO(template.sid, assignedTo, rule.rowIndex)
        );

        const savedAssignments = await assignmentQueries.saveBulkAssignments(assignmentsToPersist);

        await auditQueries.logEvent({
            userId: req.user.sid,
            action: 'ASSIGN_TEMPLATE',
            targetId: templateSid,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
            details: { 
                assignedTo,
                totalRowsAssigned: savedAssignments.length 
            }
        });

        return {
            templateSid: template.sid,
            assignedTo,
            totalTasks: savedAssignments.length
        };
    } 
    catch (error) 
    {
        console.error(`[COMMAND ERROR] Fallo en executeTemplateAssignment: ${error.message}`);
        throw error;
    }
};

/**
 * Helper criptográfico para calcular el hash SHA256 de un archivo en disco mediante streams.
 * @param {string} filePath - Ruta del archivo temporal.
 * @returns {Promise<string>} Hash en formato hexadecimal.
 */
const calculateSHA256 = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
};

/**
 * Orquesta la validación de negocio, cálculo de integridad y movimiento físico a la carpeta del lote.
 * @param {Object} req - Objeto de petición de Express.
 * @param {string} templateSid - Identificador único de la plantilla madre.
 * @param {number|string} rowIndex - Índice de la fila a atender.
 * @param {Object} file - Objeto del archivo procesado por el middleware.
 * @returns {Promise<Object>} Documento de la asignación actualizado.
 */
export const executeAssignmentUpload = async (req, templateSid, rowIndex, file) => {
    try
    {
        if (!templateSid || !rowIndex)
            throw new Error('MISSING_REQUIRED_FIELDS');

        if (!file)
            throw new Error('FILE_REQUIRED');

        const assignment = await assignmentQueries.fetchAssignmentByRow(templateSid, rowIndex);
        if (!assignment)
            throw new Error('ASSIGNMENT_NOT_FOUND');

        if (assignment.assignedTo !== req.user.sid)
            throw new Error('ACCESS_DENIED');

        if (!['PENDING', 'FAILED'].includes(assignment.status))
            throw new Error('INVALID_STATUS_FOR_UPLOAD');

        const fileHash = await calculateSHA256(file.path);

        const targetDir = path.join(config.requestDocsDir || 'uploads/documents', templateSid);
        
        if (!fs.existsSync(targetDir))
            fs.mkdirSync(targetDir, { recursive: true });

        const timeStamp = Date.now();
        const fileExtension = path.extname(file.originalname);
        const safeFileName = `row_${rowIndex}_${timeStamp}${fileExtension}`;
        const finalPath = path.join(targetDir, safeFileName);

        await fs.promises.rename(file.path, finalPath);

        const updateData = assignmentDAO.createUploadUpdateDAO(file, finalPath, fileHash);
        const updatedAssignment = await assignmentQueries.updateAssignmentUpload(templateSid, rowIndex, updateData);

        await auditQueries.logEvent({
            userId: req.user.sid,
            action: 'UPLOAD_FILE',
            targetId: updatedAssignment.sid,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
            details: { templateSid, rowIndex, sha256: fileHash, path: finalPath }
        });

        return updatedAssignment;

    }
    catch (error)
    {
        if (file && fs.existsSync(file.path))
        {
            try
            { 
                await fs.promises.unlink(file.path); 
            }
            catch (cleanupError)
            { 
                console.error('Error al limpiar archivo temporal:', cleanupError); 
            }
        }
        console.error(`[COMMAND ERROR] Fallo en executeAssignmentUpload: ${error.message}`);
        throw error;
    }
};

/**
 * Orquesta la revisión (aprobación o rechazo) de un documento entregado.
 * @param {Object} req - Objeto de petición de Express.
 * @param {string} templateSid - Identificador único de la plantilla madre.
 * @param {number|string} rowIndex - Índice de la fila a revisar.
 * @param {string} actionType - 'APPROVE' o 'REJECT'.
 * @param {string} [rejectionReason] - Motivo del rechazo (obligatorio si actionType es REJECT).
 * @returns {Promise<Object>} Documento de la asignación actualizado.
 */
/*
export const executeAssignmentReview = async (req, templateSid, rowIndex, actionType, rejectionReason) => {
    try 
    {
        if (!templateSid || !rowIndex || !actionType)
            throw new Error('MISSING_REQUIRED_FIELDS');

        const assignment = await assignmentQueries.fetchAssignmentByRow(templateSid, rowIndex);
        if (!assignment)
            throw new Error('ASSIGNMENT_NOT_FOUND');

        if (assignment.status !== 'UPLOADED')
            throw new Error('INVALID_STATUS_FOR_REVIEW');

        if (!['APPROVE', 'REJECT'].includes(actionType))
            throw new Error('INVALID_REVIEW_ACTION');

        let nextStatus = 'APPROVED';
        let reviewNotes = null;

        if (actionType === 'REJECT') 
        {
            if (!rejectionReason || rejectionReason.trim() === '')
                throw new Error('REJECTION_REASON_REQUIRED');
            
            if (!assignment.filePath)
                throw new Error('ASSIGNMENT_FILE_PATH_NOT_FOUND');

            nextStatus = 'REJECTED';
            reviewNotes = rejectionReason.trim();

            const rejectedBaseDir = process.env.REJECTED_DOCS_DIR || 'uploads/rejected';
            const targetFolder = path.join(rejectedBaseDir, templateSid);
            const fileName = path.basename(assignment.filePath);
            const finalRejectedPath = path.join(targetFolder, fileName);

            if (!fs.existsSync(targetFolder)) 
                fs.mkdirSync(targetFolder, { recursive: true });

            if (!fs.existsSync(assignment.filePath)) 
                throw new Error(`ORIGIN_FILE_NOT_FOUND_ON_DISK: ${assignment.filePath}`);

            await fs.promises.rename(assignment.filePath, finalRejectedPath);
            assignment.filePath = finalRejectedPath;
        }

        const reviewData = {
            status: nextStatus,
            reviewedAt: new Date(),
            reviewedBy: req.user.sid,
            comments: reviewNotes,
            filePath: assignment.filePath
        };

        const updatedAssignment = await assignmentQueries.updateAssignmentReview(templateSid, rowIndex, reviewData);

        await auditQueries.logEvent({
            userId: req.user.sid,
            action: nextStatus === 'APPROVED' ? 'APPROVE_FILE' : 'REJECT_FILE',
            targetId: updatedAssignment.sid,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
            details: { 
                templateSid, 
                rowIndex, 
                transition: `UPLOADED_TO_${nextStatus}`,
                reason: reviewNotes 
            }
        });

        return updatedAssignment;

    } 
    catch (error) 
    {
        console.error(`[COMMAND ERROR] Fallo en executeAssignmentReview: ${error.message}`);
        throw error;
    }
};
*/

export const executeAssignmentReview = async (req, templateSid, rowIndex, actionType, rejectionReason) => {
    try 
    {
        // 1. Validaciones de entrada (Early Return)
        if (!templateSid || !rowIndex || !actionType)
            throw new Error('MISSING_REQUIRED_FIELDS');

        const assignment = await assignmentQueries.fetchAssignmentByRow(templateSid, rowIndex);
        if (!assignment)
            throw new Error('ASSIGNMENT_NOT_FOUND');

        if (assignment.status !== 'UPLOADED')
            throw new Error('INVALID_STATUS_FOR_REVIEW');

        if (!['APPROVE', 'REJECT'].includes(actionType))
            throw new Error('INVALID_REVIEW_ACTION');

        let nextStatus;
        let reviewNotes = null;

        // --- CASO: APROBACIÓN ---
        if (actionType === 'APPROVE') 
        {
            nextStatus = 'APPROVED';
            // No movemos archivos aquí, solo marcamos como listo para el renombrado final.
        }

        // --- CASO: RECHAZO ---
        else if (actionType === 'REJECT') 
        {
            if (!rejectionReason || rejectionReason.trim() === '')
                throw new Error('REJECTION_REASON_REQUIRED');
            
            if (!assignment.filePath)
                throw new Error('ASSIGNMENT_FILE_PATH_NOT_FOUND');

            nextStatus = 'REJECTED';
            reviewNotes = rejectionReason.trim();

            const rejectedBaseDir = process.env.REJECTED_DOCS_DIR || 'uploads/rejected';
            const targetFolder = path.join(rejectedBaseDir, templateSid);
            const fileName = path.basename(assignment.filePath);
            const finalRejectedPath = path.join(targetFolder, fileName);

            if (!fs.existsSync(targetFolder)) 
                fs.mkdirSync(targetFolder, { recursive: true });

            if (!fs.existsSync(assignment.filePath)) 
                throw new Error(`ORIGIN_FILE_NOT_FOUND_ON_DISK: ${assignment.filePath}`);

            await fs.promises.rename(assignment.filePath, finalRejectedPath);
            assignment.filePath = finalRejectedPath; // Actualizamos la ruta para la BD
        }

        // 2. Preparar data para actualización
        const reviewData = {
            status: nextStatus,
            reviewedAt: new Date(),
            reviewedBy: req.user.sid,
            comments: reviewNotes,
            filePath: assignment.filePath // Se mantiene igual si es APPROVE, cambia si es REJECT
        };

        // 3. Persistencia
        const updatedAssignment = await assignmentQueries.updateAssignmentReview(templateSid, rowIndex, reviewData);

        // 4. Auditoría
        await auditQueries.logEvent({
            userId: req.user.sid,
            action: nextStatus === 'APPROVED' ? 'APPROVE_FILE' : 'REJECT_FILE',
            targetId: updatedAssignment.sid,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
            details: { 
                templateSid, 
                rowIndex, 
                transition: `UPLOADED_TO_${nextStatus}`,
                reason: reviewNotes 
            }
        });

        return updatedAssignment;

    } 
    catch (error) 
    {
        console.error(`[COMMAND ERROR] Fallo en executeAssignmentReview: ${error.message}`);
        throw error;
    }
};
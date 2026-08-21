import { randomUUID } from 'crypto';

/*
	DAO: Transforma una regla de renombrado del Excel en una estructura limpia de Assignment.
	Tiene una persona que será responsable
*/

export const createAssignmentDAO = (templateSid, assignedToSid, rowIndex) => {
    return {
        rid: randomUUID(),
        sid: randomUUID(),
        templateSid: templateSid,
        assignedTo: assignedToSid,
        rowIndex: rowIndex,
        status: 'PENDING',
        originalName: null,
        sha256: null,
        filePath: null,
        uploadedAt: null,
        schemaVersion: 1
    };
};

/**
 * DAO: Estructura los datos de integridad y ubicación física del archivo subido.
 * @param {Object} file - Objeto del archivo procesado por el middleware.
 * @param {string} finalPath - Ruta definitiva del archivo dentro de REQUEST_DOCS_DIR/:templateSid.
 * @param {string} fileHash - Hash SHA256 generado para asegurar el no repudio.
 */
export const createUploadUpdateDAO = (file, finalPath, fileHash) => {
    return {
        status: 'UPLOADED',
        originalName: file.originalname,
        sha256: fileHash,
        filePath: finalPath,
        uploadedAt: new Date()
    };
};
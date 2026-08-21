import Assignment from '../models/Assignments.js';

/*
	Inserta en bloque un arreglo de asignaciones individuales (filas).
*/
export const saveBulkAssignments = async (assignmentsArray) => {
    return await Assignment.insertMany(assignmentsArray);
};

/*
	Verifica si ya existen asignaciones para asegurar la idempotencia del comando.
*/
export const checkExistingAssignments = async (templateSid) => {
    return await Assignment.exists({ templateSid });
};

/*
	Busca una asignación específica mediante su clave compuesta (Plantilla + Fila).
*/
export const fetchAssignmentByRow = async (templateSid, rowIndex) => {
	return await Assignment.findOne({ templateSid, rowIndex: Number(rowIndex) });
};

/*
	Actualiza los metadatos de carga de un archivo en una asignación específica.
*/
export const updateAssignmentUpload = async (templateSid, rowIndex, updateData) => {
	return await Assignment.findOneAndUpdate(
		{ templateSid, rowIndex: Number(rowIndex) },
		{ $set: updateData },
		{ returnDocument: 'after' }
	);
};

/**
 * Actualiza el estado, comentarios e histórico de la revisión de una asignación.
 * @param {string} templateSid - Identificador único de la plantilla.
 * @param {number|string} rowIndex - Índice de la fila evaluada.
 * @param {Object} reviewData - Objeto con status, reviewedAt, reviewedBy, comments y filePath.
 * @returns {Promise<Object>} Documento de la asignación actualizado.
 */
export const updateAssignmentReview = async (templateSid, rowIndex, reviewData) => {
	try 
	{
		const updated = await Assignment.findOneAndUpdate(
			{ templateSid, rowIndex },
			{ 
				$set: {
					status: reviewData.status,
					filePath: reviewData.filePath,
					comments: reviewData.comments,
					reviewedAt: reviewData.reviewedAt,
					reviewedBy: reviewData.reviewedBy
				}
			},
			{ returnDocument: 'after' }
		);

		return updated;
	} 
	catch (error) 
	{
		console.error(`[QUERY ERROR] Fallo en updateAssignmentReview: ${error.message}`);
		throw error;
	}
};

/*
	Obtiene solo las asignaciones aprobadas usando el SID del template
	Útil para la generación del ZIP final.
*/
export const findApprovedAssignmentsByTemplateSid = async (templateSid) => {
	return await Assignment.find({ 
		templateSid, 
		status: 'APPROVED' 
	}).lean();
};

/**
 * Actualiza la ruta física de múltiples asignaciones tras el movimiento a procesados.
 * @param {String} templateSid 
 * @param {Array} movements - Array de { sid, newPath }
 */
export const updateBulkPathsAfterProcessing = async (movements) => {
	const bulkOps = movements.map(m => ({
		updateOne: {
			filter: { sid: m.sid },
			update: { $set: { filePath: m.newPath } }
		}
	}));
	return await Assignment.bulkWrite(bulkOps);
};
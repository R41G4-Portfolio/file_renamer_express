import { Templates } from '../models/index.js';

/*
	Busca un template por SID para verificar si ya tiene un ZIP generado.
	Usamos .lean() porque en esta fase solo consultamos estado y rutas.
*/
export const findTemplateBySidForZip = async (templateSid) => {
	// Cambiamos 'Template' por 'Templates'
	return await Templates.findOne({ sid: templateSid }).lean();
};

/*
	Consulta para bloquear la modificación de un registro
*/
export const setProcessingStatus = async (templateSid, isProcessing) => {
	return await Templates.findOneAndUpdate(
		{ sid: templateSid },
		{ $set: { isProcessing } }
	);
};

/*
	Actualiza la metadata del ZIP en el Template.
*/
export const updateTemplateZipInfo = async (templateSid, data) => {
	return await Templates.findOneAndUpdate(
		{ sid: templateSid },
		{ 
			$set: { 
				zipPath: data.zipPath,
				zipChecksum: data.zipChecksum,
				zipGeneratedAt: new Date(),
				status: data.status,
				isProcessing: data.isProcessing
			} 
		},
		{ returnDocument: 'after' }
	);
};
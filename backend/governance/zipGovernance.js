/*
	Governance: Diccionario de códigos de respuesta y mensajes para el módulo ZIP.
	Centraliza la semántica de generación y descarga de paquetes.
*/
export const zipResponses = {
	generateSuccess: (data) => ({
		status: 200,
		body: {
			success: true,
			message: data.isCached 
				? 'Se ha recuperado el paquete existente del almacenamiento.' 
				: 'El paquete ZIP ha sido generado y firmado criptográficamente con éxito.',
			data: {
				zipChecksum: data.zipChecksum,
				fileCount: data.fileCount,
				generatedAt: new Date()
			}
		}
	}),

	downloadSuccess: (zipPath, fileName) => ({
		status: 200,
		isDownload: true,
		path: zipPath,
		name: fileName
	}),

	incompleteAssignments: () => ({
		status: 400,
		body: {
			success: false,
			code: 'INCOMPLETE_PROCESS',
			message: 'No se puede generar el ZIP. Aún existen documentos pendientes de carga o aprobación.'
		}
	}),

	processingInProgress: () => ({
		status: 423, // Locked
		body: {
			success: false,
			code: 'PROCESS_LOCKED',
			message: 'Ya existe una tarea de compresión en curso para esta plantilla. Por favor, espere.'
		}
	}),

	zipNotFound: () => ({
		status: 404,
		body: {
			success: false,
			code: 'ZIP_NOT_FOUND',
			message: 'El archivo solicitado no existe en el servidor. Debe generarlo primero.'
		}
	}),

	forbidden: () => ({
		status: 403,
		body: {
			success: false,
			code: 'ACCESS_DENIED',
			message: 'No tienes permisos para gestionar los archivos de esta solicitud.'
		}
	}),

	internalError: (error) => ({
		status: 500,
		body: {
			success: false,
			code: 'SERVER_ERROR',
			message: 'Error crítico en el motor de compresión o firma digital.',
			details: process.env.NODE_ENV === 'development' ? error.message : null
		}
	})
};
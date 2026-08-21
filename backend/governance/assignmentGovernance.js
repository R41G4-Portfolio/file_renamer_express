/*
	Governance: Diccionario de códigos de respuesta y mensajes.
	Centraliza la semántica de las respuestas HTTP de asignaciones de archivos.
*/

export const assignmentResponses = {
	assignSuccess: (data) => ({
		status: 201,
		body: {
			success: true,
			message: 'Las reglas de la plantilla han sido desglosadas e indexadas individualmente con éxito.',
			data: {
				templateSid: data.templateSid,
				totalTasksInserted: data.totalTasks
			}
		}
	}),

	templateNotFound: () => ({
		status: 404,
		body: {
			success: false,
			code: 'TEMPLATE_NOT_FOUND',
			message: 'La plantilla especificada no existe, imposible generar sus asignaciones.'
		}
	}),

	alreadyAssigned: () => ({
		status: 409,
		body: {
			success: false,
			code: 'ALREADY_ASSIGNED',
			message: 'Las filas de esta plantilla ya han sido indexadas previamente en la colección.'
		}
	}),

	internalError: () => ({
		status: 500,
		body: {
			success: false,
			code: 'SERVER_ERROR',
			message: 'Error inesperado al inicializar las tareas en la base de datos.'
		}
	}),

	uploadDocSuccess: (data) => ({
		status: 200,
		body: {
			success: true,
			message: 'Documento recibido. El archivo ha sido firmado criptográficamente y depositado en la bandeja de revisión.',
			data: {
				sid: data.sid,
				templateSid: data.templateSid,
				rowIndex: data.rowIndex,
				status: data.status,
				originalName: data.originalName,
				sha256: data.sha256
			}
		}
	}),

    reviewDocSuccess: (data) => {
        // Determinamos el mensaje semántico según el estado de la revisión
        const message = data.status === 'APPROVED'
            ? 'El documento ha sido aprobado con éxito y el flujo se ha completado.'
            : `El documento ha sido rechazado. Se ha notificado al Downloader con el motivo: "${data.comments}".`;

        return {
            status: 200,
            body: {
                success: true,
                message,
                data: {
                    sid: data.sid,
                    templateSid: data.templateSid,
                    rowIndex: data.rowIndex,
                    status: data.status
                }
            }
        };
    },

	missingFields: () => ({
		status: 400,
		body: {
			success: false,
			code: 'MISSING_FIELDS',
			message: 'Los campos templateSid y rowIndex son obligatorios en el cuerpo de la solicitud.'
		}
	}),

	fileRequired: () => ({
		status: 400,
		body: {
			success: false,
			code: 'FILE_REQUIRED',
			message: 'El archivo físico es obligatorio.'
		}
	}),

	assignmentNotFound: () => ({
		status: 404,
		body: {
			success: false,
			code: 'NOT_FOUND',
			message: 'La fila especificada no existe en la asignación.'
		}
	}),

	accessDenied: () => ({
		status: 403,
		body: {
			success: false,
			code: 'FORBIDDEN',
			message: 'No tienes autorización. No eres el Downloader asignado a esta tarea.'
		}
	}),

	invalidStatusForUpload: () => ({
		status: 400,
		body: {
			success: false,
			code: 'INVALID_STATUS',
			message: 'No se puede subir el archivo. La tarea ya se encuentra en revisión o completada.'
		}
	}),

	invalidStatusForReview: () => ({
        status: 400,
        body: {
            success: false,
            code: 'INVALID_STATUS',
            message: 'No se puede evaluar la tarea. Solo se pueden aprobar o rechazar documentos que estén en estado de revisión (UPLOADED).'
        }
    }),

    invalidReviewAction: () => ({
        status: 400,
        body: {
            success: false,
            code: 'INVALID_ACTION',
            message: 'La acción de revisión especificada no es válida. Solo se permite APPROVE o REJECT.'
        }
    }),

	uploadInternalError: () => ({
		status: 500,
		body: {
			success: false,
			code: 'SERVER_ERROR',
			message: 'Error inesperado al procesar y almacenar el documento.'
		}
	})
};
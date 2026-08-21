/**
	@description Centraliza las respuestas y estados HTTP del módulo de Templates.
	Mapea el éxito de las operaciones y estandariza los errores de negocio.
*/
export const templateResponses = {
	// RESPUESTAS DE ÉXITO
	
	uploadSuccess: (data) => ({
		status: 201,
		body: {
			success: true,
			message: 'Solicitud creada y procesada correctamente.',
			data: {
				sid: data.sid,
				rowCount: data.rowCount
			}
		}
	}),

	listSuccess: (result) => ({
		status: 200,
		body: {
			success: true,
			pagination: {
				total: result.total,
				page: result.page,
				limit: result.limit
			},
			data: result.data // El DTO ya habrá limpiado estos datos
		}
	}),

	detailSuccess: (template) => ({
		status: 200,
		body: {
			success: true,
			data: template
		}
	}),

	reassignSuccess: () => ({
		status: 200,
		body: {
			success: true,
			message: 'La solicitud ha sido reasignada al nuevo colaborador correctamente.'
		}
	}),

	cancelSuccess: () => ({
		status: 200,
		body: {
			success: true,
			message: 'La solicitud ha sido cancelada y los archivos asociados eliminados.'
		}
	}),

	// GESTIÓN DE ERRORES SEMÁNTICOS

	fileMissing: () => ({
		status: 400,
		body: {
			success: false,
			code: 'FILE_REQUIRED',
			message: 'Es necesario adjuntar un archivo Excel (.xlsx, .xls) para esta operación.'
		}
	}),

	/**
		@param {Buffer} errorExcelBuffer - Buffer generado con la lista de errores encontrados en el Excel.
	*/
	invalidStructure: (errorExcelBuffer) => ({
		status: 422, 
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment; filename=errores_validacion.xlsx'
		},
		body: errorExcelBuffer 
	}),

	/*
		Error para cuando el motivo de cancelación es obligatorio y no se envió.
	*/
	reasonRequired: () => ({
		status: 400,
		body: {
			success: false,
			code: 'REASON_REQUIRED',
			message: 'Para cancelar una solicitud es obligatorio proporcionar un motivo válido.'
		}
	}),

	notFound: () => ({
		status: 404,
		body: {
			success: false,
			code: 'TEMPLATE_NOT_FOUND',
			message: 'La solicitud especificada no existe o fue eliminada.'
		}
	}),

	forbidden: () => ({
		status: 403,
		body: {
			success: false,
			code: 'ACCESS_DENIED',
			message: 'No tienes permisos para acceder o modificar esta solicitud.'
		}
	}),

	internalError: () => ({
		status: 500,
		body: {
			success: false,
			code: 'SERVER_ERROR',
			message: 'Ocurrió un error inesperado en el procesamiento de la solicitud.'
		}
	})
};
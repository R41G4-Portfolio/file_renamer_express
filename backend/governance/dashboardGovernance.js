export const dashboardResponses = {
	listSuccess: (data) => ({
		status: 200,
		body: {
			success: true,
			pagination: {
				total: data.total,
				page: data.page,
				limit: data.limit,
				totalPages: data.totalPages
			},
			data: data.data
		}
	}),
	
	internalError: () => ({
		status: 500,
		body: {
			success: false,
			code: 'SERVER_ERROR',
			message: 'Error interno del servidor'
		}
	})
};
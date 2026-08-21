export const taskResponses = {
	listSuccess: (data) => ({
		status: 200,
		body: data
	}),
	
	internalError: () => ({
		status: 500,
		body: {
			success: false,
			error: 'Error interno del servidor'
		}
	})
};
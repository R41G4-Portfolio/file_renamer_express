export const cookieConfig = {
	name: 'token',
	options: {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'Strict',
		maxAge: 24 * 60 * 60 * 1000, // 1 día
		path: '/'
	}
};

export const rateLimitConfig = {
	windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
	max: 10, // Límite de 10 peticiones por ventana para rutas normales
	loginMax: 10, // Máximo 10 intentos de login por ventana de 15 min (Criterio de Seguridad)
	message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.'
};
/*
	Utilidades para la gestión de la sesión en el cliente (lectura de cookies visibles)
*/

/**
 * Extrae y parsea el JSON de la cookie 'user_context' despachada por el backend.
 * @returns {Object|null} Datos del usuario (sid, role, name) o null si no existe.
*/
export const getContextFromCookie = () => {
	try {
		const cookieValue = document.cookie
			.split('; ')
			.find(row => row.startsWith('user_context='))
			?.split('=')[1];

		if (!cookieValue) return null;

		// decodeURIComponent es vital porque el backend suele escapar caracteres especiales en el JSON
		return JSON.parse(decodeURIComponent(cookieValue));
	} catch (error) {
		console.error("Error al parsear el contexto del usuario:", error);
		return null;
	}
};

/*
	Limpia la cookie de contexto en el cliente. 
	Útil para limpiezas de emergencia antes de que el servidor responda el logout.
*/
export const clearUserContext = () => {
	document.cookie = "user_context=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};
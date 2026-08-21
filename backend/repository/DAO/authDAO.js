import * as authQueries from '../../queries/authQueries.js';
/* 
	DAO de Autenticación.
	Coordina la verificación de existencia y la creación.
*/
export const registerUserDAO = async (userData) => {
	// 1. Validar si el usuario ya existe
	const exists = await authQueries.checkUserExistsByEmail(userData.email);
	
	if (exists) {
		// Este mensaje debe coincidir con el que busca el Controller
		throw new Error('IDENTITY_ALREADY_EXISTS');
	}

	// 2. Crear el usuario (el hash de bcrypt ya se hace dentro de createUser según definimos)
	const newUser = await authQueries.createUser(userData);

	return newUser;
};

export const getAuthCandidate = async (email) => {
	try {
		// Buscamos al usuario por email incluyendo campos de seguridad
		return await authQueries.findUserByEmailWithAuth(email);
	} catch (error) {
		console.error("[AUTH_DAO_GET_CANDIDATE_ERROR]:", error.message);
		throw error;
	}
};

export const syncSessionState = async (sid, token, salt, fingerprint) => {
	try {
		// Primero invalidar otras sesiones
		await authQueries.invalidateAllUserSessions(sid);
		
		// Luego guardar la nueva
		return await authQueries.updateSessionData(sid, token, salt, fingerprint);
	} catch (error) {
		console.error("[AUTH_DAO_SYNC_SESSION_ERROR]:", error.message);
		throw error;
	}
};

export const clearSessionState = async (sid) => {
	try {
		return await authQueries.clearSessionData(sid);
	} catch (error) {
		console.error("[AUTH_DAO_CLEAR_SESSION_ERROR]:", error.message);
		throw error;
	}
};
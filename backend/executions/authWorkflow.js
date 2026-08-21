import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { cookieConfig } from '../config/authConfig.js';
import * as authDAO from '../repository/DAO/authDAO.js';
import * as authQueries from '../queries/authQueries.js';
import { loginMappingDTO, userResponseDTO } from '../repository/DTO/userDTO.js';
import { getDeviceFamily } from '../utils/uaParser.js';
import * as auditLogger from '../utils/auditLogger.js';
/*
	Workflow de Registro de Usuarios.
	Orquesta la creación del usuario y filtra la salida para el cliente.
*/
export const registerUserWorkflow = async (req, userData) => {
	try 
	{
		// 1. Delegamos la creación al DAO (que debe manejar el hash y campos default)
		const newUser = await authDAO.registerUserDAO(userData); // Ojo: ver corrección de nombre abajo

		/*
			2. Guardar lacción realizada exitosamente en auditoria
			Pasamos el objeto 'req' completo para que el logger extraiga la IP
		*/
		await auditLogger.logEvent(req, 'REGISTER', newUser.sid, {
			email: newUser.email,
			status: 'SUCCESS'
		});

		// 3. Mapeo de salida para no exponer datos sensibles de creación
		return userResponseDTO(newUser);
	} 
	catch (error) 
	{
		console.error("[AUTH_WORKFLOW_REGISTER_ERROR]:", error.message);
		// CORRECCIÓN: Usamos userData.email que ahora sí está definido en los parámetros
		await auditLogger.logEvent(req, 'REGISTER_FAILED', null, { email: userData?.email, error: error.message, status: 'FAILED' });
		throw error;
	}
};

/*
	Workflow de Login:
	Valida identidad, gestiona entropía de dispositivo y activa sesión única.
*/
export const executeLogin = async (req, email, password, userAgent) => {
	try {
		const user = await authDAO.getAuthCandidate(email);
		if (!user) throw new Error('INVALID_CREDENTIALS');

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) throw new Error('INVALID_CREDENTIALS');

		const deviceFamily = getDeviceFamily(userAgent);
		const salt = crypto.randomBytes(16).toString('hex');
		
		const fingerprint = crypto.createHmac('sha256', salt)
			.update(deviceFamily)
			.digest('hex');

		const token = jwt.sign(
			{ sid: user.sid, role: user.role }, 
			process.env.JWT_SECRET, 
			{ expiresIn: '1d' }
		);

		// INVALIDAR SESIONES ANTERIORES (Single Session)
		await authQueries.invalidateAllUserSessions(user.sid);
		
		// Guardar nuevo token
		await authDAO.syncSessionState(user.sid, token, salt, fingerprint);

		await auditLogger.logEvent(req, 'LOGIN', user.sid, { email: user.email, status: 'SUCCESS' });

		return {
			user: loginMappingDTO(user),
			token,
			expiresAt: new Date(Date.now() + cookieConfig.options.maxAge)
		};
	} catch (error) {
		await auditLogger.logEvent(req, 'LOGIN_FAILED', null, { email, error: error.message, status: 'FAILED' });
		throw error;
	}
};

/*
	Workflow de Logout:
	Invalida la sesión en la base de datos eliminando el token y la entropía(salt y userAgent).
*/
export const executeLogout = async (req, sid) => {
	try {
		if (!sid) throw new Error('SID_REQUIRED');

		// Delegamos la limpieza atómica al DAO
		await authDAO.clearSessionState(sid);

		// Se guarda en Audit el cierre de sesión exitoso
		await auditLogger.logEvent(req, 'LOGOUT', sid, { status: 'SUCCESS' });
		return { success: true };
	}
	catch (error)
	{
		console.error("[AUTH_WORKFLOW_LOGOUT_ERROR]:", error.message);
		// Registro de fallo en logout si la base de datos no respondió
		await auditLogger.logEvent(req, 'LOGOUT_FAILED', sid, { error: error.message, status: 'FAILED' });
		throw error;
	}
};
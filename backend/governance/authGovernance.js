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
	Governance: Diccionario de códigos de respuesta y mensajes.
	Centraliza la semántica de las respuestas HTTP de autenticación.
*/

// En authDAO.js

export const authResponses = {
	// Éxito en Login: Inyecta la cookie de seguridad y la de contexto para el front
	loginSuccess: (result) => ({
		status: 200,
		// Cookie 1: Seguridad (Invisible para JS)
		cookie: {
			...cookieConfig,
			value: result.token
		},
		// Cookie 2: Contexto de Usuario (Visible para React)
		cookieUser: {
			name: 'user_context',
			value: JSON.stringify(result.user),
			options: {
				...cookieConfig.options,
				httpOnly: false // Permitimos lectura desde el frontend
			}
		},
		body: { 
			user: result.user, 
			expiresAt: result.expiresAt 
		}
	}),

	logoutSuccess: () => ({
		status: 200,
		// Limpieza de Cookie de Seguridad
		cookie: {
			...cookieConfig,
			value: '',
			options: {
				...cookieConfig.options,
				maxAge: 0,
				expires: new Date(0)
			}
		},
		// Limpieza de Cookie de Contexto
		cookieUser: {
			name: 'user_context',
			value: '',
			options: {
				maxAge: 0,
				expires: new Date(0)
			}
		},
		body: { message: 'Sesión cerrada correctamente' }
	}),

	registerSuccess: (data) => ({
		status: 201,
		body: { message: 'Usuario creado exitosamente', user: data }
	}),

	invalidCredentials: () => ({
		status: 401,
		body: { error: 'Credenciales inválidas' }
	}),

	sessionRevoked: () => ({
		status: 401,
		body: { error: 'Sesión cerrada en otro dispositivo' }
	}),

	invalidSession: () => ({
		status: 401,
		body: { error: 'Sesión inválida o expirada' }
	}),

	identityConflict: () => ({
		status: 409,
		body: { error: 'El correo electrónico ya está en uso' }
	}),

	internalError: () => ({
		status: 500,
		body: { error: 'Error interno del servidor' }
	})
};
import jwt from 'jsonwebtoken';
import Users from '../models/Users.js';
import { body, validationResult } from 'express-validator';

/* 
	1. GESTIÓN DE RESULTADOS
*/
const validateResult = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};


/*
	2. SANITIZACIÓN PERSONALIZADA
	Eliminar operadores NoSQL peligrosos ($ y .)
*/
const sanitizeNoSQL = (value) => {
	if (typeof value === 'string') {
		return value.replace(/[\$]/g, '').replace(/[\.]/g, '');
	}
	return value;
};

// Prevenir XSS convirtiendo caracteres especiales
const sanitizeXSS = (value) => {
	if (typeof value === 'string') {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#x27;')
			.replace(/\//g, '&#x2F;');
	}
	return value;
};

/* 
	3. VALIDACIONES DE DATOS (DICCIONARIO)
*/

export const validateRegisterData = [
	body('email')
		.isEmail().withMessage('Email inválido')
		.normalizeEmail()
		.customSanitizer(sanitizeNoSQL),
	body('password')
		.isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
		.customSanitizer(sanitizeNoSQL),
	body('name')
		.notEmpty().withMessage('El nombre es requerido')
		.trim()
		.escape()
		.customSanitizer(sanitizeNoSQL)
		.customSanitizer(sanitizeXSS),
	body('role')
		.optional()
		.isIn(['ADMIN', 'UPLOADER', 'DOWNLOADER']).withMessage('Rol inválido')
		.customSanitizer(sanitizeNoSQL),
	validateResult
];

export const validateLoginData = [
	body('email')
		.isEmail().withMessage('Email inválido')
		.normalizeEmail()
		.customSanitizer(sanitizeNoSQL),
	body('password')
		.notEmpty().withMessage('La contraseña es requerida')
		.customSanitizer(sanitizeNoSQL),
	validateResult
];

/* 
	4. VALIDACIONES DE SESIÓN (ESTADOS)
*/

/*
	stopAuthenticated: Bloquea el acceso si el usuario YA tiene sesión válida.
	Uso: En rutas de Login y Register.
*/
export const stopAuthenticated = async (req, res, next) => {
	const token = req.cookies?.token;
	
	if (!token) {
		return next();
	}
	
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await Users.findOne({ sid: decoded.sid }).select('+token').lean();
		
		const hasValidSession = user && user.token === token;
		
		if (hasValidSession) {
			return res.status(403).json({ error: 'Ya tienes una sesión activa' });
		}
		
		next();
	} catch (error) {
		// Token inválido o expirado, permitir continuar
		next();
	}
};

/*
	stopGuest: Bloquea el acceso si el usuario NO tiene una sesión válida.
	Uso: En Logout y rutas privadas.
*/
export const stopGuest = async (req, res, next) => {
	const token = req.cookies?.token;
	
	if (!token) {
		return res.status(401).json({ error: 'No hay sesión activa' });
	}
	
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await Users.findOne({ sid: decoded.sid }).select('+token').lean();
		
		const isValidSession = user && user.token === token;
		
		if (!isValidSession) {
			const message = user && user.token !== token 
				? 'Sesión cerrada en otro dispositivo'
				: 'Sesión inválida o expirada';
			return res.status(401).json({ error: message });
		}
		
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ error: 'Sesión inválida o expirada' });
	}
};
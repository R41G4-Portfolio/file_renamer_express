import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '../config/authConfig.js';
import { authResponses } from '../governance/authGovernance.js';

// Limitador genérico para cualquier ruta de la API
export const apiLimiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    handler: async(req, res) => {
        //const response = authResponses.internalError(); // O puedes crear uno específico 'tooManyRequests' en Governance
		await auditLogger.logEvent(req, 'BRUTE_FORCE_STRIKE', null, {
            message: 'IP bloqueada por exceso de intentos en rutas de auth',
            attemptedPath: req.originalUrl
        });
		
        return res.status(429).json({
            status: 429,
            message: rateLimitConfig.message
        });
    },
    standardHeaders: true, // Retorna info de límite en los headers 'RateLimit-*'
    legacyHeaders: false,
});

// Limitador estricto para AUTH (Login/Register) - Protección Anti-Brute Force
export const authLimiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.loginMax, // Solo 5 intentos
    handler: (req, res) => {
        // Aquí podrías incluso disparar un auditLogger.logEvent con acción 'BRUTE_FORCE_DETECTION'
        return res.status(429).json({
            status: 429,
            message: 'Demasiados intentos de acceso. Bloqueo temporal de 15 minutos activado por seguridad.'
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});
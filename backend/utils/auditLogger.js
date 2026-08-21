import Audits from '../models/Audits.js';
import { getDeviceFamily } from './uaParser.js';

/*
 * Registra una acción en la bitácora de auditoría.
 */
export const logEvent = async (req, action, userId, details = {}, targetId = null) => {
	try {
		// Usamos encadenamiento opcional (?.) para evitar que 'undefined' rompa el código
		const rawIp = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '0.0.0.0';
		const ipAddress = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;

		const auditEntry = {
			userId: userId || 'ANONYMOUS',
			action,
			targetId,
			ipAddress,
			userAgent: getDeviceFamily(req?.headers?.['user-agent'] || 'unknown'),
			details: {
				...details,
				endpoint: req?.originalUrl || 'unknown',
				method: req?.method || 'unknown'
			},
			schemaVersion: 1
		};

		await Audits.create(auditEntry);
	}
	catch (error) {
		console.error(`[AUDIT_LOG_ERROR] [${action}]:`, error.message);
	}
};
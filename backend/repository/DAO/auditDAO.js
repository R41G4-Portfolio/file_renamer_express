import { fetchAuditLogs } from '../../queries/auditQueries.js';

export const getAuditLogs = async (filters, page, limit) => {
	return await fetchAuditLogs(filters, page, limit);
};
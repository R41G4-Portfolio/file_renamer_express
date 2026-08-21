import { fetchAuditLogsWithUsers } from '../queries/auditQueries.js';
import { toAuditListDTO } from '../repository/DTO/auditDTO.js';

export const executeGetAuditLogs = async (page, limit) => {
	const result = await fetchAuditLogsWithUsers(page, limit);
	return {
		total: result.total,
		page: result.page,
		limit: result.limit,
		totalPages: Math.ceil(result.total / result.limit),
		data: toAuditListDTO(result.data)
	};
};
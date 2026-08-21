export const toAuditDTO = (log) => ({
	id: log.id,
	userId: log.userId,
	userName: log.userName || 'N/A',
	action: log.action,
	targetId: log.targetId,
	ipAddress: log.ipAddress,
	userAgent: log.userAgent,
	timestamp: log.timestamp
});

export const toAuditListDTO = (logs) => logs.map(toAuditDTO);
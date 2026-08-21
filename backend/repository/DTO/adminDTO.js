export const toAdminTemplateDTO = (template) => ({
	id: template.sid,
	title: template.title,
	status: template.status,
	assignedTo: template.assignedTo ? { name: template.assignedTo.name } : null,
	rowCount: template.rowCount,
	createdAt: template.createdAt,
	assignmentCounts: template.assignmentCounts
});
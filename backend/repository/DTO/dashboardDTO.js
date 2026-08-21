export const toDashboardTemplateDTO = (template) => ({
	sid: template.sid,
	title: template.title,
	excelFileName: template.excelFileName,
	rowCount: template.rowCount,
	status: template.status,
	assignedTo: template.assignedTo,
	assignmentCounts: template.assignmentCounts,
	createdAt: template.createdAt,
	assignments: template.assignments || []  // Asegurar que existe
});

export const toDashboardListDTO = (templates) => templates.map(toDashboardTemplateDTO);
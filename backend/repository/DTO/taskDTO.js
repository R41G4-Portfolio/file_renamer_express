export const toAssignmentDTO = (assignment) => ({
	id: assignment.id,
	rowIndex: assignment.rowIndex,
	folderPath: assignment.folderPath,
	desiredName: assignment.desiredName,
	status: assignment.status,
	originalName: assignment.originalName,
	comments: assignment.comments,
	uploadedAt: assignment.uploadedAt,
		filePath: assignment.filePath  // <-- AGREGAR
});

export const toMyTemplateDTO = (template) => ({
	id: template.id,
	title: template.title,
	status: template.status,
	uploadedAt: template.uploadedAt,
	assignments: template.assignments.map(toAssignmentDTO)
});

export const toMyTemplatesDTO = (templates) => templates.map(toMyTemplateDTO);

export const toTaskAssignmentDTO = (assignment) => ({
	id: assignment.sid,
	templateId: assignment.templateSid,
	templateTitle: assignment.templateTitle,
	templateStatus: assignment.templateStatus,
	rowIndex: assignment.rowIndex,
	status: assignment.status,
	originalName: assignment.originalName,
	comments: assignment.comments,
	uploadedAt: assignment.uploadedAt,
	folderPath: assignment.folderPath,
	desiredName: assignment.desiredName
});

export const toTaskListDTO = (assignments) => assignments.map(toTaskAssignmentDTO);

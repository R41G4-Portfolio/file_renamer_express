export const toAssignmentDTO = (assignment) => ({
	id: assignment.sid,
	rowIndex: assignment.rowIndex,
	status: assignment.status,
	originalName: assignment.originalName,
	comments: assignment.comments,
	uploadedAt: assignment.uploadedAt,
	filePath: assignment.filePath
});
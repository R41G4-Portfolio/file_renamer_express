import { fetchMyTemplatesWithAssignments, fetchAssignmentsByUser } from '../queries/taskQueries.js';
import { toMyTemplatesDTO, toTaskListDTO } from '../repository/DTO/taskDTO.js';

export const executeGetMyTemplates = async (userSid) => {
	const templates = await fetchMyTemplatesWithAssignments(userSid);
	return toMyTemplatesDTO(templates);
};

export const executeGetMyTasks = async (userSid, userRole, page, limit) => {
	const result = await fetchAssignmentsByUser(userSid, userRole, page, limit);
	
	return {
		total: result.total,
		page: result.page,
		limit: result.limit,
		totalPages: Math.ceil(result.total / result.limit),
		data: toTaskListDTO(result.data)
	};
};
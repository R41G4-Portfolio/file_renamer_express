import { fetchTemplatesWithAssignmentCounts } from '../queries/adminQueries.js';
import { toAdminTemplateDTO } from '../repository/DTO/adminDTO.js';

export const executeGetAdminTemplates = async (page, limit) => {
	const result = await fetchTemplatesWithAssignmentCounts(page, limit);
	return {
		total: result.total,
		page: result.page,
		limit: result.limit,
		totalPages: Math.ceil(result.total / result.limit),
		data: result.data.map(toAdminTemplateDTO)
	};
};
import Templates from '../models/Templates.js';
import Assignments from '../models/Assignments.js';
import Users from '../models/Users.js';

import { fetchTemplatesByOwner } from '../queries/dashboardQueries.js';
import { toDashboardListDTO } from '../repository/DTO/dashboardDTO.js';

export const getAdminStats = async () => {
    const [totalTemplates, totalUsers, totalAssignments] = await Promise.all([
        Template.countDocuments(),
        User.countDocuments({ role: 'DOWNLOADER' }),
        Assignment.countDocuments()
    ]);

    const activeTemplates = await Templates.countDocuments({ status: 'ACTIVE' });

    return {
        summary: {
            totalTemplates,
            activeTemplates,
            totalUsers,
            totalAssignments
        }
    };
};

export const getUploaderStats = async (userSid) => {
    // Filtramos solo lo que le pertenece a este Uploader
    const myTemplates = await Template.countDocuments({ createdBySid: userSid });
    const pendingReview = await Assignment.countDocuments({ 
        templateSid: { $URI: '...' }, // Lógica de cruce si es necesaria
        status: 'UPLOADED' 
    });

    return {
        summary: {
            myTemplates,
            pendingReview
        }
    };
};

export const executeGetDashboardTemplates = async (userSid, userRole, page, limit) => {
	const result = await fetchTemplatesByOwner(userSid, userRole, page, limit);
	
	return {
		total: result.total,
		page: result.page,
		limit: result.limit,
		totalPages: Math.ceil(result.total / result.limit),
		data: toDashboardListDTO(result.data)
	};
};
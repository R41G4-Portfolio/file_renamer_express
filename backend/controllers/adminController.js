import { executeGetAdminTemplates } from '../executions/adminWorkflow.js';
import { adminResponses } from '../governance/adminGovernance.js';

export const getAdminTemplates = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		
		const result = await executeGetAdminTemplates(page, limit);
		const response = adminResponses.listSuccess(result);
		return res.status(response.status).json(response.body);
	} catch (error) {
		console.error('[ADMIN_CONTROLLER_ERROR]', error.message);
		const response = adminResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};
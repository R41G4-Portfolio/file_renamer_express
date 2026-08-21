import { executeGetDashboardTemplates } from '../executions/dashboardWorkflow.js';
import { dashboardResponses } from '../governance/dashboardGovernance.js';

export const getDashboardTemplates = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const userSid = req.user.sid;
		const userRole = req.user.role;
		
		const result = await executeGetDashboardTemplates(userSid, userRole, page, limit);
		const response = dashboardResponses.listSuccess(result);
		return res.status(response.status).json(response.body);
		
	} catch (error) {
		console.error('[DASHBOARD_CONTROLLER_ERROR]', error.message);
		const response = dashboardResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};
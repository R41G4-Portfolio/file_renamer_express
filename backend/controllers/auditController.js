import { executeGetAuditLogs } from '../executions/auditWorkflow.js';
import { auditResponses } from '../governance/auditGovernance.js';

export const getAuditLogs = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 50;
		
		const result = await executeGetAuditLogs(page, limit);
		const response = auditResponses.listSuccess(result);
		return res.status(response.status).json(response.body);
	} catch (error) {
		console.error('[AUDIT_CONTROLLER_ERROR]', error.message);
		const response = auditResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};
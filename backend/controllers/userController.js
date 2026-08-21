import { findUsersByRole } from '../queries/userQueries.js';
import { userResponses } from '../governance/userGovernance.js';

export const getUsersByRole = async (req, res) => {
	try
	{
		const { role } = req.params;
		const users = await findUsersByRole(role.toUpperCase());
		const response = userResponses.listSuccess(users);
		return res.status(response.status).json(response.body);
	}
	catch(error)
	{
		console.error('[USER_CONTROLLER_ERROR]', error.message);
		const response = userResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};
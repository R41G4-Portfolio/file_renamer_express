import { authResponses } from '../governance/authGovernance.js';
import * as authWorkflow from '../executions/authWorkflow.js';

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const userAgent = req.headers['user-agent'];

		const result = await authWorkflow.executeLogin(req, email, password, userAgent);
		const response = authResponses.loginSuccess(result);

		// 1. Despachamos Cookie de Seguridad (token httpOnly)
		res.cookie(response.cookie.name, response.cookie.value, response.cookie.options);

		// 2. Despachamos Cookie de Contexto (user_context visible)
		res.cookie(response.cookieUser.name, response.cookieUser.value, response.cookieUser.options);

		return res.status(response.status).json(response.body);

	} catch (error) {
		if (error.message === 'INVALID_CREDENTIALS') {
			const response = authResponses.invalidCredentials();
			return res.status(response.status).json(response.body);
		}
		console.error('[AUTH_CONTROLLER_LOGIN_ERROR]', error.message);
		const response = authResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};

export const logout = async (req, res) => {
	try {
		const { sid } = req.user;
		await authWorkflow.executeLogout(req, sid);

		const response = authResponses.logoutSuccess();
		
		// Limpiamos ambas cookies en el cliente
		res.cookie(response.cookie.name, response.cookie.value, response.cookie.options);
		res.cookie(response.cookieUser.name, response.cookieUser.value, response.cookieUser.options);

		return res.status(response.status).json(response.body);

	} catch (error) {
		console.error('[AUTH_CONTROLLER_LOGOUT_ERROR]:', error.message);
		const response = authResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};

export const register = async (req, res) => {
	try {
		const userData = req.body;
		const result = await authWorkflow.registerUserWorkflow(req, userData);
		const response = authResponses.registerSuccess(result);
		return res.status(response.status).json(response.body);
	} catch (error) {
		if (error.message === 'IDENTITY_ALREADY_EXISTS') {
			const response = authResponses.identityConflict();
			return res.status(response.status).json(response.body);
		}
		const response = authResponses.internalError();
		return res.status(response.status).json(response.body);
	}
};
/* rbacMiddleware.js - Control de acceso basado en roles */

const requireRole = (allowedRoles) => {
	return (req, res, next) => {
		/* Verificar que el usuario esté autenticado (authMiddleware ya debe haberse ejecutado) */
		if (!req.user) {
			return res.status(401).json({ error: 'No autenticado' });
		}

		/* Verificar que el rol del usuario esté permitido */
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ 
				error: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}`,
				yourRole: req.user.role
			});
		}

		next();
	};
};

export default requireRole;
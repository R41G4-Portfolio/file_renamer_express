import Spinner from '../components/common/Spinner';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoutes = ({ children, allowedRoles = [] }) => {
	const { isAuthenticated, loading, user } = useAuth();

	if (loading) {
		return <Spinner />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	console.log('PrivateRoute - user:', user);
	console.log('PrivateRoute - allowedRoles:', allowedRoles);

	// En PrivateRoutes.jsx
	const userRole = user?.rol || user?.role;  // Compatible con ambos

	if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
		// Redirigir según el rol del usuario
		if (userRole === 'DOWNLOADER') {
			return <Navigate to="/my-tasks" />;
		}
		return <Navigate to="/dashboard" />;
	}

	return children;
};

export default PrivateRoutes;
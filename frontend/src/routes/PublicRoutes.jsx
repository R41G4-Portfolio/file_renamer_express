import Spinner from '../components/common/Spinner';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading)
		return <Spinner />;

	// Si ya está autenticado, redirige al dashboard
	if (isAuthenticated) {
		return <Navigate to="/dashboard" />;
	}

	return children;
};

export default PublicRoute;
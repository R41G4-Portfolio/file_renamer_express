// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoutes';
import PublicRoute from './PublicRoutes';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Dashboard from '../components/dashboard/Dashboard';
import UploadPage from '../pages/UploadPage';
import DownloaderPanel from '../pages/DownloaderPage';
import AdminMonitor from '../pages/AdminPage';
import NotFoundPage from '../pages/NotFoundPage'; // Importar el nuevo componente

const AppRoutes = () => {
	return (
		<Routes>
			{/* Rutas públicas */}
			<Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
			<Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

			{/* Rutas privadas con roles */}
			<Route path="/upload" element={<PrivateRoute allowedRoles={['ADMIN', 'UPLOADER']}><UploadPage /></PrivateRoute>} />
			<Route path="/dashboard" element={<PrivateRoute allowedRoles={['ADMIN', 'UPLOADER']}><Dashboard /></PrivateRoute>} />
			<Route path="/my-tasks" element={<PrivateRoute allowedRoles={['DOWNLOADER', 'ADMIN']}><DownloaderPanel /></PrivateRoute>} />
			<Route path="/admin/monitor" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminMonitor /></PrivateRoute>} />
			<Route path="/" element={<PrivateRoute allowedRoles={['ADMIN', 'UPLOADER']}><Dashboard /></PrivateRoute>} />

			{/* Catch-all: debe ir al final */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
};

export default AppRoutes;
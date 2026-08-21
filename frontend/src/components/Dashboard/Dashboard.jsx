import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Spinner from '../common/Spinner';
import TemplateTable from './TemplatesTable';
import TemplateDetails from './TemplateDetails';
import { api } from '../../services/api';
import { INTERNAL_ROUTES } from '../../constants/routes';
import HelmetMeta from '../common/HelmetMeta';
import { PAGE_META } from '../../constants/meta';

const Dashboard = () => {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [loading, setLoading] = useState(true);
	const [templates, setTemplates] = useState([]);
	const [selectedTemplateSid, setSelectedTemplateSid] = useState(null);
	const [showDetails, setShowDetails] = useState(false);

	const fetchTemplates = async () => {
		try {
			setLoading(true);
			const response = await api.getDashboardTemplates();
			const templatesData = response.data || [];
			setTemplates(templatesData);
		} catch (error) {
			console.error('Error fetching templates:', error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Redirección de seguridad por Rol
		if (user?.role === 'DOWNLOADER') {
			navigate(INTERNAL_ROUTES.MY_TASKS);
		} else if (user) {
			fetchTemplates();
		}
	}, [user, navigate]);

	const handleLogout = async () => {
		await logout();
		navigate(INTERNAL_ROUTES.LOGIN);
	};

	const handleViewDetails = (sid) => {
		setSelectedTemplateSid(sid);
		setShowDetails(true);
	};

	const handleCloseDetails = () => {
		setShowDetails(false);
		setSelectedTemplateSid(null);
	};

	if (loading) return <Spinner />;

	return (
		<>
			<HelmetMeta {...PAGE_META.DASHBOARD} />
			<div className="container py-4">
				<main>
					<div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
						<h2 className="h3 mb-0">Lista de plantillas</h2>
						<div className="d-flex gap-2">
							<button 
								className="btn btn-primary"
								onClick={() => navigate(INTERNAL_ROUTES.UPLOAD)}
							>
								+ Nueva Plantilla
							</button>
							<a 
								href={`${import.meta.env.VITE_API_URL}/api/v1/templates/download-template`}
								target="_blank" 
								rel="noopener noreferrer"
								className="btn btn-outline-secondary"
							>
								📥 Descargar plantilla Excel
							</a>
						</div>
					</div>

					<TemplateTable 
						templates={templates} 
						user={user}
						onViewDetails={handleViewDetails}
						onRefresh={fetchTemplates}
					/>

					{showDetails && (
						<div className="modal show d-block modal-backdrop-custom" tabIndex="-1" onClick={handleCloseDetails}>
							<div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
								<div className="modal-content">
									<div className="modal-header">
										<h5 className="modal-title">Detalles de la plantilla</h5>
										<button type="button" className="btn-close" onClick={handleCloseDetails} aria-label="Close"></button>
									</div>
									<div className="modal-body">
										<TemplateDetails 
											templateSid={selectedTemplateSid}
											onClose={handleCloseDetails}
											onRefresh={fetchTemplates}
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</main>
			</div>
		</>
	);
};

export default Dashboard;
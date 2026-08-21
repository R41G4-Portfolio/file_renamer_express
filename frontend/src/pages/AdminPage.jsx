import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import  Header from '../components/Layout/Header';
import AdminStats from '../components/Admin/AdminStats';
import AdminTable from '../components/Admin/AdminTable';
import AdminAuditTable  from '../components/Admin/AdminAuditTable';
import { api } from '../services/api';
import Spinner from '../components/common/Spinner';
import Swal from 'sweetalert2';
import HelmetMeta from '../components/common/HelmetMeta';
import { PAGE_META } from '../constants/meta';

const AdminPage = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [templates, setTemplates] = useState([]);
	const [stats, setStats] = useState({});

	const fetchData = async () => {
		try {
			console.log('Llamando a getAdminTemplates...');
			const response = await api.getAdminTemplates();
			console.log('Respuesta completa:', response);
			const allTemplates = response.data || [];
			console.log('Templates con conteos:', allTemplates);
			setTemplates(allTemplates);
			
			const statsData = {
				total: allTemplates.length,
				active: allTemplates.filter(t => t.status === 'ACTIVE').length,
				completed: allTemplates.filter(t => t.status === 'COMPLETED').length,
				cancelled: allTemplates.filter(t => t.status === 'CANCELLED').length,
				totalUploads: 0
			};
			
			allTemplates.forEach(template => {
				if (template.assignments) {
					statsData.totalUploads += template.assignments.filter(a => a.status === 'UPLOADED').length;
				}
			});
			
			setStats(statsData);
		}
		catch (error)
		{
			console.error('Error:', error);
			Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
		}
		finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) return <Spinner />;

	return (
		<>
			<HelmetMeta {...PAGE_META.ADMIN_MONITOR} />
			<div className="container py-4">
				<main>
					<h2 className="mb-4">Panel de monitoreo</h2>
					<AdminStats stats={stats} />
					<h3 className="mt-4 mb-3">Lista de solicitudes</h3>
					<AdminTable templates={templates} onRefresh={fetchData} />
					<AdminAuditTable />
				</main>
			</div>
		</>
	);
};

export default AdminPage;
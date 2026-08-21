/*import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Swal from 'sweetalert2';
import Spinner from '../common/Spinner';
import DownloaderTable from './DownloaderTable';

const DownloaderPanel = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [groupedTemplates, setGroupedTemplates] = useState([]);

	const fetchMyTasks = async () => {
		try {
			setLoading(true);
			const response = await api.getMyTasks(1, 100);
			const assignments = response.data || [];

			// Agrupar por template
			const templateMap = new Map();
			assignments.forEach(assignment => {
				const templateId = assignment.templateId;
				const templateTitle = assignment.templateTitle;
				
				if (!templateMap.has(templateId)) {
					templateMap.set(templateId, {
						id: templateId,
						title: templateTitle,
						assignments: []
					});
				}
				templateMap.get(templateId).assignments.push(assignment);
			});

			setGroupedTemplates(Array.from(templateMap.values()));
		} catch (error) {
			console.error('Error:', error);
			Swal.fire('Error', error.message || 'No se pudieron cargar tus tareas', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = () => {
		fetchMyTasks();
	};

	useEffect(() => {
		fetchMyTasks();
	}, []);

	if (loading) return <Spinner />;

	return (
		<div className="container-fluid px-0">
			<h2 className="mb-4">Mis tareas</h2>
			{groupedTemplates.length === 0 ? (
				<p className="text-center text-muted py-5">No tienes tareas asignadas.</p>
			) : (
				<DownloaderTable 
					templates={groupedTemplates}
					onRefresh={handleRefresh}
				/>
			)}
		</div>
	);
};

export default DownloaderPanel;
*/

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Swal from 'sweetalert2';
import Spinner from '../common/Spinner';
import DownloaderTable from './DownloaderTable';

const DownloaderPanel = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [groupedTemplates, setGroupedTemplates] = useState([]);

	const fetchMyTasks = async () => {
		try {
			setLoading(true);
			const response = await api.getMyTasks(1, 100);
			const assignments = response.data || [];

			// Agrupar por template y enriquecer con datos agregados
			const templateMap = new Map();
			assignments.forEach(assignment => {
				const templateId = assignment.templateId;
				const templateTitle = assignment.templateTitle;
				const templateStatus = assignment.templateStatus; // ← nuevo

				if (!templateMap.has(templateId)) {
					templateMap.set(templateId, {
						id: templateId,
						title: templateTitle,
						status: templateStatus,               // ← estado de la plantilla
						assignments: [],
						totalDocs: 0,
						pendingDocs: 0,
						uploadedDocs: 0,
						approvedDocs: 0,
						createdAt: null                       // para ordenación por fecha
					});
				}
				const entry = templateMap.get(templateId);
				entry.assignments.push(assignment);
			});

			// Calcular agregados por plantilla
			const templates = Array.from(templateMap.values()).map(t => {
				const assignments = t.assignments;
				const total = assignments.length;
				const pending = assignments.filter(a => a.status === 'PENDING').length;
				const uploaded = assignments.filter(a => a.status === 'UPLOADED').length;
				const approved = assignments.filter(a => a.status === 'APPROVED').length;
				// Fecha más antigua entre los uploadedAt de las asignaciones (para ordenar)
				let minDate = null;
				assignments.forEach(a => {
					if (a.uploadedAt) {
						const d = new Date(a.uploadedAt);
						if (!minDate || d < minDate) minDate = d;
					}
				});
				return {
					...t,
					totalDocs: total,
					pendingDocs: pending,
					uploadedDocs: uploaded,
					approvedDocs: approved,
					createdAt: minDate ? minDate.toISOString() : new Date().toISOString()
				};
			});

			setGroupedTemplates(templates);
		} catch (error) {
			console.error('Error:', error);
			Swal.fire('Error', error.message || 'No se pudieron cargar tus tareas', 'error');
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = () => {
		fetchMyTasks();
	};

	useEffect(() => {
		fetchMyTasks();
	}, []);

	if (loading) return <Spinner />;

	return (
		<div className="container-fluid px-0">
			<h2 className="mb-4">Mis tareas</h2>
			{groupedTemplates.length === 0 ? (
				<p className="text-center text-muted py-5">No tienes tareas asignadas.</p>
			) : (
				<DownloaderTable
					templates={groupedTemplates}
					onRefresh={handleRefresh}
				/>
			)}
		</div>
	);
};

export default DownloaderPanel;
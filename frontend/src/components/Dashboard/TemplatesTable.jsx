import { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import Swal from 'sweetalert2';
import FilterFields from '../common/FilterFields';
import TemplateDetails from './TemplateDetails';
import { api } from '../../services/api';

const TemplatesTable = ({ templates, user, onRefresh }) => {
	const [assigningSid, setAssigningSid] = useState(null);
	const [downloadersList, setDownloadersList] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [sortBy, setSortBy] = useState('title');

	const loadDownloaders = async () => {
		if (downloadersList.length > 0) return downloadersList;
		try {
			const data = await api.getDownloaders();
			setDownloadersList(data);
			return data;
		} catch (error) {
			console.error('Error al cargar downloaders:', error);
			return [];
		}
	};

	const handleAssign = async (templateSid, email) => {
		try {
			await api.assignTemplate(templateSid, email);
			Swal.fire('Éxito', 'Usuario asignado correctamente', 'success');
			if (onRefresh) onRefresh();
		} catch (error) {
			Swal.fire('Error', error.message || 'Error al asignar', 'error');
		}
		setAssigningSid(null);
	};

	const openAssignSelect = async (templateSid) => {
		const downloaders = await loadDownloaders();
		if (downloaders.length === 0) {
			Swal.fire('Info', 'No hay usuarios con rol DOWNLOADER', 'info');
			return;
		}
		setAssigningSid(templateSid);
	};

	const handleViewDetails = async (templateSid) => {
		const container = document.createElement('div');
		
		await Swal.fire({
			title: 'Detalles de la plantilla',
			html: container,
			width: '95%',
			showConfirmButton: false,
			showCloseButton: true,
			didOpen: () => {
				const root = createRoot(container);
				root.render(
					<TemplateDetails 
						templateSid={templateSid}
						user={user}
						onClose={() => Swal.close()}
						onRefresh={onRefresh}
					/>
				);
			}
		});
	};

	const filteredTemplates = useMemo(() => {
		let filtered = [...templates];

		if (searchTerm.trim()) {
			filtered = filtered.filter(template =>
				template.title.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (statusFilter !== 'all') {
			filtered = filtered.filter(template => 
				template.status?.toLowerCase() === statusFilter.toLowerCase()
			);
		}

		switch (sortBy) {
			case 'title':
				filtered.sort((a, b) => a.title.localeCompare(b.title));
				break;
			case 'date':
				filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
				break;
			default:
				break;
		}

		return filtered;
	}, [templates, searchTerm, statusFilter, sortBy]);

	// Función auxiliar para obtener la clase del badge según el estado
	const getStatusBadgeClass = (status) => {
		switch (status?.toLowerCase()) {
			case 'active': return 'bg-success';
			case 'completed': return 'bg-primary';
			case 'cancelled': return 'bg-danger';
			default: return 'bg-secondary';
		}
	};

	const getStatusText = (status) => {
		switch (status) {
			case 'ACTIVE': return 'Activa';
			case 'COMPLETED': return 'Completada';
			case 'CANCELLED': return 'Cancelada';
			default: return status;
		}
	};

	return (
		<div className="table-responsive">
			<FilterFields
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				sortBy={sortBy}
				onSortChange={setSortBy}
				statusOptions={[
					{ value: 'all', label: '📋 Todos los estados' },
					{ value: 'active', label: '🟢 Activas' },
					{ value: 'completed', label: '✅ Completadas' },
					{ value: 'cancelled', label: '❌ Canceladas' }
				]}
				sortOptions={[
					{ value: 'title', label: '📝 Ordenar por título' },
					{ value: 'date', label: '📅 Más recientes' }
				]}
				placeholder="🔍 Buscar por título..."
			/>

			<table className="table table-striped table-hover align-middle">
				<thead className="table-dark">
					<tr>
						<th>Título</th>
						<th>Archivo</th>
						<th>Filas</th>
						<th>Estado</th>
						<th>Asignado a</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{filteredTemplates.map((template) => (
						<tr key={template.sid}>
							<td>{template.title || 'Sin título'}</td>
							<td>{template.excelFileName}</td>
							<td>{template.rowCount}</td>
							<td>
								<span className={`badge ${getStatusBadgeClass(template.status)}`}>
									{getStatusText(template.status)}
								</span>
							</td>
							<td>
								{assigningSid === template.sid ? (
									<select
										className="form-select form-select-sm"
										defaultValue=""
										autoFocus
										onChange={(e) => handleAssign(template.sid, e.target.value)}
										onBlur={() => setAssigningSid(null)}
									>
										<option value="">Selecciona...</option>
										{downloadersList.map(d => (
											<option key={d.sid} value={d.email}>
												{d.name}
											</option>
										))}
									</select>
								) : (
									<div className="d-flex align-items-center gap-2">
										<span className="text-muted small">
											{template.assignedTo?.name || 'No asignado'}
										</span>
										<button 
											className="btn btn-sm btn-outline-secondary"
											onClick={() => openAssignSelect(template.sid)}
											disabled={template.status === 'COMPLETED' || template.status === 'CANCELLED'}
										>
											Cambiar
										</button>
									</div>
								)}
								</td>
							<td>
								<button 
									className="btn btn-sm btn-info text-white"
									onClick={() => handleViewDetails(template.sid)}
								>
									Ver detalles
								</button>
								</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default TemplatesTable;
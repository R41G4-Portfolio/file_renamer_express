import { useState, useMemo } from 'react';
import FilterFields from '../common/FilterFields';
import DownloaderRow from './DownloaderRow';

const DownloaderTable = ({ templates, onRefresh }) => {
	const [expandedTemplates, setExpandedTemplates] = useState({});
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [sortBy, setSortBy] = useState('title');

	const toggleTemplate = (templateSid) => {
		setExpandedTemplates(prev => ({
			...prev,
			[templateSid]: !prev[templateSid]
		}));
	};

	const filteredTemplates = useMemo(() => {
		let filtered = [...templates];

		if (searchTerm.trim()) {
			filtered = filtered.filter(t =>
				t.title?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Filtro por estado de la plantilla
		if (statusFilter !== 'all') {
			filtered = filtered.filter(t => {
				switch (statusFilter) {
					case 'active':
						return t.status === 'ACTIVE';
					case 'review':
						// En revisión: activa y al menos un documento UPLOADED
						return t.status === 'ACTIVE' && (t.uploadedDocs > 0);
					case 'completed':
						return t.status === 'COMPLETED';
					case 'cancelled':
						return t.status === 'CANCELLED';
					default:
						return true;
				}
			});
		}

		// Ordenamiento
		switch (sortBy) {
			case 'title':
				filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
				break;
			case 'status':
				// Orden personalizado: ACTIVAS -> EN REVISIÓN -> COMPLETADAS -> CANCELADAS
				const statusOrder = { 'ACTIVE': 1, 'REVIEW': 2, 'COMPLETED': 3, 'CANCELLED': 4 };
				filtered.sort((a, b) => {
					let aKey = a.status;
					if (a.status === 'ACTIVE' && a.uploadedDocs > 0) aKey = 'REVIEW';
					let bKey = b.status;
					if (b.status === 'ACTIVE' && b.uploadedDocs > 0) bKey = 'REVIEW';
					return (statusOrder[aKey] || 5) - (statusOrder[bKey] || 5);
				});
				break;
			case 'date':
				filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
				break;
			default:
				break;
		}
		return filtered;
	}, [templates, searchTerm, statusFilter, sortBy]);

	// Estadísticas: conteo de plantillas por estado
	const totalTemplates = filteredTemplates.length;
	//Pendientes
	const activeCount = filteredTemplates.filter(t => {
		if (t.status !== 'ACTIVE')
			return false;
		return (t.assignments || []).some(a => a.status === 'PENDING' || a.status === 'REJECTED');
	}).length;
	//En revisión
	const reviewCount = filteredTemplates.filter(t => t.status === 'ACTIVE' && t.uploadedDocs > 0).length;
	//Completadas
	const completedCount = filteredTemplates.filter(t => t.status === 'COMPLETED').length;
	//Canceladas
	const cancelledCount = filteredTemplates.filter(t => t.status === 'CANCELLED').length;

	return (
		<div>
			<FilterFields
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				sortBy={sortBy}
				onSortChange={setSortBy}
				statusOptions={[
					{ value: 'all', label: 'Todos los estados' },
					{ value: 'active', label: 'Pendientes' },
					{ value: 'review', label: 'En revisión' },
					{ value: 'completed', label: 'Completados' },
					{ value: 'cancelled', label: 'Cancelados' }
				]}
				sortOptions={[
					{ value: 'title', label: '📝 Ordenar por título' },
					{ value: 'status', label: '🏷️ Ordenar por estado' },
					{ value: 'date', label: '📅 Más recientes' }
				]}
				placeholder="🔍 Buscar por plantilla..."
			/>

			<div className="d-flex flex-wrap gap-3 mb-4 p-3 bg-light rounded">
				<span className="badge bg-secondary fs-6">Tareas totales: {totalTemplates}</span>
				<span className="badge bg-warning fs-6">Pendientes: {activeCount}</span>
				<span className="badge bg-info fs-6">En revisión: {reviewCount}</span>
				<span className="badge bg-success fs-6">Completados: {completedCount}</span>
				<span className="badge bg-danger fs-6">Cancelados: {cancelledCount}</span>
			</div>

			{filteredTemplates.length === 0 ? (
				<div className="alert alert-info text-center py-4">
					No se encontraron tareas con los filtros aplicados.
				</div>
			) : (
				<div className="table-responsive">
					<table className="table table-bordered table-dark table-hover align-middle">
						<thead>
							<tr>
								<th>Título</th>
								<th>Ruta</th>
								<th>Nombre deseado</th>
								<th>Estado</th>
								<th>Archivo</th>
								<th>Acción</th>
								<th>Vista previa</th>
							</tr>
						</thead>
						<tbody>
							{filteredTemplates.map((template) => {
								const templateSid = template.sid || template.id;
								return (
									<DownloaderRow
										key={templateSid}
										template={template}
										isExpanded={!!expandedTemplates[templateSid]}
										onToggle={() => toggleTemplate(templateSid)}
										onRefresh={onRefresh}
									/>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default DownloaderTable;
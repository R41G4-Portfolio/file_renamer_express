import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { api } from '../../services/api';
import Pagination from '../common/Pagination';
import Spinner from '../common/Spinner';

const AdminTable = ({ onRefresh }) => {
	const [templates, setTemplates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		total: 0,
		page: 1,
		limit: 10,
		totalPages: 0
	});

	const fetchTemplates = async (page = 1) => {
		try {
			setLoading(true);
			const response = await api.getAdminTemplates(page, pagination.limit);
			setTemplates(response.data || []);
			setPagination({
				total: response.pagination.total,
				page: response.pagination.page,
				limit: response.pagination.limit,
				totalPages: response.pagination.totalPages
			});
		} catch (error) {
			console.error('Error al cargar templates:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadZip = async (templateId) => {
		try {
			const blob = await api.downloadZip(templateId);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `package_${templateId}.zip`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			Swal.fire('Error', error.message || 'Error al descargar ZIP', 'error');
		}
	};

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
			fetchTemplates(newPage);
		}
	};

	const handleCancelTemplate = async (templateId) => {
		const result = await Swal.fire({
			title: '¿Cancelar plantilla?',
			text: 'Se perderán todos los avances',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			confirmButtonText: 'Sí, cancelar',
			cancelButtonText: 'Volver'
		});
		
		if (!result.isConfirmed) return;
		
		try {
			await api.cancelTemplate(templateId);
			Swal.fire('Cancelada', 'Plantilla cancelada correctamente', 'success');
			fetchTemplates(pagination.page);
			if (onRefresh) onRefresh();
		} catch (error) {
			Swal.fire('Error', error.message || 'Error al cancelar', 'error');
		}
	};

	const getStatusBadgeClass = (status) => {
		switch (status) {
			case 'ACTIVE': return 'bg-primary';
			case 'COMPLETED': return 'bg-success';
			case 'CANCELLED': return 'bg-danger';
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

	useEffect(() => {
		fetchTemplates(1);
	}, []);

	if (loading && templates.length === 0) {
		return <Spinner />;
	}

	return (
		<div>
			<div className="table-responsive">
				<table className="table table-striped table-hover align-middle">
					<thead className="table-dark">
						<tr>
							<th>Título</th>
							<th>Estado</th>
							<th>Asignado a</th>
							<th className="text-center">Filas</th>
							<th className="text-center">📤 Sin subir</th>
							<th className="text-center">❓ No aprobados</th>
							<th className="text-center">✅ Aprobados</th>
							<th>Fecha</th>
							<th className="text-center">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{templates.map((template) => {
							const pendingCount = template.assignmentCounts?.pending || 0;
							const uploadedCount = template.assignmentCounts?.uploaded || 0;
							const approvedCount = template.assignmentCounts?.approved || 0;
							const totalCount = template.assignmentCounts?.total || 0;
							
							return (
								<tr key={template.id}>
									<td>{template.title || 'Sin título'}</td>
									<td>
										<span className={`badge ${getStatusBadgeClass(template.status)}`}>
											{getStatusText(template.status)}
										</span>
										</td>
										<td>{template.assignedTo?.name || 'No asignado'}</td>
										<td className="text-center fw-semibold">{totalCount}</td>
										<td className="text-center text-warning fw-semibold">{pendingCount}</td>
										<td className="text-center text-info fw-semibold">{uploadedCount}</td>
										<td className="text-center text-success fw-semibold">{approvedCount}</td>
										<td>{new Date(template.createdAt).toLocaleDateString()}</td>
										<td className="text-center">
											{template.status === 'ACTIVE' && (
												<button 
													className="btn btn-sm btn-danger"
													onClick={() => handleCancelTemplate(template.id)}
												>
													Cancelar
												</button>
											)}
											{template.zipPath && (
												<a 
													href={`${import.meta.env.VITE_API_URL}/zip/download/${template.id}`}
													className="btn btn-sm btn-primary ms-2"
												>
													Descargar ZIP
												</a>
											)}
											{template.status === 'COMPLETED' && (
												<a 
													href={`${import.meta.env.VITE_API_URL}/api/v1/zip/download/${template.id}`}
													className="btn btn-sm btn-primary ms-2"
												>
													Descargar ZIP
												</a>
											)}
											{template.status !== 'ACTIVE' && !template.zipPath && template.status !== 'COMPLETED' && (
												<span className="text-muted">—</span>
											)}
										</td>
									</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<Pagination 
				page={pagination.page}
				totalPages={pagination.totalPages}
				onPageChange={handlePageChange}
				emptyMessage="No hay tareas para mostrar"
			/>
		</div>
	);
};

export default AdminTable;
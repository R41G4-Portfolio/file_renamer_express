import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Spinner from '../common/Spinner';
import { api } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const TemplateDetails = ({ templateSid, user, onClose, onRefresh }) => {
	const [loading, setLoading] = useState(true);
	const [template, setTemplate] = useState(null);
	const [assignments, setAssignments] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const response = await api.getTemplateBySid(templateSid);
				const templateData = response.data || response;
				setTemplate(templateData);
				setAssignments(templateData.assignments || []);
			} catch (error) {
				console.error('Error detallado:', error);
				Swal.fire('Error', error.message, 'error');
				if (onClose) onClose();
			} finally {
				setLoading(false);
			}
		};

		if (templateSid) fetchData();
	}, [templateSid, onClose]);

	const handleApprove = async () => {
		// Nota: Hay un error original: 'assignment' no está definido aquí. Se deja igual.
		console.log('Assignment a aprobar:', assignment);
		console.log('template.sid:', template.sid);
		console.log('assignment.rowIndex:', assignment.rowIndex);
		const result = await Swal.fire({
			title: '¿Aprobar plantilla?',
			text: 'Se cerrará el proceso y se permitirá la generación del ZIP.',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Sí, aprobar'
		});

		if (!result.isConfirmed) return;

		try {
			await api.approveTemplate(templateSid);
			Swal.fire('Éxito', 'Plantilla aprobada', 'success');
			if (onRefresh) onRefresh();
			if (onClose) onClose();
		} catch (error) {
			Swal.fire('Error', error.message, 'error');
		}
	};

	const handleCancelTemplate = async () => {
		const { value: reason } = await Swal.fire({
			title: 'Cancelar plantilla',
			text: 'Ingresa el motivo de cancelación',
			input: 'textarea',
			inputPlaceholder: 'Ej: La información está incompleta...',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			confirmButtonText: 'Sí, cancelar',
			cancelButtonText: 'Volver',
			inputValidator: (value) => {
				if (!value) {
					return 'Debes ingresar un motivo de cancelación';
				}
			}
		});

		if (!reason) return;

		try {
			await api.cancelTemplate(templateSid, { reason });
			Swal.fire('Cancelada', 'La plantilla ha sido cancelada', 'success');
			if (onRefresh) onRefresh();
			if (onClose) onClose();
		} catch (error) {
			Swal.fire('Error', error.message, 'error');
		}
	};

	const getStatusText = (status) => {
		switch (status) {
			case 'PENDING': return 'Pendiente';
			case 'UPLOADED': return 'Subido';
			case 'APPROVED': return 'Aprobado';
			case 'REJECTED': return 'Rechazado';
			default: return status || '—';
		}
	};

	const handleApproveAssignment = async (assignment) => {
		console.log('Assignment:', assignment);
		console.log('template.sid:', template.sid);
		console.log('assignment.rowIndex:', assignment.rowIndex);

		const result = await Swal.fire({
			title: '¿Aprobar documento?',
			text: 'El documento será marcado como aprobado',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Sí, aprobar'
		});

		if (!result.isConfirmed) return;

		try {
			await api.reviewAssignment(assignment.sid, 'APPROVED', null, template.sid, assignment.rowIndex);
			Swal.fire('Éxito', 'Documento aprobado', 'success');
			const response = await api.getTemplateBySid(templateSid);
			const templateData = response.data || response;
			setTemplate(templateData);
			setAssignments(templateData.assignments || []);
			if (onRefresh) onRefresh();
		} catch (error) {
			Swal.fire('Error', error.message, 'error');
		}
	};

	const handleRejectAssignment = async (assignment) => {
		const { value: reason } = await Swal.fire({
			title: 'Rechazar documento',
			text: 'Ingresa el motivo del rechazo',
			input: 'textarea',
			inputPlaceholder: 'Ej: El documento no es legible...',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, rechazar',
			inputValidator: (value) => {
				if (!value) return 'Debes ingresar un motivo';
			}
		});

		if (!reason) return;

		try {
			await api.reviewAssignment(assignment.sid, 'REJECTED', reason, template.sid, assignment.rowIndex);
			Swal.fire('Rechazado', 'Documento rechazado', 'warning');
			const response = await api.getTemplateBySid(templateSid);
			const templateData = response.data || response;
			setTemplate(templateData);
			setAssignments(templateData.assignments || []);
			if (onRefresh) onRefresh();
		} catch (error) {
			Swal.fire('Error', error.message, 'error');
		}
	};

	const allUploaded = assignments.length > 0 && assignments.every(a => a.status === 'UPLOADED');
	const userRole = user?.role || user?.rol;

	// Función auxiliar para obtener la clase del badge según el estado principal de la plantilla
	const getTemplateStatusBadgeClass = (status) => {
		switch (status) {
			case 'ACTIVE': return 'bg-warning';
			case 'COMPLETED': return 'bg-success';
			case 'CANCELLED': return 'bg-danger';
			default: return 'bg-secondary';
		}
	};

	const getTemplateStatusText = (status) => {
		switch (status) {
			case 'ACTIVE': return 'Activa';
			case 'COMPLETED': return 'Completada';
			case 'CANCELLED': return 'Cancelada';
			default: return status || '—';
		}
	};

	if (loading) return <Spinner />;
	if (!template) return null;

	return (
		<div className="p-3">
			<div className="card shadow-sm">
				<div className="card-body">
					<h2 className="card-title h4 mb-4">{template.title || 'Detalles'}</h2>

					<div className="row mb-4">
						<div className="col-md-6">
							<p><strong>Estado:</strong> 
								<span className={`ms-2 badge ${getTemplateStatusBadgeClass(template.status)}`}>
									{getTemplateStatusText(template.status)}
								</span>
							</p>
						</div>
						<div className="col-md-6">
							<p><strong>Asignado:</strong> {template.assignedTo?.name?.name || template.assignedTo?.name || 'Sin asignar'}</p>
						</div>
					</div>

					<div className="table-responsive mb-4">
						<table className="table table-bordered table-striped align-middle">
							<thead className="table-light">
								<tr>
									<th>Ruta</th>
									<th>Nombre Deseado</th>
									<th>Estado</th>
									<th>Archivo</th>
								</tr>
							</thead>
							<tbody>
								{assignments.map((assignment) => (
									<tr key={assignment.sid}>
										<td>{assignment.ruta || '—'}</td>
										<td>{assignment.nombreDeseado || '—'}</td>
										<td>{getStatusText(assignment.status)}</td>
										<td className="text-center">
											{assignment.filePath ? (
											<div className="d-flex gap-2 flex-wrap justify-content-center">
												<a
													href={`${API_BASE_URL}/api/v1/tasks/files/${assignment.sid}`}
													target="_blank"
													rel="noopener noreferrer"
													className="btn btn-sm btn-outline-primary"
												>
													Ver
												</a>
												{assignment.status === 'UPLOADED' && (
												<>
													<button
													onClick={() => handleApproveAssignment(assignment)}
													className="btn btn-sm btn-success"
													>
													Aprobar
													</button>
													<button
													onClick={() => handleRejectAssignment(assignment)}
													className="btn btn-sm btn-danger"
													>
													Rechazar
													</button>
												</>
												)}
											</div>
											) : '—'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="d-flex gap-2 flex-wrap">
						{template.excelFileName && (
							<a 
								href={`${API_BASE_URL}/api/v1/templates/download-excel/${template.sid}`}
								target="_blank" 
								rel="noopener noreferrer"
								className="btn btn-secondary"
							>
								Descargar Excel de la solicitud
							</a>
						)}

						{template.status === 'ACTIVE' && (userRole === 'ADMIN' || userRole === 'UPLOADER') && (
							<button onClick={handleCancelTemplate} className="btn btn-danger">Cancelar</button>
						)}

						{template.status === 'ACTIVE' && allUploaded && userRole === 'ADMIN' && (
							<button onClick={handleApprove} className="btn btn-success">Aprobar</button>
						)}

						{template.status === 'COMPLETED' && (
							<a 
								href={`${API_BASE_URL}/api/v1/zip/download/${template.sid}`}
								className="btn btn-primary"
							>
								Descargar ZIP
							</a>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TemplateDetails;
import { useState } from 'react';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

const DownloaderRow = ({ template, isExpanded, onToggle, onRefresh }) => {
	if (!template) return null;

	const [uploading, setUploading] = useState({});
	const [selectedFiles, setSelectedFiles] = useState({});

	const assignments = template.assignments || [];
	const templateId = template.sid || template.id;

	const getStatusText = (status) => {
		switch (status) {
			case 'PENDING': return 'Pendiente';
			case 'UPLOADED': return 'En revisión';
			case 'APPROVED': return 'Aprobado';
			case 'REJECTED': return 'Rechazado';
			default: return status;
		}
	};

	const getStatusBadgeClass = (status) => {
		switch (status) {
			case 'PENDING': return 'bg-warning text-dark';
			case 'UPLOADED': return 'bg-info text-white';
			case 'APPROVED': return 'bg-success';
			case 'REJECTED': return 'bg-danger text-white';
			default: return 'bg-secondary';
		}
	};

	const getTemplateStatusText = (status) => {
		switch (status) {
			case 'ACTIVE': return 'Activa';
			case 'COMPLETED': return 'Completada';
			case 'CANCELLED': return 'Cancelada';
			default: return 'Sin estado';
		}
	};

	const getTemplateBadgeClass = (status) => {
		switch (status) {
			case 'ACTIVE': return 'bg-primary';
			case 'COMPLETED': return 'bg-success';
			case 'CANCELLED': return 'bg-danger';
			default: return 'bg-secondary';
		}
	};

	const handleFileSelect = (assignmentId, file) => {
		setSelectedFiles(prev => ({ ...prev, [assignmentId]: file }));
	};

	const handleUpload = async (assignmentId) => {
		const file = selectedFiles[assignmentId];
		const assignment = assignments.find(a => (a.sid || a.id || a._id) === assignmentId);

		if (!file) {
			Swal.fire('Error', 'Selecciona un archivo', 'warning');
			return;
		}
		if (!assignment) {
			Swal.fire('Error', 'No se encontró la asignación', 'error');
			return;
		}

		setUploading(prev => ({ ...prev, [assignmentId]: true }));

		try {
			await api.uploadAssignmentDoc(
				assignmentId,
				file,
				templateId,
				assignment.rowIndex
			);
			Swal.fire('Éxito', 'Archivo subido correctamente', 'success');
			setSelectedFiles(prev => {
				const newState = { ...prev };
				delete newState[assignmentId];
				return newState;
			});
			if (onRefresh) onRefresh();
		} catch (error) {
			Swal.fire('Error', error.message || 'Error al subir archivo', 'error');
		} finally {
			setUploading(prev => ({ ...prev, [assignmentId]: false }));
		}
	};

	return (
		<>
			<tr className="cursor-pointer template-header-row" onClick={onToggle}>
				<td colSpan="7">
					<div className="d-flex align-items-center gap-2">
						<span className="fw-bold">{isExpanded ? '▼' : '▶'}</span>
						<span className="fw-semibold">{template.title}</span>
						<span className={`badge ${getTemplateBadgeClass(template.status)}`}>
							{getTemplateStatusText(template.status)} ({assignments.length} {assignments.length === 1 ? 'documento' : 'documentos'})
						</span>
						{template.status !== 'CANCELLED' && template.pendingDocs > 0 && (
							<span className="badge bg-warning text-dark">
								📄 Pendientes: {template.pendingDocs}
							</span>
						)}
					</div>
				</td>
			</tr>

			{isExpanded && assignments.map((assignment) => {
				const assignmentId = assignment.sid || assignment.id || assignment._id;
				const isTemplateActive = template.status === 'ACTIVE';
				// Permitir subir si está PENDING o REJECTED (y la plantilla activa)
				const canUpload = isTemplateActive && (assignment.status === 'PENDING' || assignment.status === 'REJECTED');
				const hasFile = !!assignment.originalName;

				return (
					<tr key={assignmentId} className="table-light">
						<td style={{ backgroundColor: '#f9f9f9' }}></td>
						<td>{assignment.folderPath || '—'}</td>
						<td>{assignment.desiredName || '—'}</td>
						<td>
								<span className={`badge ${getStatusBadgeClass(assignment.status)}`}>
									{getStatusText(assignment.status)}
								</span>
							</td>
						<td className="align-middle">
							<div className="d-flex flex-column gap-2">
								<input
									type="file"
									className="form-control form-control-sm"
									accept=".pdf,.jpg,.jpeg,.png,.docx"
									disabled={!canUpload || uploading[assignmentId]}
									onChange={(e) => {
										const file = e.target.files[0];
										if (file) handleFileSelect(assignmentId, file);
									}}
								/>
								{selectedFiles[assignmentId] && (
									<span className="text-muted small">{selectedFiles[assignmentId].name}</span>
								)}
							</div>
							</td>
						<td className="align-middle">
							<button
								className="btn btn-sm btn-primary"
								onClick={() => handleUpload(assignmentId)}
								disabled={!canUpload || uploading[assignmentId] || !selectedFiles[assignmentId]}
							>
								{uploading[assignmentId] ? (
									<>
										<span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
										Subiendo...
									</>
								) : 'Subir'}
							</button>
							</td>
						<td className="align-middle">
							{hasFile ? (
								<a
									href={`${import.meta.env.VITE_API_URL}/api/v1/tasks/files/${assignmentId}`}
									target="_blank"
									rel="noopener noreferrer"
									className="btn btn-sm btn-outline-secondary"
								>
									Ver
								</a>
							) : '—'}
							</td>
						</tr>
				);
			})}
		</>
	);
};

export default DownloaderRow;
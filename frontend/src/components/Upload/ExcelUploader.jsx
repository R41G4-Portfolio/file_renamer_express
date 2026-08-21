import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { INTERNAL_ROUTES } from '../../constants/routes';

const ExcelUploader = () => {
	const navigate = useNavigate();
	const [file, setFile] = useState(null);
	const [title, setTitle] = useState('');
	const [assignedTo, setAssignedTo] = useState('');
	const [downloaders, setDownloaders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	// Cargar lista de DOWNLOADERS al montar el componente
	useEffect(() => {
		const fetchDownloaders = async () => {
			try {
				const data = await api.getDownloaders();
				setDownloaders(data);
			} catch (err) {
				console.error('Error al cargar downloaders:', err);
			}
		};
		fetchDownloaders();
	}, []);

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
			setFile(selectedFile);
			setError('');
		} else {
			setFile(null);
			setError('Solo archivos Excel (.xlsx, .xls)');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!file) {
			setError('Selecciona un archivo');
			return;
		}
		if (!title.trim()) {
			setError('Ingresa un título para la solicitud');
			return;
		}
		if (!assignedTo) {
			setError('Selecciona un usuario DOWNLOADER para asignar la tarea');
			return;
		}

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const response = await api.uploadTemplate(file, title, assignedTo);
			
			if (response.success && response.data?.sid) {
				setSuccess('Plantilla subida correctamente');
				setFile(null);
				setTitle('');
				setAssignedTo('');
				const fileInput = document.getElementById('excel-file');
				if (fileInput) fileInput.value = '';
				
				setTimeout(() => {
					navigate(INTERNAL_ROUTES.DASHBOARD);
				}, 2000);
			} else {
				setError(response.message || 'Error al subir plantilla');
			}
		} catch (err) {
			console.error('Error:', err);
			
			const errorMessages = {
				'INVALID_TEMPLATE_STRUCTURE': 'La plantilla contiene errores de estructura',
				'FILE_REQUIRED': 'No se recibió el archivo Excel',
				'EXCEL_ROWS_EXCEEDED': 'El archivo excede el límite de filas permitidas'
			};
			
			setError(errorMessages[err.message] || err.message || 'Error al subir plantilla');
		} finally {
			setLoading(false);
		}
	};

	const apiBaseUrl = import.meta.env.VITE_API_URL

	return (
		<div className="card shadow-sm">
			<div className="card-body">
				<div className="text-center mb-4">
					<a 
						href={`${apiBaseUrl}/api/v1/templates/download-template`}
						className="btn btn-outline-primary"
						download
					>
						📥 Descargar plantilla Excel
					</a>
				</div>
				
				<div className="position-relative text-center my-3">
					<hr />
					<span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">o</span>
				</div>
				
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label className="form-label">Título de la solicitud</label>
						<input
							type="text"
							className="form-control"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Ej: Facturas proveedores marzo 2024"
							required
						/>
					</div>

					<div className="mb-3">
						<label className="form-label">Asignar a (DOWNLOADER)</label>
						<select
							className="form-select"
							value={assignedTo}
							onChange={(e) => setAssignedTo(e.target.value)}
							required
						>
							<option value="">Selecciona un usuario DOWNLOADER</option>
							{downloaders.map((user) => (
								<option key={user.sid} value={user.sid}>
									{user.name} ({user.email})
								</option>
							))}
						</select>
						{downloaders.length === 0 && (
							<div className="form-text text-warning">
								No hay usuarios DOWNLOADER disponibles. Crea uno primero.
							</div>
						)}
					</div>

					<div className="mb-3">
						<label className="form-label">Archivo Excel</label>
						<input
							id="excel-file"
							type="file"
							accept=".xlsx,.xls"
							onChange={handleFileChange}
							className="form-control"
						/>
						<div className="form-text">Columnas requeridas: ruta, nombre</div>
					</div>

					{error && <div className="alert alert-danger">{error}</div>}
					{success && <div className="alert alert-success">{success}</div>}

					<button
						type="submit"
						className="btn btn-primary w-100"
						disabled={!file || !title.trim() || !assignedTo || loading || downloaders.length === 0}
					>
						{loading ? (
							<>
								<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
								Subiendo...
							</>
						) : 'Subir plantilla'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ExcelUploader;
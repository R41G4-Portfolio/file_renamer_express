import { useState } from 'react';

const FileUploader = ({ assignmentId, onUploadSuccess }) => {
	const [file, setFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const apiBaseUrl = import.meta.env.VITE_API_URL

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		const allowedExtensions = ['.pdf', '.jpg', '.png', '.docx'];
		const ext = selectedFile?.name.slice(-5).toLowerCase();
		
		if (selectedFile && allowedExtensions.some(a => ext === a)) {
			setFile(selectedFile);
			setError('');
		} else {
			setFile(null);
			setError('Tipo de archivo no permitido. Permitidos: PDF, JPG, PNG, DOCX');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!file) {
			setError('Selecciona un archivo');
			return;
		}

		setLoading(true);
		setError('');
		setSuccess('');

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch(`${apiBaseUrl}/assignments/upload/${assignmentId}`, {
				method: 'POST',
				credentials: 'include',
				body: formData
			});

			const data = await response.json();

			if (response.ok) {
				setSuccess('Archivo subido correctamente');
				setFile(null);
				e.target.reset();
				if (onUploadSuccess) onUploadSuccess();
			} else {
				setError(data.error || 'Error al subir archivo');
			}
		} catch (err) {
			setError('Error de conexión');
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className="border rounded p-3 bg-light" onSubmit={handleSubmit}>
			<div className="mb-3">
				<label className="form-label fw-semibold">Archivo</label>
				<input
					type="file"
					accept=".pdf,.jpg,.jpeg,.png,.docx"
					onChange={handleFileChange}
					className="form-control"
				/>
				<div className="form-text text-muted">
					Formatos permitidos: PDF, JPG, PNG, DOCX
				</div>
			</div>

			{error && <div className="alert alert-danger">{error}</div>}
			{success && <div className="alert alert-success">{success}</div>}

			<button
				type="submit"
				className="btn btn-primary w-100"
				disabled={!file || loading}
			>
				{loading ? (
					<>
						<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
						Subiendo...
					</>
				) : 'Subir archivo'}
			</button>
		</form>
	);
};

export default FileUploader;
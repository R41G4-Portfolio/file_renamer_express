import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import ExcelUploader from '../components/Upload/ExcelUploader';
import { INTERNAL_ROUTES } from '../constants/routes';
import HelmetMeta from '../components/common/HelmetMeta';
import { PAGE_META } from '../constants/meta';

const UploadPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	// Se eliminó el useEffect que modificaba document.title

	if (user?.rol !== 'ADMIN' && user?.rol !== 'UPLOADER') {
		return (
			<>
				<HelmetMeta {...PAGE_META.UPLOAD} />
				<div className="container-fluid py-4">
					<div className="alert alert-danger text-center p-5">
						<h2>Acceso denegado</h2>
						<p>No tienes permiso para subir plantillas.</p>
						<button 
							className="btn btn-primary mt-3"
							onClick={() => navigate(INTERNAL_ROUTES.DASHBOARD)}
						>
							Volver al dashboard
						</button>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<HelmetMeta {...PAGE_META.UPLOAD} />
			<div className="container py-4">
				<main>
					<div className="card shadow-sm p-4">
						<h2 className="mb-3">Subir plantilla Excel</h2>
						<p className="text-muted mb-4">El archivo debe contener las columnas: ruta y nombre</p>
						<ExcelUploader navigate={navigate} />
					</div>
				</main>
			</div>
		</>
	);
};

export default UploadPage;
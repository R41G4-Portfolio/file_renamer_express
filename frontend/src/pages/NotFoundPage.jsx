import { Link } from 'react-router-dom';
import HelmetMeta from '../components/common/HelmetMeta';
import { INTERNAL_ROUTES } from '../constants/routes';
import { PAGE_META } from '../constants/meta';

// Si no tienes definido PAGE_META.NOT_FOUND, agrégalo en /src/constants/meta.js
// o usa uno genérico aquí mismo.

const NotFoundPage = () => {
	// Puedes definir el meta localmente si no está en PAGE_META
	const notFoundMeta = {
		title: 'Página no encontrada - File Renamer',
		description: 'La página que buscas no existe o ha sido movida.',
		keywords: '404, error, no encontrado'
	};

	return (
		<>
			<HelmetMeta {...(PAGE_META.NOT_FOUND || notFoundMeta)} />
			<div className="container d-flex justify-content-center align-items-center min-vh-100">
				<div className="text-center">
					<h1 className="display-1 fw-bold text-muted">404</h1>
					<h2 className="mb-4">Página no encontrada</h2>
					<p className="lead text-muted mb-5">
						Lo sentimos, la página que intentas visitar no existe o ha sido movida.
					</p>
					<Link to={INTERNAL_ROUTES.HOME} className="btn btn-primary btn-lg">
						Volver al inicio
					</Link>
				</div>
			</div>
		</>
	);
};

export default NotFoundPage;
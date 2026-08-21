import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { INTERNAL_ROUTES } from '../../constants/routes';
import '../../css/Header.css';

const Header = ({ title }) => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	// La cookie envía "rol"
	const userRole = user?.rol;

	const handleLogout = async () => {
		await logout();
		navigate(INTERNAL_ROUTES.LOGIN);
	};

	const getNavLinks = () => {
		switch (userRole) {
			case 'ADMIN':
				return [
					{ path: INTERNAL_ROUTES.DASHBOARD, label: 'Dashboard' },
					{ path: INTERNAL_ROUTES.UPLOAD, label: 'Subir plantilla' },
					{ path: INTERNAL_ROUTES.ADMIN_MONITOR, label: 'Monitor' },
					{ path: INTERNAL_ROUTES.MY_TASKS, label: 'Mis tareas' },
				];
			case 'UPLOADER':
				return [
					{ path: INTERNAL_ROUTES.DASHBOARD, label: 'Dashboard' },
					{ path: INTERNAL_ROUTES.UPLOAD, label: 'Subir plantilla' },
				];
			case 'DOWNLOADER':
				return [
					{ path: INTERNAL_ROUTES.MY_TASKS, label: 'Mis tareas' },
				];
			default:
				return [];
		}
	};

	const links = getNavLinks();

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
			<div className="container-fluid">
				{/* Columna 1: Logo / título */}
				<NavLink className="navbar-brand" to={INTERNAL_ROUTES.DASHBOARD}>
					{title}
				</NavLink>

				{/* Botón hamburguesa para móvil */}
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#headerNavbar"
					aria-controls="headerNavbar"
					aria-expanded="false"
					aria-label="Menú"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				{/* Contenido colapsable */}
				<div className="collapse navbar-collapse" id="headerNavbar">
					{/* Columna 2: Enlaces de navegación (se empujan hacia la izquierda, dejando espacio a la derecha) */}
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						{links.map((link) => (
							<li className="nav-item" key={link.path}>
								<NavLink
									className={({ isActive }) =>
										`nav-link ${isActive ? 'active' : ''}`
									}
									to={link.path}
								>
									{link.label}
								</NavLink>
							</li>
						))}
					</ul>

					{/* Columna 3: Nombre, rol y cerrar sesión (se alinea a la derecha gracias al me-auto anterior) */}
					<ul className="navbar-nav mb-2 mb-lg-0 align-items-center">
						<li className="nav-item">
							<span className="nav-link text-white">
								{user?.nombre} ({user?.rol})
							</span>
						</li>
						<li className="nav-item">
							<button
								type="button"
								className="btn btn-link nav-link text-white text-decoration-none"
								onClick={handleLogout}
							>
								Cerrar sesión
							</button>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};

export default Header;
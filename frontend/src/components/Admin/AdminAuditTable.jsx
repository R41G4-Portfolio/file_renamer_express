import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Pagination from '../common/Pagination';
import Spinner from '../common/Spinner';

const AdminAuditTable = () => {
	const [auditLogs, setAuditLogs] = useState([]);
	const [filteredLogs, setFilteredLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		total: 0,
		page: 1,
		limit: 50,
		totalPages: 0
	});
	const [filters, setFilters] = useState({
		userId: '',
		action: '',
		startDate: '',
		endDate: ''
	});
	const [users, setUsers] = useState([]);
	const [actions, setActions] = useState([]);
	const [stats, setStats] = useState({ totalUsers: 0, totalActions: 0 });

	const fetchAuditLogs = async (page = 1) => {
		try {
			setLoading(true);
			const response = await api.getAuditLogs(page, pagination.limit);
			
			setAuditLogs(response.data);
			setFilteredLogs(response.data);
			setPagination({
				total: response.pagination.total,
				page: response.pagination.page,
				limit: response.pagination.limit,
				totalPages: response.pagination.totalPages
			});
			
			if (page === 1 && users.length === 0) {
				const uniqueUsersMap = new Map();
				response.data.forEach(log => {
					const userName = log.userName || 'N/A';
					if (userName && !uniqueUsersMap.has(userName)) {
						uniqueUsersMap.set(userName, { id: userName, name: userName });
					}
				});
				const uniqueUsers = Array.from(uniqueUsersMap.values());
				setUsers(uniqueUsers);
				
				const uniqueActions = [...new Set(response.data.map(log => log.action))];
				setActions(uniqueActions);
				
				setStats({
					totalUsers: uniqueUsers.length,
					totalActions: uniqueActions.length
				});
			}
		} catch (error) {
			console.error('Error al cargar auditoría:', error);
		} finally {
			setLoading(false);
		}
	};

	const applyFilters = () => {
		let filtered = [...auditLogs];
		
		if (filters.userId)
			filtered = filtered.filter(log => log.userName === filters.userId);
		
		if (filters.action)
			filtered = filtered.filter(log => log.action === filters.action);
		
		if (filters.startDate) {
			const start = new Date(filters.startDate);
			start.setHours(0, 0, 0);
			filtered = filtered.filter(log => new Date(log.timestamp) >= start);
		}
		
		if (filters.endDate) {
			const end = new Date(filters.endDate);
			end.setHours(23, 59, 59);
			filtered = filtered.filter(log => new Date(log.timestamp) <= end);
		}
		
		setFilteredLogs(filtered);
	};

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
	};

	const handleApplyFilters = () => {
		applyFilters();
	};

	const handleResetFilters = () => {
		setFilters({
			userId: '',
			action: '',
			startDate: '',
			endDate: ''
		});
		setFilteredLogs(auditLogs);
	};

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
			fetchAuditLogs(newPage);
		}
	};

	const getActionText = (action) => {
		const actionsMap = {
			'LOGIN': 'Inicio de sesión',
			'LOGOUT': 'Cierre de sesión',
			'LOGOUT_FAILED': 'Falló el cierre de sesión',
			'UPLOAD_TEMPLATE': 'Subió plantilla',
			'UPLOAD_FILE': 'Subió archivo',
			'GENERATE_ZIP': 'Generó ZIP',
			'DOWNLOAD_ZIP': 'Descargó ZIP',
			'APPROVE_TEMPLATE': 'Aprobó plantilla',
			'CANCEL_TEMPLATE': 'Canceló plantilla',
			'ASSIGN_TEMPLATE': 'Asignó usuario',
			'REGISTER': 'Registro',
			'APPROVE_FILE': 'Aprobó archivo',
			'REJECT_FILE': 'Rechazó archivo',
		};
		return actionsMap[action] || action;
	};

	const getActionClass = (action) => {
		// Se mantienen las clases personalizadas para estilos específicos
		const classesMap = {
			'LOGIN': 'action-login',
			'LOGOUT': 'action-logout',
			'LOGOUT_FAILED': 'action-logout',
			'UPLOAD_TEMPLATE': 'action-upload-template',
			'UPLOAD_FILE': 'action-upload-file',
			'GENERATE_ZIP': 'action-generate-zip',
			'DOWNLOAD_ZIP': 'action-download-zip',
			'APPROVE_TEMPLATE': 'action-approve',
			'CANCEL_TEMPLATE': 'action-cancel'
		};
		return classesMap[action] || '';
	};

	useEffect(() => {
		fetchAuditLogs(1);
	}, []);

	if (loading && auditLogs.length === 0) {
		return <Spinner />;
	}

	return (
		<div className="mt-5">
			<h3 className="h4 mb-3">Movimientos recientes</h3>
			
			<div className="d-flex flex-wrap gap-3 mb-4">
				<div className="badge bg-secondary p-2">
					📊 Usuarios distintos: <strong>{stats.totalUsers}</strong>
				</div>
				<div className="badge bg-secondary p-2">
					📋 Acciones distintas: <strong>{stats.totalActions}</strong>
				</div>
				<div className="badge bg-secondary p-2">
					📝 Total registros: <strong>{pagination.total}</strong>
				</div>
			</div>
			
			<div className="row g-2 align-items-end mb-4">
				<div className="col-md-3">
					<label className="form-label">Usuario</label>
					<select 
						name="userId" 
						value={filters.userId} 
						onChange={handleFilterChange}
						className="form-select"
					>
						<option value="">Todos los usuarios</option>
						{users.map(user => (
							<option key={user.id} value={user.id}>{user.name}</option>
						))}
					</select>
				</div>
				
				<div className="col-md-3">
					<label className="form-label">Acción</label>
					<select 
						name="action" 
						value={filters.action} 
						onChange={handleFilterChange}
						className="form-select"
					>
						<option value="">Todas las acciones</option>
						{actions.map(action => (
							<option key={action} value={action}>{getActionText(action)}</option>
						))}
					</select>
				</div>
				
				<div className="col-md-2">
					<label className="form-label">Desde</label>
					<input
						type="date"
						name="startDate"
						value={filters.startDate}
						onChange={handleFilterChange}
						className="form-control"
					/>
				</div>
				
				<div className="col-md-2">
					<label className="form-label">Hasta</label>
					<input
						type="date"
						name="endDate"
						value={filters.endDate}
						onChange={handleFilterChange}
						className="form-control"
					/>
				</div>
				
				<div className="col-md-2 d-flex gap-2">
					<button className="btn btn-primary" onClick={handleApplyFilters}>
						Filtrar
					</button>
					<button className="btn btn-outline-secondary" onClick={handleResetFilters}>
						Limpiar
					</button>
				</div>
			</div>

			<div className="mt-5 mb-5">
				<Pagination 
					page={pagination.page}
					totalPages={pagination.totalPages}
					onPageChange={handlePageChange}
					emptyMessage="No hay registros de auditoría"
				/>
			</div>
			
			
			<div className="table-responsive">
				<table className="table table-striped table-hover align-middle">
					<thead className="table-dark">
						<tr>
							<th>Usuario</th>
							<th>Acción</th>
							<th>Recurso</th>
							<th>IP</th>
							<th>Fecha</th>
						</tr>
					</thead>
					<tbody>
						{filteredLogs.map((log) => (
							<tr key={log.id}>
								<td>{log.userName || 'N/A'}</td>
								<td className={getActionClass(log.action)}>
									{getActionText(log.action)}
								</td>
								<td>{log.targetId || '—'}</td>
								<td>{log.ipAddress || '—'}</td>
								<td>{new Date(log.timestamp).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			
			<Pagination 
				page={pagination.page}
				totalPages={pagination.totalPages}
				onPageChange={handlePageChange}
				emptyMessage="No hay registros de auditoría"
			/>
		</div>
	);
};

export default AdminAuditTable;
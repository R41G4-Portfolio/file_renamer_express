const AdminStats = ({ stats }) => {
	return (
		<div className="table-responsive">
			<table className="table table-bordered text-center align-middle">
				<thead className="table-dark">
					<tr>
						<th>Total</th>
						<th>Activas</th>
						<th>Completadas</th>
						<th>Canceladas</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className="fw-bold">{stats.total}</td>
						<td className="text-success fw-bold">{stats.active}</td>
						<td className="text-primary fw-bold">{stats.completed}</td>
						<td className="text-danger fw-bold">{stats.cancelled}</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default AdminStats;
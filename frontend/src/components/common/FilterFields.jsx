const FilterFields = ({ 
	searchTerm, 
	onSearchChange, 
	statusFilter, 
	onStatusChange, 
	sortBy, 
	onSortChange,
	statusOptions = [],
	sortOptions = [],
	placeholder = "🔍 Buscar..."
}) => {
	return (
		<div className="d-flex flex-wrap gap-3 align-items-end mb-4">
			<div className="grow" style={{ minWidth: '200px' }}>
				<input
					type="text"
					placeholder={placeholder}
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					className="form-control"
				/>
			</div>
			<div className="d-flex gap-2 flex-wrap">
				{statusOptions.length > 0 && (
					<select
						value={statusFilter}
						onChange={(e) => onStatusChange(e.target.value)}
						className="form-select w-auto"
					>
						{statusOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				)}

				{sortOptions.length > 0 && (
					<select
						value={sortBy}
						onChange={(e) => onSortChange(e.target.value)}
						className="form-select w-auto"
					>
						{sortOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				)}
			</div>
		</div>
	);
};

export default FilterFields;
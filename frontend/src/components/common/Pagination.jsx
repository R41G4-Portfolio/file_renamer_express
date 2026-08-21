const Pagination = ({ 
	page, 
	totalPages, 
	onPageChange,
	disabled = false,
	emptyMessage = "No hay registros para mostrar"
}) => {
	const handlePrevious = () => {
		if (page > 1 && !disabled) {
			onPageChange(page - 1);
		}
	};

	const handleNext = () => {
		if (page < totalPages && !disabled) {
			onPageChange(page + 1);
		}
	};

	if (totalPages === 0) {
		return <p className="text-center text-muted py-4">{emptyMessage}</p>;
	}

	if (totalPages === 1 && !disabled) {
		return null;
	}

	return (
		<div className="d-flex justify-content-center align-items-center gap-3 mt-4">
			<button
				onClick={handlePrevious}
				disabled={page === 1 || disabled}
				className="btn btn-outline-primary"
			>
				Anterior
			</button>
			<span className="text-muted fw-semibold">
				Página {page} de {totalPages}
			</span>
			<button
				onClick={handleNext}
				disabled={page === totalPages || disabled}
				className="btn btn-outline-primary"
			>
				Siguiente
			</button>
		</div>
	);
};

export default Pagination;
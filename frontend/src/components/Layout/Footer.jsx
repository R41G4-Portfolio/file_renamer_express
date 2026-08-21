const Footer = () => {
	return (
		<footer className="footer bg-dark text-center text-muted  text-white py-3 mt-auto border-top">
			<p className="mb-0">
				© {new Date().getFullYear()} File Renamer - Sistema de gestión de documentos
			</p>
		</footer>
	);
};

export default Footer;
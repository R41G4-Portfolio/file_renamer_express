import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

function AppContent() {
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);
	const hideNavAndFooter = location.pathname === '/login' || location.pathname === '/register';

	const toggleMenu = () => setMenuOpen(!menuOpen);
	const closeMenu = () => setMenuOpen(false);

	return (
		<div className="d-flex flex-column min-vh-100">
			{!hideNavAndFooter && (
				<>
					<Header title="File Renamer" onMenuClick={toggleMenu} />
				</>
			)}
			<main className="grow">
				<AppRoutes />
			</main>
			{!hideNavAndFooter && <Footer />}
		</div>
	);
}

function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	);
}

export default App;
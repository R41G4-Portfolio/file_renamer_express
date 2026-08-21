// hooks/useApiError.js
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const useApiError = () => {
	const navigate = useNavigate();
	
	const handleError = (error, onClose) => {
		if (error.message === 'SESSION_REVOKED') {
			document.cookie = 'token=; Max-Age=0; path=/';
			document.cookie = 'user_context=; Max-Age=0; path=/';
			Swal.fire({
				title: 'Sesión cerrada',
				text: 'Tu sesión se cerró porque iniciaste sesión en otro dispositivo',
				icon: 'warning',
				confirmButtonText: 'Ir a login'
			}).then(() => {
				navigate('/login');
			});
		} else if (error.message === 'SESSION_EXPIRED') {
			document.cookie = 'token=; Max-Age=0; path=/';
			document.cookie = 'user_context=; Max-Age=0; path=/';
			Swal.fire({
				title: 'Sesión expirada',
				text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
				icon: 'warning',
				confirmButtonText: 'Ir a login'
			}).then(() => {
				navigate('/login');
			});
		} else {
			Swal.fire('Error', error.message, 'error');
			if (onClose) onClose();
		}
	};
	
	return { handleError };
};
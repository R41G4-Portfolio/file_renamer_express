import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // <-- Agregar
import { api } from '../services/api';
import { getContextFromCookie, clearUserContext } from '../utils/sessionHelper';
import Swal from 'sweetalert2';  // <-- Agregar

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth debe usarse dentro de un AuthProvider');
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const navigate = useNavigate();  // <-- Agregar
	const [user, setUser] = useState(() => getContextFromCookie());
	const [isAuthenticated, setIsAuthenticated] = useState(!!getContextFromCookie());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const verifyContext = () => {
			const context = getContextFromCookie();
			if (context) {
				setUser(context);
				setIsAuthenticated(true);
			} else {
				setUser(null);
				setIsAuthenticated(false);
			}
			setLoading(false);
		};

		verifyContext();
	}, []);

	// Escuchar eventos de sesión
	useEffect(() => {
		const handleSessionExpired = (event) => {
			setUser(null);
			setIsAuthenticated(false);
			clearUserContext();
			
			Swal.fire({
				title: 'Sesión cerrada',
				text: event.detail.message,
				icon: 'warning',
				confirmButtonText: 'Ir a login',
				allowOutsideClick: false
			}).then(() => {
				navigate('/login');
			});
		};
		
		window.addEventListener('session:expired', handleSessionExpired);
		
		return () => {
			window.removeEventListener('session:expired', handleSessionExpired);
		};
	}, [navigate]);

	const login = async (email, password) => {
		try {
			// Limpiar cookies existentes ANTES del login
			document.cookie = 'token=; Max-Age=0; path=/';
			document.cookie = 'user_context=; Max-Age=0; path=/';
			
			const result = await api.login({ email, password });
			
			const normalizedUser = {
				...result.user,
				role: result.user.rol || result.user.role,
				rol: result.user.rol || result.user.role
			};
			
			setUser(normalizedUser);
			setIsAuthenticated(true);
			
			return { success: true };
		} catch (error) {
			console.error('Error detallado en login:', error);
			return { 
				success: false, 
				error: error.message || 'Error al iniciar sesión' 
			};
		}
	};

	const register = async (userData) => {
		try {
			await api.register(userData);
			return { success: true };
		} catch (error) {
			return { 
				success: false, 
				error: error.message || 'Error en el registro' 
			};
		}
	};

	const logout = async () => {
		try {
			await api.logout();
		}
		
		catch (error)
		{
			console.error('Error durante el cierre de sesión:', error);
			// No importa si falla, igual limpiamos la sesión local
		}
		finally {
			// Limpieza total en el cliente SIEMPRE
			setUser(null);
			setIsAuthenticated(false);
			clearUserContext();
			
			// Limpiar cookies manualmente por si acaso
			document.cookie = 'token=; Max-Age=0; path=/';
			document.cookie = 'user_context=; Max-Age=0; path=/';
			
			navigate('/login');
		}
	};

	return (
		<AuthContext.Provider value={{
			isAuthenticated,
			user,
			loading,
			login,
			register,
			logout
		}}>
			{children}
		</AuthContext.Provider>
	);
};
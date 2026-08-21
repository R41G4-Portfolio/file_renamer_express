import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema } from '../../utils/validations';
import { clearUserContext } from '../../utils/sessionHelper';
import { INTERNAL_ROUTES } from '../../constants/routes';


const Login = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	
	const { login } = useAuth();

	const handleEmailChange = (e) => {
		const value = e.target.value;
		setEmail(value);
		const result = loginSchema.safeParse({ email: value, password });
		if (!result.success) {
			const flattened = result.error.flatten();
			setEmailError(flattened.fieldErrors?.email?.[0] || '');
		} else {
			setEmailError('');
		}
	};

	const handlePasswordChange = (e) => {
		const value = e.target.value;
		setPassword(value);
		const result = loginSchema.safeParse({ email, password: value });
		if (!result.success) {
			const flattened = result.error.flatten();
			setPasswordError(flattened.fieldErrors?.password?.[0] || '');
		} else {
			setPasswordError('');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		
		const validation = loginSchema.safeParse({ email, password });
		if (!validation.success) {
			setError('Por favor, corrige los errores en el formulario');
			return;
		}

		setIsLoading(true);

		try {
			clearUserContext();
			const result = await login(email, password);
			
			if (result.success) {
				navigate(INTERNAL_ROUTES.DASHBOARD);
			} else {
				setError(result.error || 'Error al iniciar sesión');
			}
		} catch (err) {
			setError('Error de conexión con el servidor');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
			<div className="card shadow card-login mx-auto">
				<div className="card-body p-4">
					<h1 className="card-title text-center mb-2">File Renamer</h1>
					<h2 className="text-center text-muted fs-5 mb-4">Iniciar Sesión</h2>
					
					<form onSubmit={handleSubmit} noValidate>
						<div className="mb-3">
							<label htmlFor="email" className="form-label">Email</label>
							<input
								id="email"
								type="email"
								className={`form-control ${emailError ? 'is-invalid' : ''}`}
								value={email}
								onChange={handleEmailChange}
								disabled={isLoading}
								placeholder="correo@ejemplo.com"
							/>
							{emailError && <div className="invalid-feedback">{emailError}</div>}
						</div>
						
						<div className="mb-3">
							<label htmlFor="password" className="form-label">Contraseña</label>
							<input
								id="password"
								type="password"
								className={`form-control ${passwordError ? 'is-invalid' : ''}`}
								value={password}
								onChange={handlePasswordChange}
								disabled={isLoading}
								placeholder="••••••••"
							/>
							{passwordError && <div className="invalid-feedback">{passwordError}</div>}
						</div>
						
						{error && <div className="alert alert-danger" role="alert">{error}</div>}
						
						<button
							type="submit"
							className="btn btn-primary w-100 mb-3"
							disabled={isLoading}
						>
							{isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
						</button>
						
						<button
							type="button"
							className="btn btn-link w-100 text-decoration-none"
							onClick={() => navigate(INTERNAL_ROUTES.REGISTER)}
							disabled={isLoading}
						>
							¿No tienes cuenta? Regístrate
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
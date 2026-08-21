import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { registerSchema } from '../../utils/validations';
import { INTERNAL_ROUTES } from '../../constants/routes';

const Register = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		role: 'DOWNLOADER'
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [fieldErrors, setFieldErrors] = useState({});
	
	const { register } = useAuth();

	const validateField = (name, value) => {
		const testObj = { ...formData, [name]: value };
		const result = registerSchema.safeParse(testObj);
		if (result.success) return '';
		const issue = result.error.issues.find(issue => issue.path[0] === name);
		return issue ? issue.message : '';
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (fieldErrors[name]) {
			setFieldErrors(prev => ({ ...prev, [name]: '' }));
		}
	};

	const handleBlur = (e) => {
		const { name, value } = e.target;
		const errorMsg = validateField(name, value);
		setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		const result = registerSchema.safeParse(formData);
		if (!result.success) {
			const errors = {};
			result.error.issues.forEach(issue => {
				errors[issue.path[0]] = issue.message;
			});
			setFieldErrors(errors);
			return;
		}

		setIsLoading(true);
		const registerResult = await register(formData);
		if (registerResult.success) {
			setSuccess('Usuario registrado correctamente');
			setTimeout(() => navigate(INTERNAL_ROUTES.LOGIN), 2000);
		} else {
			setError(registerResult.error || 'Error al registrar usuario');
		}
		setIsLoading(false);
	};

	return (
		<div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
			<div className="card shadow card-login mx-auto">
				<div className="card-body p-4">
					<h1 className="card-title text-center mb-2">File Renamer</h1>
					<h2 className="text-center text-muted fs-5 mb-4">Registro de Usuario</h2>
					<form onSubmit={handleSubmit}>
						<div className="mb-3">
							<label className="form-label">Nombre</label>
							<input
								type="text"
								name="name"
								className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
								value={formData.name}
								onChange={handleChange}
								onBlur={handleBlur}
								disabled={isLoading}
							/>
							{fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
						</div>
						<div className="mb-3">
							<label className="form-label">Email</label>
							<input
								type="email"
								name="email"
								className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
								value={formData.email}
								onChange={handleChange}
								onBlur={handleBlur}
								disabled={isLoading}
							/>
							{fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
						</div>
						<div className="mb-3">
							<label className="form-label">Contraseña</label>
							<input
								type="password"
								name="password"
								className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
								value={formData.password}
								onChange={handleChange}
								onBlur={handleBlur}
								disabled={isLoading}
							/>
							{fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
						</div>
						{error && <div className="alert alert-danger" role="alert">{error}</div>}
						{success && <div className="alert alert-success" role="alert">{success}</div>}
						<button type="submit" className="btn btn-primary w-100 mb-3" disabled={isLoading}>
							{isLoading ? 'Registrando...' : 'Registrarse'}
						</button>
						<button type="button" className="btn btn-link w-100 text-decoration-none" onClick={() => navigate(INTERNAL_ROUTES.LOGIN)} disabled={isLoading}>
							Volver al inicio de sesión
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Register;
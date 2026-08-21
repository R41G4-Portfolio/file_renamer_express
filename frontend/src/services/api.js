// src/services/api.js
// URL base con el prefijo de versión definido en tu ruteo de backend
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

let onSessionExpired = null;

export const setSessionExpiredCallback = (callback) => {
	onSessionExpired = callback;
};

// Orquestador de respuestas para estandarizar el flujo de Governance
const handleResponse = async (response) => {
	if (response.ok) {
		return response.status === 204 ? null : response.json();
	}
	
	const error = await response.json();
	
	// Manejo de errores de sesión
	if (response.status === 401) {
		const cleanCookies = () => {
			document.cookie = 'token=; Max-Age=0; path=/';
			document.cookie = 'user_context=; Max-Age=0; path=/';
		};
		
		const dispatchSessionEvent = (message) => {
			cleanCookies();
			window.dispatchEvent(new CustomEvent('session:expired', { detail: { message } }));
		};
		
		switch (error.error) {
			case 'Sesión cerrada en otro dispositivo':
				dispatchSessionEvent('Tu sesión se cerró porque iniciaste sesión en otro dispositivo');
				return;
			case 'Sesión inválida o expirada':
				dispatchSessionEvent('Tu sesión ha expirado');
				return;
		}
	}
	
	throw new Error(error.message || error.error || 'Error en la comunicación con el servidor');
};


export const api = {
	// 1. AUTENTICACIÓN 
	register: async (userData) => {
		const response = await fetch(`${API_URL}/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(userData)
		});
		return handleResponse(response);
	},

	login: async (credentials) => {
		console.log('api.login llamado con:', credentials.email);
		const response = await fetch(`${API_URL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(credentials)
		});
		console.log('Respuesta status:', response.status);
		return handleResponse(response);
	},

	logout: async () => {
		const response = await fetch(`${API_URL}/auth/logout`, {
			method: 'POST',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	// 2. PLANTILLAS / TEMPLATES 
	getTemplates: async () => {
		const response = await fetch(`${API_URL}/templates`, {
			method: 'GET',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	getTemplateBySid: async (sid) => {
		const response = await fetch(`${API_URL}/templates/${sid}`, {
			method: 'GET',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	uploadTemplate: async (file, title, assignedTo) => {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('title', title);
		formData.append('assignedTo', assignedTo);
		
		const response = await fetch(`${API_URL}/templates/upload`, {
			method: 'POST',
			credentials: 'include',
			body: formData
		});
		return handleResponse(response);
	},

	approveTemplate: async (sid) => {
		const response = await fetch(`${API_URL}/templates/${sid}/approve`, {
			method: 'PATCH',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	cancelTemplate: async (sid, data = {}) => {
		const response = await fetch(`${API_URL}/templates/${sid}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(data)
		});
		return handleResponse(response);
	},
	
	assignTemplate: async (templateSid, email) => {
		const response = await fetch(`${API_URL}/templates/${templateSid}/assign`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ email })
		});
		return handleResponse(response);
	},
	

	// 3. ASIGNACIONES / ASSIGNMENTS 
	uploadAssignmentDoc: async (assignmentSid, file, templateSid, rowIndex) => {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('assignmentSid', assignmentSid);
		formData.append('templateSid', templateSid);
		formData.append('rowIndex', rowIndex);
		
		const response = await fetch(`${API_URL}/assignments/upload`, {
			method: 'POST',
			credentials: 'include',
			body: formData
		});
		return handleResponse(response);
	},

	reviewAssignment: async (assignmentSid, status, comments, templateSid, rowIndex) => {
		const body = { assignmentSid, status, comments, templateSid, rowIndex };
		console.log('Enviando a reviewAssignment:', body);
		
		const response = await fetch(`${API_URL}/assignments/review`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(body)
		});
		return handleResponse(response);
	},

	// 4. PAQUETES ZIP 
	downloadZip: async (templateSid) => {
		const response = await fetch(`${API_URL}/zip/download/${templateSid}`, {
			method: 'GET',
			credentials: 'include'
		});
		
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Error al descargar ZIP');
		}
		
		return response.blob();
	},

	// 5. DASHBOARD 
	getDashboardTemplates: async (page = 1, limit = 10) => {
		const response = await fetch(`${API_URL}/dashboard/templates?page=${page}&limit=${limit}`, {
			method: 'GET',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	// 6. ADMIN 
	getAdminTemplates: async (page = 1, limit = 10) => {
		const response = await fetch(`${API_URL}/admin/templates?page=${page}&limit=${limit}`, {
			method: 'GET',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	getAuditLogs: async (page = 1, limit = 50) => {
		const response = await fetch(`${API_URL}/audit?page=${page}&limit=${limit}`, {
			method: 'GET',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	// 7. TAREAS (DOWNLOADER) 
	getMyTasks: async (page = 1, limit = 10) => {
		const response = await fetch(`${API_URL}/tasks/assignments?page=${page}&limit=${limit}`, {
			method: 'GET',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	getMyAssignedTemplates: async () => {
		const response = await fetch(`${API_URL}/tasks/my-templates`, {
			method: 'GET',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	// 8. USUARIOS 
	getDownloaders: async () => {
		const response = await fetch(`${API_URL}/users/role/DOWNLOADER`, {
			method: 'GET',
			credentials: 'include'
		});
		return handleResponse(response);
	},

	downloadEmptyTemplate: async () => {
		const response = await fetch(`${API_URL}/templates/download-template`, {
			method: 'GET',
			credentials: 'include'
		});
		return response.blob();
	},

	downloadTemplateExcel: async (templateSid) => {
		const response = await fetch(`${API_URL}/templates/download-excel/${templateSid}`, {
			method: 'GET',
			credentials: 'include'
		});
		return response.blob();
	},
};
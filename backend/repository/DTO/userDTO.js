/*
	DTO de Respuesta de Usuario.
	Actúa como filtro de seguridad para transformar los datos de la BD 
	en un objeto seguro para el cliente (Lista Blanca).
*/
export const loginMappingDTO = (user) => {
	return {
		nombre: user.name,
		sid: user.sid,
		rol: user.rol || user.role
	};
};

/*
	DTO para el Registro
*/
export const userResponseDTO = (user) => {
	return {
		sid: user.sid,
		nombre: user.nombre || user.name,
		email: user.email,
		rol: user.rol || user.role
	};
};
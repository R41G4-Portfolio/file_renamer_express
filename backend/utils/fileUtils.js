/*
 * Normaliza un nombre de archivo
 * - Reemplaza espacios por guiones
 * - Reemplaza guiones bajos por guiones
 * - Convierte a minúsculas
 * - Elimina caracteres especiales
 */
export const normalizeFileName = (fileName) => {
	if (!fileName) return '';
	
	// Separar nombre y extensión
	const lastDot = fileName.lastIndexOf('.');
	const name = fileName.substring(0, lastDot);
	const ext = fileName.substring(lastDot);
	
	// Normalizar solo el nombre, conservar extensión
	let normalized = name
		.toLowerCase()
		.replace(/[áäâà]/g, 'a')
		.replace(/[éëêè]/g, 'e')
		.replace(/[íïîì]/g, 'i')
		.replace(/[óöôò]/g, 'o')
		.replace(/[úüûù]/g, 'u')
		.replace(/ñ/g, 'n')
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
	
	return normalized + ext;
};
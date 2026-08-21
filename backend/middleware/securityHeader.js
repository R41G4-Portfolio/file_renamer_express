export const robotControl = (req, res, next) => {
	// Instrucción explícita para no indexar ni seguir enlaces de la API
	res.setHeader('X-Robots-Tag', 'noindex, nofollow');
	next();
};
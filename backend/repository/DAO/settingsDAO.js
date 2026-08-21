// repository/DAO/settingsDao.js
import Settings from '../../models/Settings.js';

let cachedSettings = null;
let lastFetch = 0;
const TTL = 1000 * 60 * 10; // 10 minutos (Ajustable según tu paranoia)

/*
Obtiene las configuraciones dinámicas. 
Implementa estrategia Lazy Load con TTL.
*/
export const getActiveSettings = async (forceRefresh = false) => {
    const now = Date.now();

    // Retorno rápido desde RAM
    if (cachedSettings && !forceRefresh && (now - lastFetch < TTL)) {
        return cachedSettings;
    }

    try {
        // Consulta optimizada: solo el documento más reciente
        const settings = await Settings.findOne().sort({ createdAt: -1 }).lean();

        if (settings) {
            cachedSettings = settings;
            lastFetch = now;
            console.log(`[SETTINGS] Cache updated at ${new Date(now).toISOString()}`);
            return cachedSettings;
        }

        // Si no hay nada en la BD, devolvemos un objeto de emergencia para que el sistema siga operando con seguridad.
        return {
            maxFileSizeMB: 5, // Más restrictivo por seguridad
            allowedExtensions: ['.pdf'],
            forbiddenChars: ['<', '>', ':'],
            normalizeRules: { toLowerCase: true }
        };

    } catch (error) {
        console.error('[CRITICAL] Error fetching settings from DB:', error.message);
        // Si la DB falla, devolvemos la última caché conocida o el default
        return cachedSettings || { maxFileSizeMB: 2 }; 
    }
};

/*
Fuerza la invalidación de la caché.
Útil para el "Botón de Sincronización" en el Panel Admin.
*/
export const invalidateSettingsCache = () => {
    lastFetch = 0;
    console.log('[SETTINGS] Cache invalidated manually.');
};
/* 
    Script de inicialización para la colección Settings
    Ajustado para asegurar la lectura de la URI
*/
import mongoose from 'mongoose';
import config from './config/index.js';
import Settings from './models/Settings.js';

const seedSettings = async () => {
    try {
        // Validación preventiva
        const uri = config.mongodbUri || process.env.MONGODB_URI_DEV;
        
        if (!uri) {
            throw new Error('La URI de MongoDB no está definida en la configuración.');
        }

        console.log('[SEEDER] Conectando a MongoDB...');
        await mongoose.connect(uri);

        // Limpiamos la colección para evitar duplicados
        await Settings.deleteMany({});

        const defaultSettings = {
            allowedExtensions: ['.pdf', '.jpg', '.png', '.docx', '.xlsx'],
            forbiddenChars: ['<', '>', ':', '"', '|', '?', '*', '\\'],
            maxFileSizeMB: 15,
            maxExcelRows: 5000,
            normalizeRules: {
                replaceSpaces: true,
                replaceUnderscores: true,
                toLowerCase: true
            },
            updatedBy: 'SYSTEM_SEEDER',
            schemaVersion: 1
        };

        await Settings.create(defaultSettings);

        console.log('[SEEDER] Configuración inicial creada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('[SEEDER] Error al poblar la base de datos:', error.message);
        process.exit(1);
    }
};

seedSettings();
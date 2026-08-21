import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export default {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    
    // MongoDB - URI directa (más simple)
    mongoUri: isProduction 
        ? process.env.MONGODB_URI_PROD 
        : process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017/file_renamer',
    
    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    
    // Archivos
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 10,
    uploadsPath: process.env.UPLOADS_PATH || './uploads',

    // Rutas de directorios específicas
    uploadDir: process.env.UPLOAD_DIR || 'uploads/temp',
    processedExcelDir: process.env.PROCESSED_EXCEL_DIR || 'uploads/processed',
    requestDocsDir: process.env.REQUEST_DOCS_DIR || 'uploads/documents',
	emptyTemplatePath: process.env.EMPTY_TEMPLATE_PATH || './public/templates/plantilla_base.xlsx'
};
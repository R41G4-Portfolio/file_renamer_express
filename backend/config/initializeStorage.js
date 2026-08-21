import path from 'path';
import fs from 'fs';

// Verificar y crear las carpetas del .env si no existen
const initializeStorage = () => {
    const directories = [
        process.env.UPLOAD_DIR || 'uploads/temp',
        process.env.PROCESSED_EXCEL_DIR || 'uploads/processed',
        process.env.REQUEST_DOCS_DIR || 'uploads/documents'
    ];

    directories.forEach(dir => {
        const absolutePath = path.join(process.cwd(), dir);
        if (!fs.existsSync(absolutePath)) {
            fs.mkdirSync(absolutePath, { recursive: true });
        }
    });
};

export default initializeStorage
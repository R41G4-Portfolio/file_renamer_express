import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/index.js';

const tempDir = path.join(process.cwd(), config.uploadDir);

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

/*
	Filtro restrictivo para la validación de estructuras de plantillas madre.
*/
const excelFilter = (req, file, cb) => {
    const validExtensions = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (validExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('INVALID_FILE_TYPE: Solo se permiten archivos de Excel (.xlsx)'), false);
    }
};

/*
	Middleware dinámico para la carga y validación de tamaños de plantillas Excel.
*/
export const uploadExcel = (req, res, next) => {
    const upload = multer({ 
        storage: storage,
        fileFilter: excelFilter,
        limits: {
            fileSize: config.maxFileSizeMB * 1024 * 1024
        }
    }).single('file');

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ 
                success: false, 
                error: err.code === 'LIMIT_FILE_SIZE' 
                    ? `El archivo excede el límite máximo de ${config.maxFileSizeMB}MB configurado.` 
                    : err.message 
            });
        }
        next();
    });
};

/*
	Filtro dinámico basado en la configuración para archivos de entrega general.
*/
const documentFilter = (req, file, cb) => {
    const validExtensions = config.allowedDocumentExtensions || ['.pdf', '.docx', '.xlsx', '.png', '.jpg'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (validExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`INVALID_FILE_TYPE: Solo se permiten formatos válidos: ${validExtensions.join(', ')}`), false);
    }
};

/*
	Middleware dinámico para la carga de evidencias y entregables del Downloader.
*/
export const uploadDocument = (req, res, next) => {
    const upload = multer({ 
        storage: storage,
        fileFilter: documentFilter,
        limits: {
            fileSize: config.maxFileSizeMB * 1024 * 1024
        }
    }).single('file');

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ 
                success: false, 
                error: err.code === 'LIMIT_FILE_SIZE' 
                    ? `El archivo excede el límite máximo de ${config.maxFileSizeMB}MB configurado.` 
                    : err.message 
            });
        }
        next();
    });
};
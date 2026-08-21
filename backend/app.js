import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import initializeStorage from './config/initializeStorage.js'
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';

import connectDB from './config/db.js';
import config from './config/index.js';

// Importación de Rutas
import authRoutes from './routes/authRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import zipRoutes from './routes/zipRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js'
import auditRoutes from './routes/auditRoutes.js';
import { getActiveSettings } from './repository/DAO/index.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Se ejecuta antes de arrancar Express para garantizar la existencia de directorios (temp, documents, output, etc.)
initializeStorage();

const app = express();

// Ambiente del servidor
const isProduction = config.env === 'production';

// Cabeceras de Seguridad (CSP)
// Se han configurado directivas para permitir la comunicación con el cliente y la gestión de blobs para descargas
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"],
			styleSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:"],
			connectSrc: ["'self'", config.clientUrl, `http://localhost:${config.port}`],
			fontSrc: ["'self'"],
			objectSrc: ["'none'"],
			mediaSrc: ["'self'"],
			// frameSrc y childSrc extendidos para soportar la previsualización y descarga de documentos
			frameSrc: ["'self'", "blob:", "data:", `http://localhost:${config.port}`],
			frameAncestors: ["'self'", config.clientUrl],
			childSrc: ["'self'", "blob:"],
			scriptSrcAttr: ["'none'"]
		}
	}
}));

// Configuraciones del servidor
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Documentación Swagger - Repositorio de la verdad técnica
const swaggerDocument = yaml.load(fs.readFileSync('./docs/swagger.yaml', 'utf8'));

/*
	Procedimiento de Arranque del Servidor
	Orquesta la conexión a DB, la carga de settings dinámicos y la activación de rutas.
*/
const startServer = async () => {
	try {
		// 1. Conexión a Infraestructura (MongoDB)
		await connectDB();

		// 2. Carga de configuraciones dinámicas iniciales (Gobernanza de Reglas)
		// Estas reglas (límites de tamaño, tipos de archivos) se sincronizan desde la colección Settings
		const activeConfig = await getActiveSettings();
		if (!activeConfig) {
			console.warn('[WARN] No se detectaron configuraciones en DB, usando defaults.');
		} else {
			console.log('[CONF] Configuraciones dinámicas cargadas correctamente.');
		}

		// 3. Inyección de Topología de Rutas (API v1)
		app.use('/api/v1/auth', authRoutes);
		app.use('/api/v1/templates', templateRoutes);
		app.use('/api/v1/assignments', assignmentRoutes);
		app.use('/api/v1/zip', zipRoutes);
		app.use('/api/v1/dashboard', dashboardRoutes)
		app.use('/api/v1/admin', adminRoutes);
		app.use('/api/v1/audit', auditRoutes);
		app.use('/api/v1/tasks', taskRoutes);
		app.use('/api/v1/users', userRoutes);

		// Documentación interactiva de la API
		app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

		// 4. Encendido del motor HTTP
		app.listen(config.port, () => {
			console.log('---------------------------------------------------------');
			console.log(`[SERVER] Operando en puerto ${config.port} en modo ${config.env}`);
			console.log(`[DOCS] Swagger UI disponible en: http://localhost:${config.port}/api-docs`);
			console.log('---------------------------------------------------------');
		});

		// Middleware Global para Manejo de Rutas no encontradas (404)
		app.use((req, res) => {
			res.status(404).json({
				success: false,
				code: 'ROUTE_NOT_FOUND',
				message: `La ruta ${req.originalUrl} no existe en este servidor.`
			});
		});

	} catch (error) {
		console.error('[CRITICAL] Fallo en el arranque del servidor:', error.message);
		process.exit(1);
	}
};

startServer();
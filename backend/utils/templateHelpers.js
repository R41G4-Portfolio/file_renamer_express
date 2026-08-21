import fs from 'fs';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
//Reglas de nombrado de archivos
import { normalizeFileName } from './fileUtils.js';

/*
	HELPERS: Funciones de utilidad técnica.
	Manejan la lectura de archivos y generación de IDs únicos.

	Procesa el Excel para extraer el mapa de renombrado y validar estructura.
	Aplica normalización a los nombres deseados.
*/

export const processExcelRules = async (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`FILE_NOT_FOUND: ${filePath}`);
        }

        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        // 1. Ubicar hoja técnica de integridad
        const metadataSheet = workbook.Sheets['_Metadata'];
        if (!metadataSheet) {
            throw new Error('INVALID_TEMPLATE_ORIGIN: Falta hoja _Metadata');
        }

        // 2. Extraer Metadata Vertical (A: Llave, B: Valor)
        const rawMetadata = XLSX.utils.sheet_to_json(metadataSheet, { header: 1 });
        const metadata = {};
        
        rawMetadata.forEach(row => {
            if (row[0] && row[1] !== undefined) {
                metadata[row[0].toString().trim()] = row[1].toString().trim();
            }
        });

        // 3. VALIDACIÓN DE MARCA DE AUTENTICIDAD (HAPPY PATH)
        const EXPECTED_HASH = 'cd926708b93a7a32'; 
        const EXPECTED_SCHEMA = '1';

        if (metadata.schemaVersion !== EXPECTED_SCHEMA) {
            throw new Error(`OUTDATED_SCHEMA: Se requiere versión ${EXPECTED_SCHEMA}`);
        }

        if (metadata.plantillaHash !== EXPECTED_HASH) {
            throw new Error('UNAUTHORIZED_TEMPLATE_ALTERATION');
        }

        // 4. Mapeo Dinámico de Columnas desde Metadata
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] || [];
        
        // Obtenemos nombres de columnas de la metadata (ruta, nombre)
        const requiredCols = metadata.columnas_requeridas 
            ? metadata.columnas_requeridas.split(',').map(c => c.trim()) 
            : ['ruta', 'nombre'];

        const missingHeaders = requiredCols.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`MISSING_COLUMNS: [${missingHeaders.join(', ')}]`);
        }

        // 5. Procesamiento de Datos
        const data = XLSX.utils.sheet_to_json(worksheet);
        const renamingRules = data.map((row, index) => {
            return {
                rowIndex: index + 2,
                folderPath: row[requiredCols[0]] || '/',
                desiredName: normalizeFileName(row[requiredCols[1]] || '')
            };
        });

        return { rowCount: renamingRules.length, renamingRules };

    } catch (error) {
        // Log para auditoría técnica
        console.error(`[METADATA_HELPER_ERROR] ${error.message}`);
        throw error;
    }
};

export const generatePublicSid = () => {
    return uuidv4();
};
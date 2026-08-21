import { createTemplateDAO } from '../../repository/DAO/templateDAO.js';
import { processExcelRules } from '../../utils/templateHelpers.js';
import path from 'path';

export const testDAOLogic = async () => {
    console.log('--- [TEST 01] Validación de DAO con Excel Real ---');
    
    // Ruta al archivo que ya tienes generado
    const realFilePath = path.join('uploads', 'temp', 'plantilla_file_renamer.xlsx');

    try {
        // 1. Extraemos las reglas usando el helper (aquí se aplica la normalización)
        const { rowCount, renamingRules } = await processExcelRules(realFilePath);
        
        console.log(`✔ Filas detectadas: ${rowCount}`);
        console.log(`✔ Ejemplo de nombre normalizado: ${renamingRules[0]?.desiredName}`);

        // 2. Creamos el objeto DAO
        const mockFile = {
            originalname: 'plantilla_file_renamer.xlsx',
            path: realFilePath
        };

        const dao = createTemplateDAO('user-sid-999', mockFile, 'Test de Carga Real', rowCount, renamingRules);
        
        if (!dao.sid) throw new Error('El DAO no generó un SID válido');
        
        console.log('✅ TEST 01: PASADO (Datos listos para persistir)\n');
        return { dao, renamingRules };
    } catch (error) {
        console.error('❌ TEST 01: FALLIDO -', error.message);
        return null;
    }
};
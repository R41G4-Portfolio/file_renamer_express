import * as templateWorkflow from '../../commands/templateWorkflow.js';
import path from 'path';

export const testFullIntegration = async () => {
    console.log('--- [TEST 03] Flujo de Integración Completo (Re-subida) ---');
    
    const realFilePath = path.join('uploads', 'temp', 'plantilla_file_renamer.xlsx');
    
    const mockReq = {
        user: { sid: 'user-sid-999', role: 'ADMIN' },
        body: { title: 'Segunda Carga de Prueba' }
    };

    const mockFile = {
        originalname: 'plantilla_file_renamer.xlsx',
        path: realFilePath
    };

    try {
        // Simulamos la acción del controlador llamando directamente al workflow
        const result = await templateWorkflow.executeUpload(mockReq, mockFile, mockReq.body.title);
        
        console.log('✔ Nuevo Template creado con SID:', result.sid);
        console.log('✔ Filas procesadas exitosamente:', result.rowCount);

        console.log('✅ TEST 03: PASADO (Integración exitosa)\n');
    } catch (error) {
        console.error('❌ TEST 03: FALLIDO -', error.message);
    }
};
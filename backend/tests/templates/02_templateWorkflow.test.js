import * as templateWorkflow from '../../commands/templateWorkflow.js';
import path from 'path';

export const testWorkflowLogic = async () => {
	console.log('--- [TEST 02] Execution: Detalles y Errores ---');
	
	// Usamos el archivo de errores que mencionaste
	const errorFilePath = path.join('uploads', 'temp', 'plantilla_file_renamer_error.xlsx');
	
	const mockReq = {
		user: { sid: 'user-sid-error-test', role: 'ADMIN' }
	};

	const mockFile = {
		originalname: 'plantilla_file_renamer_error.xlsx',
		path: errorFilePath
	};

	try {
		// Llamada a la ejecución del workflow
		const result = await templateWorkflow.executeUpload(mockReq, mockFile, 'Test de Normalización');
		
		console.log('✔ Resultado de la ejecución:', result.sid);
		console.log('✅ TEST 02: PASADO\n');
	} catch (error) {
		console.error('❌ TEST 02: FALLIDO (Error esperado si el archivo no existe o datos corruptos):', error.message);
	}
};
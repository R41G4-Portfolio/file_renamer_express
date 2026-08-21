// executions/zipWorkflow.js
import fs from 'fs-extra';
import path from 'path';
import * as zipQueries from '../queries/zipQueries.js';
import * as assignmentQueries from '../queries/assignmentQueries.js';
import { generateZipPackage } from '../services/zipServices.js';
import { finalizeDocumentsMovement } from './finalizeFilesWorkflow.js';

/*
	Orquestación de la generación del paquete final.
	Gestiona validaciones de integridad, movimientos físicos y compresión.
*/
export const executeZipGeneration = async (templateSid, user) => {
	// 1. Obtener el template por SID (Gobernanza de Identidad)
	const template = await zipQueries.findTemplateBySidForZip(templateSid);
	if (!template) throw new Error('TEMPLATE_NOT_FOUND');

	// 2. Validación de Caché: Si el ZIP ya existe físicamente, no regeneramos
	if (template.zipPath && fs.existsSync(template.zipPath)) {
		return {
			zipPath: template.zipPath,
			zipChecksum: template.zipChecksum,
			isCached: true
		};
	}

	// 3. Protección de Estado (Anti-saturación): Evitar múltiples ejecuciones simultáneas
	if (template.isProcessing) {
		throw new Error('ZIP_GENERATION_IN_PROGRESS');
	}

	try {
		// Bloqueo de seguridad en base de datos
		await zipQueries.setProcessingStatus(templateSid, true);

		// 4. Verificar que el conteo de aprobados coincida con el total esperado (Integridad)
		const approvedAssignments = await assignmentQueries.findApprovedAssignmentsByTemplateSid(templateSid);
		
		if (approvedAssignments.length !== template.rowCount) {
			throw new Error('INCOMPLETE_OR_UNAPPROVED_ASSIGNMENTS');
		}

		// 5. Movimiento Atómico a /processed (Punto de no retorno)
		// Si el primer archivo detectado está en 'documents', movemos todo a la ubicación final
		if (approvedAssignments.length > 0 && approvedAssignments[0].filePath.includes('documents')) {
			await finalizeDocumentsMovement(templateSid, approvedAssignments);
			
			// Refrescamos las asignaciones para obtener las nuevas rutas en /processed
			const updatedAssignments = await assignmentQueries.findApprovedAssignmentsByTemplateSid(templateSid);
			approvedAssignments.splice(0, approvedAssignments.length, ...updatedAssignments);
		}

		// 6. Mapear los archivos para el servicio de compresión
		// Cruce de Assignment (archivo físico) con las reglas del Template (destino en ZIP)
		const fileMap = approvedAssignments.map(asg => {
			const rule = template.renamingRules.find(r => r.rowIndex === asg.rowIndex);
			return {
				sourcePath: asg.filePath,
				targetInternalPath: path.join(rule.folderPath, rule.desiredName),
				sha256: asg.sha256
			};
		});

		// 7. Llamar al servicio de generación física (Streams + SHA-256)
		const zipResults = await generateZipPackage(fileMap, templateSid);

		// 8. Actualizar el template con la info del ZIP y liberar bloqueo
		const finalData = {
			...zipResults,
			isProcessing: false,
			status: 'COMPLETED'
		};
		await zipQueries.updateTemplateZipInfo(templateSid, finalData);

		return { ...zipResults, isCached: false };

	} catch (error) {
		// En caso de fallo crítico, liberamos el bloqueo para permitir reintentos
		await zipQueries.setProcessingStatus(templateSid, false);
		console.error(`[WORKFLOW ERROR] Fallo en generación de ZIP: ${error.message}`);
		throw error;
	}
};
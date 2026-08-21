import fs from 'fs-extra';
import path from 'path';
import * as assignmentQueries from '../queries/assignmentQueries.js';

export const finalizeDocumentsMovement = async (templateSid, approvedAssignments) => {
    const processedBaseDir = process.env.PROCESSED_DOCS_DIR || 'uploads/processed';
    const targetFolder = path.join(processedBaseDir, templateSid);
    
    await fs.ensureDir(targetFolder);

    const movements = [];

    for (const asg of approvedAssignments) {
        if (!asg.filePath) continue;

        const fileName = path.basename(asg.filePath);
        const newPath = path.join(targetFolder, fileName);

        // Verificar que el archivo origen existe
        if (fs.existsSync(asg.filePath)) {
            // Movimiento físico
            await fs.rename(asg.filePath, newPath);
            
            movements.push({
                sid: asg.sid,
                newPath: newPath
            });
        } else {
            throw new Error(`FILE_NOT_FOUND_FOR_FINALIZATION: ${asg.filePath}`);
        }
    }

    // Actualización masiva en base de datos
    if (movements.length > 0) {
        await assignmentQueries.updateBulkPathsAfterProcessing(movements);
    }

    return movements;
};
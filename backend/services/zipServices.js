// services/zipServices.js
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import crypto from 'crypto';

/*
	Motor de compresión física con firma SHA-256 (Versión Determinista)
*/
// ... importaciones
export const generateZipPackage = async (fileMap, templateSid) => {
    const outputDir = path.join('uploads', 'output');
    await fs.ensureDir(outputDir);

    const zipPath = path.join(outputDir, `package_${templateSid}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Iniciamos el contenido del checksum
    let checksumEntries = `HASH SHA-256 | FILE NAME\n`;
    checksumEntries += `--------------------------------------------------------------------------------\n`;

    return new Promise((resolve, reject) => {
        output.on('close', () => {
            resolve({
                zipPath,
                fileCount: fileMap.length
                // Aquí podrías omitir el zipChecksum si ya no lo necesitas en la DB
            });
        });

        archive.on('error', (err) => reject(err));
        archive.pipe(output);

        fileMap.forEach(file => {
            if (fs.existsSync(file.sourcePath)) {
                // 1. Metemos el archivo al ZIP
                archive.file(file.sourcePath, { name: file.targetInternalPath });
                
                // 2. Registramos su firma en el manifiesto
                // Usamos el sha256 que ya viene en el objeto 'file' desde la DB
                checksumEntries += `${file.sha256} | ${file.targetInternalPath}\n`;
            }
        });

        // 3. Inyectamos el archivo de firmas al final
        archive.append(checksumEntries, { name: 'signature.checksum' });

        archive.finalize();
    });
};
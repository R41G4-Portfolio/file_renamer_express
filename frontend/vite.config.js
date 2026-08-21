import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
console.log('Buscando .env en:', envPath);
console.log('¿Existe?', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  console.log('Contenido del .env:\n', content);
  // Buscar línea VITE_API_URL
  const match = content.match(/^VITE_API_URL=(.*)$/m);
  console.log('Valor encontrado:', match ? match[1] : 'NO ENCONTRADO');
}

export default defineConfig({
	plugins: [react()],
	server: { port: 3000, host: true }
});
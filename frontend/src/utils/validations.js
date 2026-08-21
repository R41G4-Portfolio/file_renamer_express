import { z } from 'zod';

// Esquema de registro
export const registerSchema = z.object({
	name: z.string().min(1, 'El nombre es requerido'),
	email: z.string().email('Email inválido'),
	password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
	role: z.enum(['ADMIN', 'UPLOADER', 'DOWNLOADER']).optional()
});

// Esquema de login
export const loginSchema = z.object({
	email: z.string().email('Email inválido'),
	password: z.string().min(1, 'La contraseña es requerida')
});

// Esquema para subir archivo (asignación)
export const fileUploadSchema = z.object({
	file: z.instanceof(File, { message: 'Debes seleccionar un archivo' })
		.refine(f => f.size <= 10 * 1024 * 1024, 'El archivo no puede superar los 10MB')
		.refine(f => ['.pdf', '.jpg', '.png', '.docx'].includes(f.name.slice(-4)), 'Tipo de archivo no permitido')
});

// Esquema para subir plantilla Excel
export const templateUploadSchema = z.object({
	excel: z.instanceof(File, { message: 'Debes seleccionar un archivo Excel' })
		.refine(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'), 'Solo archivos Excel (.xlsx, .xls)')
});
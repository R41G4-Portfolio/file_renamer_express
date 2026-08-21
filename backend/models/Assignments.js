import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const assignmentSchema = new mongoose.Schema(
	{
		rid: { 
			type: String, 
			default: () => randomUUID(), 
			unique: true, 
			immutable: true 
		},
		sid: { 
			type: String, 
			default: () => randomUUID(), 
			unique: true, 
			immutable: true 
		},

		// SID del usuario con rol DOWNLOADER autorizado para procesar esta fila
		assignedTo: {
			type: String,
			required: true,
			immutable: false// Para evitar que se cambie el responsable a mitad del flujo(se pude por ahora)
		},
		// Relación mediante SID del Template
		templateSid: { 
			type: String, 
			ref: 'Templates', 
			required: true,
			immutable: true
		},

		templateStatus: { 
            type: String, 
            enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], 
            default: 'ACTIVE' 
        },

		// Puente con el arreglo renamingRules del Template
		rowIndex: { 
			type: Number, 
			required: true,
			immutable: true
		},

		status: { 
			type: String, 
			enum: ['PENDING', 'UPLOADED', 'FAILED', 'APPROVED', 'REJECTED'], 
			default: 'PENDING' 
		},

		// Datos del archivo físico subido por el Downloader
		originalName: { type: String, default: null },
		sha256: { type: String, default: null }, // Integridad ISO 27001
		filePath: { type: String, default: null }, // Oculto en Schema
		comments: { type: String, default: null },
		uploadedAt: { type: Date, default: null },

		schemaVersion: { type: Number, default: 1 }
	},
	{ 
		collection: 'Assignments', 
		timestamps: true 
	}
);

// Índice compuesto para unicidad por fila dentro de una solicitud
assignmentSchema.index({ templateSid: 1, rowIndex: 1 }, { unique: true });

// Defensa en Profundidad: Mapeo restrictivo
assignmentSchema.set('toJSON', {
	transform: (doc, ret) => {
		delete ret._id;
		delete ret.rid;
		delete ret.filePath; // No exponer rutas internas
		delete ret.__v;
		return ret;
	}
});

export default mongoose.model('Assignments', assignmentSchema);
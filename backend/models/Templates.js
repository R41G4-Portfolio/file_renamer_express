import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const templateSchema = new mongoose.Schema(
	{
		// RID: Identificador interno privado (Resource ID)
		rid: { 
			type: String, 
			default: () => randomUUID(), 
			unique: true, 
			immutable: true 
		},
		// SID: Identificador público operacional (Subject ID)
		sid: { 
			type: String, 
			default: () => randomUUID(), 
			unique: true, 
			immutable: true 
		},

		title: { type: String, required: true, trim: true },
		
		// Relación con el SID del Usuario
		uploadedBy: { 
			type: String, 
			required: true, 
			immutable: true 
		},

		assignedTo: { 
			type: String, 
			default: null,
			ref: 'Users'
		},

		//Motivo por el cual se cancela la tarea
		cancellationReason: { type: String, default: null },
		
		// Persistencia Física fuera del Root
		excelFileName: { type: String, required: true },
		excelFilePath: { type: String, required: true }, // Oculto en Schema

		// Mapa de Renombrado (Evita 500 registros individuales)
		renamingRules: [{
			rowIndex: { type: Number, required: true },
			folderPath: { type: String, required: true }, // Estructura interna del ZIP
			desiredName: { type: String, required: true } // Nombre final del archivo
		}],

		rowCount: { type: Number, required: true },
		status: { 
			type: String, 
			enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], 
			default: 'ACTIVE' 
		},
		schemaVersion: { type: Number, default: 1 }
	},
	{ 
		collection: 'Templates', 
		timestamps: true 
	}
);

// Defensa en Profundidad: Mapeo restrictivo
templateSchema.set('toJSON', {
	transform: (doc, ret) => {
		delete ret._id;
		delete ret.rid; // Aislamiento de RID
		delete ret.excelFilePath; // Ocultar ruta física del servidor
		delete ret.__v;
		return ret;
	}
});

export default mongoose.model('Templates', templateSchema);
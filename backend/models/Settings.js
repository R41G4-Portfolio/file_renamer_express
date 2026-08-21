import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const settingSchema = new mongoose.Schema(
	{
		// Identificador privado para trazabilidad interna
		rid: {
			type: String,
			default: () => randomUUID(),
			unique: true,
			immutable: true,
			index: true
		},
		// SID para si decides crear un panel de administración que consuma esto
		sid: {
			type: String,
			default: () => randomUUID(),
			unique: true,
			immutable: true,
			index: true
		},
		allowedExtensions: {
			type: [String],
			required: true,
			default: ['.pdf', '.jpg', '.png', '.docx']
		},
		forbiddenChars: {
			type: [String],
			required: true,
			default: ['<', '>', ':', '"', '|', '?', '*', '\\']
		},
		maxFileSizeMB: {
			type: Number,
			required: true,
			default: 10
		},
		maxExcelRows: {
			type: Number,
			required: true,
			default: 1000
		},
		normalizeRules: {
			replaceSpaces: { type: Boolean, default: true },
			replaceUnderscores: { type: Boolean, default: true },
			toLowerCase: { type: Boolean, default: true }
		},
		// Quién hizo el último cambio (usaremos el SID del usuario ADMIN)
		updatedBy: {
			type: String,
			default: 'SYSTEM',
			index: true
		},
		schemaVersion: {
			type: Number,
			required: true,
			default: 1
		}
	},
	{
		collection: 'Settings',
		timestamps: true,
		versionKey: false,
		toJSON: {
			transform: (doc, ret) => {
				return {
					sid: ret.sid,
					allowedExtensions: ret.allowedExtensions,
					forbiddenChars: ret.forbiddenChars,
					maxFileSizeMB: ret.maxFileSizeMB,
					maxExcelRows: ret.maxExcelRows,
					normalizeRules: ret.normalizeRules
				};
			}
		}
	}
);

export default mongoose.model('Settings', settingSchema);
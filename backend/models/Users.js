import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const userSchema = new mongoose.Schema(
	{
		rid: {
			type: String,
			default: () => randomUUID(),
			unique: true, // Se mantiene: ID de registro interno
			immutable: true
		},
		sid: {
			type: String,
			default: () => randomUUID(),
			unique: true, // Se mantiene: ID público
			immutable: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true
		},
		password: {
			type: String,
			required: true,
			select: false 
		},
		name: {
			type: String,
			required: true,
			trim: true
		},
		role: {
			type: String,
			required: true,
			enum: ['ADMIN', 'UPLOADER', 'DOWNLOADER'],
			default: 'DOWNLOADER'
		},
		token: {
			type: String,
			default: null, // Sin unique para evitar conflictos
			select: false
		},
		lastContext: {
			salt: {
				type: String,
				default: null, // Sin unique para evitar conflictos
				select: false
			},
			fingerprint: {
				type: String,
				select: false
			}
		},
		schemaVersion: { type: Number, default: 1, immutable: true },
		validFrom: { type: Date, default: Date.now, select: false },
		validUntil: { type: Date, default: null, select: false }
	},
	{
		collection: 'Users',
		timestamps: true,
		versionKey: false,
		toJSON: {
			transform: (doc, ret) => {
				return {
					sid: ret.sid,
					email: ret.email,
					name: ret.name,
					role: ret.role
				};
			}
		}
	}
);

export default mongoose.model('Users', userSchema);
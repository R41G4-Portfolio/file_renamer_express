import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const auditSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			default: () => randomUUID()
		},
		userId: {
			type: String,
			ref: 'Users',
			required: true
		},
		action: {
			type: String,
			required: true,
			enum: [
				'REGISTER',
				'REGISTER_FAILED',
				'LOGIN',
				'LOGIN_FAILED',
				'LOGOUT',
				'LOGOUT_FAILED',
				'BRUTE_FORCE_STRIKE',
				'UPLOAD_TEMPLATE',
				'UPDATE_TEMPLATE',
				'CANCEL_TEMPLATE',
				'ASSIGN_TEMPLATE',
				'UPLOAD_FILE',
				'APPROVE_FILE',
				'REJECT_FILE',
				'GENERATE_ZIP',
				'DOWNLOAD_ZIP',
				'VERIFY_CHECKSUM',
				'APPROVE_TEMPLATE'
			]
		},
		targetId: {
			type: String,
			default: null
		},
		ipAddress: {
			type: String,
			default: null
		},
		userAgent: {
			type: String,
			default: null
		},
		details: {
			type: mongoose.Schema.Types.Mixed,
			default: null
		},
		timestamp: {
			type: Date,
			default: Date.now
		},
		schemaVersion: {
			type: Number,
			required: true,
			default: 1
		},
		validFrom: {
			type: Date,
			default: Date.now,
			select: false
		},
		validUntil: {
			type: Date,
			default: null,
			select: false
		}
	},
	{
		collection: 'Audits'
	}
);

auditSchema.index({ userId: 1, timestamp: -1 });
auditSchema.index({ action: 1, timestamp: -1 });
auditSchema.index({ timestamp: -1 });

auditSchema.set('toJSON', {
	transform: (doc, ret) => {
		ret.id = ret._id;
		delete ret._id;
		return ret;
	}
});

export default mongoose.model('Audits', auditSchema);
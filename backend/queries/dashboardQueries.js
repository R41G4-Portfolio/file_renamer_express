import Template from '../models/Templates.js';
import Assignment from '../models/Assignments.js';
import Users from '../models/Users.js';

export const fetchTemplatesByOwner = async (userSid, userRole, page = 1, limit = 10) => {
	const skip = (page - 1) * limit;
	
	const filter = userRole === 'ADMIN' ? {} : { uploadedBy: userSid };
	
	const [total, templates] = await Promise.all([
		Template.countDocuments(filter),
		Template.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean()
	]);
	
	const templateIds = templates.map(t => t.sid);
	
	// Obtener conteos de assignments por template
	const assignmentsAgg = await Assignment.aggregate([
		{ $match: { templateSid: { $in: templateIds } } },
		{ $group: {
			_id: '$templateSid',
			pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
			uploaded: { $sum: { $cond: [{ $eq: ['$status', 'UPLOADED'] }, 1, 0] } },
			approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
			total: { $sum: 1 }
		} }
	]);
	
	const countsMap = new Map();
	assignmentsAgg.forEach(a => {
		countsMap.set(a._id, {
			pending: a.pending,
			uploaded: a.uploaded,
			approved: a.approved,
			total: a.total
		});
	});
	
	// Obtener nombres de usuarios asignados (desde assignments, no desde template)
	const allAssignments = await Assignment.find({ templateSid: { $in: templateIds } })
		.select('templateSid assignedTo')
		.lean();
	
	const assignedUserIds = [...new Set(allAssignments.map(a => a.assignedTo).filter(Boolean))];
	const users = await Users.find({ sid: { $in: assignedUserIds } })
		.select('sid name')
		.lean();
	
	const userMap = new Map();
	users.forEach(u => userMap.set(u.sid, u.name));
	
	// Mapear assignedTo por template (tomar el primer assignment)
	const templateAssignedMap = new Map();
	allAssignments.forEach(a => {
		if (!templateAssignedMap.has(a.templateSid) && a.assignedTo) {
			templateAssignedMap.set(a.templateSid, {
				name: userMap.get(a.assignedTo) || 'Desconocido'
			});
		}
	});
	
	const data = templates.map(template => ({
		...template,
		assignedTo: templateAssignedMap.get(template.sid) || null,
		assignmentCounts: countsMap.get(template.sid) || { pending: 0, uploaded: 0, approved: 0, total: 0 }
	}));
	
	return { total, page, limit, data };
};
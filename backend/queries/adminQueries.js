import Template from '../models/Templates.js';
import Assignment from '../models/Assignments.js';
import Users from '../models/Users.js';

export const fetchTemplatesWithAssignmentCounts = async (page = 1, limit = 10) => {
	const skip = (page - 1) * limit;
	
	// Obtener total de templates
	const total = await Template.countDocuments();
	
	// Obtener templates paginados
	const templates = await Template.find({})
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean();
	
	const templateIds = templates.map(t => t.sid);
	
	// Obtener conteos Y el assignedTo desde assignments
	const assignmentsAgg = await Assignment.aggregate([
		{ $match: { templateSid: { $in: templateIds } } },
		{ $group: {
			_id: '$templateSid',
			pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
			uploaded: { $sum: { $cond: [{ $eq: ['$status', 'UPLOADED'] }, 1, 0] } },
			approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
			total: { $sum: 1 },
			assignedTo: { $first: '$assignedTo' }
		} }
	]);
	
	// Obtener nombres de usuarios asignados
	const assignedUserIds = assignmentsAgg.map(a => a.assignedTo).filter(Boolean);
	const users = await Users.find({ sid: { $in: assignedUserIds } })
		.select('sid name')
		.lean();
	
	const userMap = new Map();
	users.forEach(u => userMap.set(u.sid, u.name));
	
	// Mapear resultados
	const countsMap = new Map();
	assignmentsAgg.forEach(a => {
		countsMap.set(a._id, {
			pending: a.pending,
			uploaded: a.uploaded,
			approved: a.approved,
			total: a.total,
			assignedTo: a.assignedTo,
			assignedToName: userMap.get(a.assignedTo) || null
		});
	});
	
	const data = templates.map(template => {
		const counts = countsMap.get(template.sid) || { pending: 0, uploaded: 0, approved: 0, total: 0, assignedToName: null };
		return {
			...template,
			assignedTo: counts.assignedToName ? { name: counts.assignedToName } : null,
			assignmentCounts: {
				pending: counts.pending,
				uploaded: counts.uploaded,
				approved: counts.approved,
				total: counts.total
			}
		};
	});
	
	return { total, page, limit, data };
};
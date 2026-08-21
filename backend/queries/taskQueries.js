import Assignment from '../models/Assignments.js';
import Template from '../models/Templates.js';

export const fetchMyTemplatesWithAssignments = async (userSid) => {
	// Obtener assignments del usuario
	const assignments = await Assignment.find({ assignedTo: userSid })
		.sort({ createdAt: -1 })
		.lean();
	
	const templateSids = [...new Set(assignments.map(a => a.templateSid))];
	
	// Obtener templates con sus renamingRules
	const templates = await Template.find({ sid: { $in: templateSids } })
		.sort({ createdAt: -1 })
		.lean();
	
	// Crear mapa de renamingRules por template y rowIndex
	const templateRulesMap = new Map();
	templates.forEach(template => {
		const rulesMap = new Map();
		template.renamingRules?.forEach(rule => {
			rulesMap.set(rule.rowIndex, {
				folderPath: rule.folderPath,
				desiredName: rule.desiredName
			});
		});
		templateRulesMap.set(template.sid, rulesMap);
	});
	
	// Agrupar assignments por template y agregar folderPath/desiredName
	const templateMap = new Map();
	templates.forEach(template => {
		templateMap.set(template.sid, {
			id: template.sid,
			title: template.title,
			status: template.status,
			uploadedAt: template.createdAt,
			assignments: []
		});
	});
	
	assignments.forEach(assignment => {
		const template = templateMap.get(assignment.templateSid);
		const rulesMap = templateRulesMap.get(assignment.templateSid);
		const rule = rulesMap?.get(assignment.rowIndex) || {};
		
		if (template) {
			template.assignments.push({
				id: assignment.sid,
				rowIndex: assignment.rowIndex,
				status: assignment.status,
				originalName: assignment.originalName,
				comments: assignment.comments,
				uploadedAt: assignment.uploadedAt,
				filePath: assignment.filePath,
				folderPath: rule.folderPath || '',
				desiredName: rule.desiredName || ''
			});
		}
	});
	
	return Array.from(templateMap.values());
};

export const fetchAssignmentsByUser = async (userSid, userRole, page = 1, limit = 10) => {
	const skip = (page - 1) * limit;
	
	// Si es ADMIN, no filtrar por assignedTo (trae todas)
	const filter = userRole === 'ADMIN' ? {} : { assignedTo: userSid };
	
	const [total, assignments] = await Promise.all([
		Assignment.countDocuments(filter),
		Assignment.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean()
	]);
	
	// Obtener información del template para cada assignment
	const templateSids = [...new Set(assignments.map(a => a.templateSid))];
	const templates = await Template.find({ sid: { $in: templateSids } })
		.select('sid title status renamingRules')
		.lean();
	
	const templateMap = new Map();
	templates.forEach(t => templateMap.set(t.sid, t));
	
	// Enriquecer assignments con datos del template
	const data = assignments.map(assignment => {
		const template = templateMap.get(assignment.templateSid);
		const rule = template?.renamingRules?.find(r => r.rowIndex === assignment.rowIndex);
		
		return {
			...assignment,
			templateTitle: template?.title || 'Sin título',
			templateStatus: template?.status || 'UNKNOWN',
			folderPath: rule?.folderPath || '',
			desiredName: rule?.desiredName || ''
		};
	});
	
	return { total, page, limit, data };
};
import Template from '../models/Templates.js';
import Assignment from '../models/Assignments.js';
import Users from '../models/Users.js';
/*
	QUERIES: Capa de acceso a datos pura. 
	Implementa el patrón de aislamiento por SID y optimización con .lean().
	Se incorporan parámetros de paginación para escalabilidad.
*/

// CONSULTAS DE LECTURA (READS) 

/*
	Obtiene el listado de solicitudes con paginación.
	Filtra por dueño (si no es admin) y excluye campos pesados.
*/
export const fetchTemplatesByOwner = async (ownerSid = null, page = 1, limit = 10) => {
	const filter = ownerSid ? { uploadedBy: ownerSid } : {};
	const skip = (page - 1) * limit;

	const [total, data] = await Promise.all([
		Template.countDocuments(filter),
		Template.find(filter)
			.select('-renamingRules -rid -excelRelativePath') // Excluye metadata pesada
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean()
	]);

	return { total, page, limit, data };
};

/*
	Obtiene el detalle completo de un template por su SID.
*/
export const fetchTemplateBySid = async (sid) => {
	return await Template.findOne({ sid }).lean();
};

/*
	Obtiene un template y sus assignments con paginación.
	Útil para visualizar las tareas de una solicitud extensa sin saturar memoria.
*/
export const fetchTemplateWithAssignments = async (templateSid, page = 1, limit = 50) => {
	const template = await Template.findOne({ sid: templateSid })
		.lean();
	
	if (!template) return null;

	// Obtener el nombre del usuario asignado
	let assignedToWithName = null;
	if (template.assignedTo) {
		const user = await Users.findOne({ sid: template.assignedTo })
			.select('name')
			.lean();
		assignedToWithName = user ? { name: user.name } : null;
	}

	const skip = (page - 1) * limit;

	const [totalAssignments, assignments] = await Promise.all([
		Assignment.countDocuments({ templateSid }),
		Assignment.find({ templateSid })
			.sort({ rowIndex: 1 })
			.skip(skip)
			.limit(limit)
			.lean()
	]);

	const rulesMap = new Map();
	if (template.renamingRules && Array.isArray(template.renamingRules)) {
		template.renamingRules.forEach(rule => {
			rulesMap.set(rule.rowIndex, {
				ruta: rule.folderPath,
				nombreDeseado: rule.desiredName
			});
		});
	}

	const enrichedAssignments = assignments.map(assignment => {
		const rule = rulesMap.get(assignment.rowIndex) || { ruta: '', nombreDeseado: '' };
		return {
			sid: assignment.sid,
			rowIndex: assignment.rowIndex,  // <-- debe estar
			ruta: rule.ruta,
			nombreDeseado: rule.nombreDeseado,
			status: assignment.status,
			filePath: assignment.filePath,
			originalName: assignment.originalName,
			uploadedAt: assignment.uploadedAt
		};
	});

	return {
		sid: template.sid,
		title: template.title,
		status: template.status,
		uploadedBy: template.uploadedBy,
		assignedTo: assignedToWithName,  // <-- Ahora con nombre
		excelFileName: template.excelFileName,
		rowCount: template.rowCount,
		createdAt: template.createdAt,
		assignments: enrichedAssignments,
		pagination: { total: totalAssignments, page, limit }
	};
};

// OPERACIONES DE ESCRITURA (WRITES) 

/*
	Persiste un nuevo Template. 
	El objeto 'data' ya viene estructurado desde el DAO.
*/
export const saveTemplate = async (data) => {
	return await Template.create(data);
};

/*
	Crea los registros de tareas (Assignments) vinculados al SID del Template.
*/
export const saveBulkAssignments = async (assignmentsArray) => {
    return await Assignment.insertMany(assignmentsArray);
};

/*
	Actualización atómica de estado por SID.
*/
export const updateTemplateStatus = async (sid, status) => {
	return await Template.updateOne({ sid }, { status });
};

/*
	Vincula un usuario (downloader) a una solicitud específica mediante SIDs.
*/
export const assignUserToTemplate = async (templateSid, userSid) => {
	return await Template.updateOne(
		{ sid: templateSid }, 
		{ assignedTo: userSid }
	);
};

/*
	Actualiza el usuario asignado (Downloader) de una solicitud específica.
	Permite la reasignación mediante el uso de SIDs públicos.
*/
export const reassignTemplateUser = async (templateSid, newUserSid) => {
	return await Template.updateOne(
		{ sid: templateSid }, 
		{ 
			$set: { 
				assignedTo: newUserSid,
				updatedAt: new Date() 
			} 
		}
	);
};

/*
	Realiza la cancelación lógica de una solicitud.
	Registra el motivo de la cancelación para fines de auditoría y cumplimiento.
*/
export const cancelTemplateWithReason = async (templateSid, reason) => {
	return await Template.updateOne(
		{ sid: templateSid }, 
		{ 
			$set: { 
				status: 'CANCELLED',
				cancellationReason: reason,
				cancelledAt: new Date()
			} 
		}
	);
};
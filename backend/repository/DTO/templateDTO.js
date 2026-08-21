/*
	DTO: Filtra la salida hacia el cliente.
	Aísla la infraestructura (paths, rids) de la vista pública.
*/

export const templateDetailDTO = (template) => {
	if (!template) return null;
	
	return {
		sid: template.sid,
		title: template.title,
		status: template.status,
		uploadedBy: template.uploadedBy,
		assignedTo: template.assignedTo ? { name: template.assignedTo } : null,
		excelFileName: template.excelFileName,
		rowCount: template.rowCount,
		createdAt: template.createdAt,
		assignments: template.assignments.map(a => ({
			sid: a.sid,
			rowIndex: a.rowIndex,
			ruta: a.ruta,
			nombreDeseado: a.nombreDeseado,
			status: a.status,
			filePath: a.filePath,
			originalName: a.originalName
		}))
	};
};

export const templateListDTO = (templates) => {
	return templates.map(template => ({
		sid: template.sid,
		title: template.title,
		status: template.status,
		assignedTo: template.assignedTo ? { name: template.assignedTo } : null,
		rowCount: template.rowCount,
		createdAt: template.createdAt
	}));
};

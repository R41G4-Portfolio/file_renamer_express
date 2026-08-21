import Audits from '../models/Audits.js';

/*
	QUERIES: Capa de acceso a datos pura.
	Persiste los logs de auditoría asegurando el retorno de POJOs planos (.lean()).
	Se rige bajo la política de exclusión de RIDs públicos.
*/

export const logEvent = async (auditData) => {
	const newAudit = await Audits.create(auditData);
	// Buscamos con lean para asegurar un objeto plano y blindar la capa de negocio
	return await Audits.findById(newAudit._id).lean();
};

// Agregar al final del archivo existente:
export const fetchAuditLogs = async (filters = {}, page = 1, limit = 50) => {
	const skip = (page - 1) * limit;

	const filter = {};
	if (filters.userId) filter.userId = filters.userId;
	if (filters.action) filter.action = filters.action;
	if (filters.startDate) filter.timestamp = { $gte: new Date(filters.startDate) };
	if (filters.endDate) filter.timestamp = { ...filter.timestamp, $lte: new Date(filters.endDate) };

	const [total, data] = await Promise.all([
	Audits.countDocuments(filter),
	Audits.find(filter)
		.sort({ timestamp: -1 })
		.skip(skip)
		.limit(limit)
		.lean()
	]);

	return { total, page, limit, data };
};

export const fetchAuditLogsWithUsers = async (page = 1, limit = 50) => {
	const skip = (page - 1) * limit;
	
	const [total, data] = await Promise.all([
		Audits.countDocuments(),
		Audits.aggregate([
			{ $sort: { timestamp: -1 } },
			{ $skip: skip },
			{ $limit: limit },
			{
				$lookup: {
					from: 'Users',
					localField: 'userId',
					foreignField: 'sid',
					as: 'userInfo'
				}
			},
			{
				$addFields: {
					userName: { $arrayElemAt: ['$userInfo.name', 0] }
				}
			},
			{
				$project: {
					_id: 0,
					id: '$_id',
					userId: 1,
					userName: 1,
					action: 1,
					targetId: 1,
					ipAddress: 1,
					userAgent: 1,
					details: 1,
					timestamp: 1
				}
			}
		]).exec()
	]);
	
	return { total, page, limit, data };
};
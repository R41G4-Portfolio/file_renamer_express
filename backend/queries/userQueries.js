import { Users } from '../models/index.js';

//Búsqueda pública por SID

export const findUserBySid = async (sid) => {
	return await Users.findOne({ sid })
		.select('name email role createdAt')
		.lean()
		.exec();
};

//Filtrar usuarios por rol (Uso administrativo)

export const findUsersByRole = async (role) => {
	return await Users.find({ role })
		.select('sid name email')
		.lean()
		.exec();
};
import bcrypt from 'bcryptjs';
import { Users } from '../models/index.js';

/*
	Consulta para saber si el usuario existe en BD
	Recibe como parámetro el correo electrónico (email)
*/
export const checkUserExistsByEmail = async (email) => {
	const result = await Users.exists({ email });
	return !!result;
};

/*
	Búsqueda de seguridad (Consulta 1 de las 3 permitidas por RID)
	Utilizada internamente para lógica de control y generación de tokens
*/
export const findUserByRid = async (rid) => {
	return await Users.findOne({ rid })
		.select('sid email role')
		.lean()
		.exec();
};

/*
	Función para buscar usuarios por email en el login
	Recibe email y devuelve los datos del User
*/
export const findUserByEmailWithAuth = async (email) => {
	return await Users.findOne({ email })
		.select('+password +token +rid +lastContext.salt')
		.exec();
};

/*
	Actualiza el estado de la sesión (Sesión única) y el contexto del dispositivo.
	Recibe sid, token, añade los datos del ambiente(User agent y salt)
*/
export const updateSessionData = async (sid, token, salt, fingerprint) => {
	return await Users.findOneAndUpdate(
		{ sid },
		{ 
			$set: {
				token, 
				'lastContext.salt': salt,
				'lastContext.fingerprint': fingerprint
			}
		},
		{ 
			returnDocument: 'after',
			runValidators: true 
		}
	).exec();
};

/*
	Borra los datos de sesión del modelo Users
*/

export const clearSessionData = async (sid) => {
	return await Users.findOneAndUpdate(
		{ sid },
		{ 
			$set: {
				token: null, 
				'lastContext.salt': null,
				'lastContext.fingerprint': null
			}
		}
	).exec();
};

/*
	Crear usuario, recibe datos validados del nuevo usuario
	Cifra la contraseña y asigna rol DOWNLOADER por defecto
*/
export const createUser = async (userData) => {
	const { email, password, name } = userData;
	const hashedPassword = await bcrypt.hash(password, 10);
	
	const newUser = await Users.create({
		email,
		password: hashedPassword,
		name,
		role: 'DOWNLOADER'
	});

	return newUser.toObject(); 
};

export const invalidateAllUserSessions = async (sid) => {
	return await Users.updateOne(
		{ sid },
		{ $set: { token: null } }
	);
};
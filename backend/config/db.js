import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
	try {
		await mongoose.connect(config.mongoUri);
		console.log(`Conexión de Monngo DB detectada`);
	} catch (error) {
		console.error('No encontro la conexión a Mongo Db, error:', error.message);
		process.exit(1);
	}
};

export default connectDB;
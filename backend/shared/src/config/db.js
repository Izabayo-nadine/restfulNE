import mongoose from 'mongoose';

export async function connectDB(serviceName, logger) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fems';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  logger.info('MongoDB connected', { database: mongoose.connection.name, service: serviceName });
}

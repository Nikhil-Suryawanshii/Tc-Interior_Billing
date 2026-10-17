import mongoose from 'mongoose';

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Set MONGODB_URI in backend/.env to your MongoDB Atlas connection string.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DATABASE || 'the_concept_interior',
    serverSelectionTimeoutMS: 10000,
  });
}

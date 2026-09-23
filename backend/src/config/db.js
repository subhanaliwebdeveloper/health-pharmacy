import mongoose from 'mongoose';
import { env } from './env.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/** Connect to MongoDB with cached connection reuse across serverless invocations. */
export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(env.mongoUri, opts).then((mongooseInstance) => {
      console.log('MongoDB connected');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }

  return cached.conn;
}

import mongoose from 'mongoose';
import { env } from './env.js';

/** Connect to MongoDB. Exits the process if connection fails. */
export async function connectDB() {
  try {
    // Windows c-ares DNS resolver frequently fails on SRV lookups (ECONNREFUSED).
    // Use standard public DNS resolvers (Google / Cloudflare) to ensure fast and reliable SRV resolution.
    
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

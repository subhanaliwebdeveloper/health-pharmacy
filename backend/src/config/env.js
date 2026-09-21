import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  jwt: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI,
  frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
  admin: process.env.ADMIN_URL || 'http://localhost:5174',
};

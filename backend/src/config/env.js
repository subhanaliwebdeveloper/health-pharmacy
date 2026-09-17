import dotenv from 'dotenv'; dotenv.config();
export const env={port:Number(process.env.PORT||5000),jwt:process.env.JWT_SECRET||'dev-secret',frontend:process.env.FRONTEND_URL||'http://localhost:5173',admin:process.env.ADMIN_URL||'http://localhost:5174'};

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

/* =========================
   SECURITY HEADERS
========================= */

app.use(
  helmet({
    // Content Security Policy (CSP) is explicitly disabled because this service operates strictly
    // as a REST JSON API and does not serve HTML, scripts, or styles to browsers.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  env.frontend,
  env.admin,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check static allowed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Dynamically allow Vercel preview deployment URLs matching project patterns
      if (
        origin.endsWith('.vercel.app') &&
        (origin.includes('subhanaliwebdeveloper') || origin.includes('health-pharmacy'))
      ) {
        return callback(null, true);
      }

      // Reject unauthorized origins cleanly (returns CORS headers rejection without throwing 500 error stack trace)
      console.warn('CORS blocked origin:', origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

/* =========================
   BODY PARSING & COOKIES
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================
   HEALTH CHECK
========================= */

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'Health Pharmacy API' });
});

/* =========================
   API ROUTES
========================= */

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

/* =========================
   ERROR HANDLING
========================= */

app.use(notFound);
app.use(errorHandler);

/* =========================
   START SERVER
========================= */

if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(env.port, () => {
      console.log(`API running on http://localhost:${env.port}`);
      console.log('Allowed CORS origins:', allowedOrigins);
    });
  });
}

/* Vercel serverless export */
export default app;
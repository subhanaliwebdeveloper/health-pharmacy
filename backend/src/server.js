import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { testDB } from './config/db.js';

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5175',
  env.frontend,
  env.admin
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // e.g. Postman, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

/* =========================
   BODY PARSING
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC UPLOADS
========================= */

app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '../uploads'))
);

/* =========================
   HEALTH CHECK
========================= */

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'Health Pharmacy API'
  });
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

testDB()
  .then(() => {
    app.listen(env.port, () => {
      console.log(
        `API running on http://localhost:${env.port}`
      );

      console.log(
        'Allowed CORS origins:',
        allowedOrigins
      );
    });
  })
  .catch((e) => {
    console.error(
      'Database connection failed:',
      e.message
    );

    process.exit(1);
  });
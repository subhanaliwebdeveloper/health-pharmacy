import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const r = Router();

r.post('/register', authLimiter, register);
r.post('/login', authLimiter, login);
r.post('/logout', logout);
r.get('/me', protect, me);

export default r;

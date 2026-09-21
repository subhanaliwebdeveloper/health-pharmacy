import { Router } from 'express';
import * as c from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { couponLimiter } from '../middleware/rateLimitMiddleware.js';

const r = Router();

r.get('/', protect, adminOnly, c.list);
r.post('/validate', protect, couponLimiter, c.validate);
r.post('/', protect, adminOnly, c.create);
r.put('/:id', protect, adminOnly, c.update);
r.delete('/:id', protect, adminOnly, c.remove);

export default r;

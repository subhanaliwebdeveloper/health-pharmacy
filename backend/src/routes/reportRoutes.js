import { Router } from 'express';
import { summary } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
const r = Router();
r.get('/summary', protect, adminOnly, summary);
export default r;

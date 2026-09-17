import { Router } from 'express';
import { get, update } from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
const r = Router();
r.get('/', get);
r.put('/', protect, adminOnly, update);
export default r;

import { Router } from 'express';
import * as c from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/adminMiddleware.js';

const r = Router();

r.post('/', protect, c.create);
r.get('/mine', protect, c.mine);
r.get('/', protect, allowRoles('admin', 'super_admin', 'pharmacist_reviewer'), c.all);
r.get('/:id', protect, c.details);
r.patch('/:id/status', protect, allowRoles('admin', 'super_admin', 'pharmacist_reviewer'), c.updateStatus);

export default r;

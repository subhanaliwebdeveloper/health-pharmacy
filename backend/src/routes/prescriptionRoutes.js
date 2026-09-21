import { Router } from 'express';
import * as c from '../controllers/prescriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/adminMiddleware.js';
import { upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js';

const r = Router();

r.post('/', protect, upload.single('prescription'), uploadToCloudinary('pharmacy/prescriptions'), c.create);
r.get('/mine', protect, c.mine);
r.get('/', protect, allowRoles('admin', 'super_admin', 'pharmacist_reviewer'), c.all);
r.get('/:id/image', protect, c.getImage);
r.patch('/:id', protect, allowRoles('admin', 'super_admin', 'pharmacist_reviewer'), c.update);

export default r;

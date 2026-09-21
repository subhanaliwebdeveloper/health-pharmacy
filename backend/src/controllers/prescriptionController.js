import Prescription from '../models/Prescription.js';
import asyncHandler from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  if (!req.cloudinary) {
    return res.status(400).json({ message: 'Prescription image is required' });
  }

  const prescription = await Prescription.create({
    user: req.user.id,
    image_url: req.cloudinary.secure_url,
    image_public_id: req.cloudinary.public_id,
    note: req.body.note || '',
    status: 'pending',
  });

  res.status(201).json({
    id: prescription._id,
    status: prescription.status,
    image_url: prescription.image_url,
  });
});

export const mine = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(prescriptions);
});

export const all = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(prescriptions);
});

/**
 * Returns a single prescription's image URL — only to the owning user or an admin.
 * The image_url (Cloudinary secure_url) is unguessable but we still gate access
 * via an authenticated route to prevent enumeration.
 */
export const getImage = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

  const isOwner = String(prescription.user) === String(req.user.id);
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({ image_url: prescription.image_url });
});

export const update = asyncHandler(async (req, res) => {
  const allowed = ['pending', 'approved', 'rejected'];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  await Prescription.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
    admin_note: req.body.admin_note || '',
  });
  res.json({ message: 'Prescription updated' });
});

import User from '../models/User.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';

export const all = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

export const one = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'Customer not found' });
  res.json(user);
});

export const ordersFor = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.params.id })
    .select('order_number total status payment_method createdAt')
    .sort({ createdAt: -1 });
  res.json(orders);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, city } = req.body;
  await User.findByIdAndUpdate(req.user.id, { name, phone, address, city });
  res.json({ message: 'Profile updated' });
});

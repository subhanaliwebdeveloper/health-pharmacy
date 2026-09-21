import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

export const create = asyncHandler(async (req, res) => {
  const { code, type, value, expires_at } = req.body;
  if (!code || !value) return res.status(400).json({ message: 'Coupon code and value are required' });
  const coupon = await Coupon.create({
    code,
    type: type || 'percent',
    value,
    expires_at: expires_at || null,
    active: true,
  });
  res.status(201).json({ id: coupon._id });
});

export const update = asyncHandler(async (req, res) => {
  const { code, type, value, expires_at, active } = req.body;
  await Coupon.findByIdAndUpdate(req.params.id, {
    code: code?.toUpperCase(),
    type,
    value,
    expires_at: expires_at || null,
    active: Boolean(active),
  });
  res.json({ message: 'Coupon updated' });
});

export const remove = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Coupon deleted' });
});

/** Lets a logged-in customer validate a coupon at checkout before placing the order. */
export const validate = asyncHandler(async (req, res) => {
  const { code, subtotal = 0 } = req.body;
  if (!code) return res.status(400).json({ message: 'Coupon code is required' });

  const coupon = await Coupon.findOne({
    code: String(code).toUpperCase(),
    active: true,
    $or: [{ expires_at: null }, { expires_at: { $gte: new Date() } }],
  });
  if (!coupon) return res.status(404).json({ message: 'This coupon is invalid or has expired' });

  const discount =
    coupon.type === 'percent'
      ? (Number(subtotal) * Number(coupon.value)) / 100
      : Number(coupon.value);

  res.json({
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    discount: Math.min(discount, Number(subtotal)),
  });
});

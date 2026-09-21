import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'name')
    .populate('product', 'name')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

export const create = asyncHandler(async (req, res) => {
  const { product_id, rating, comment } = req.body;
  await Review.create({
    user: req.user.id,
    product: product_id,
    rating,
    comment: comment || '',
    approved: false,
  });
  res.status(201).json({ message: 'Review submitted for approval' });
});

export const moderate = asyncHandler(async (req, res) => {
  await Review.findByIdAndUpdate(req.params.id, { approved: Boolean(req.body.approved) });
  res.json({ message: 'Review updated' });
});

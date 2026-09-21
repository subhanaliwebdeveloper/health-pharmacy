import Category from '../models/Category.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });

  // Attach active product count to each category
  const counts = await Product.aggregate([
    { $match: { active: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  const result = categories.map((cat) => ({
    ...cat.toObject(),
    product_count: countMap[String(cat._id)] || 0,
  }));
  res.json(result);
});

export const create = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name required' });
  const category = await Category.create({ name, description });
  res.status(201).json({ id: category._id });
});

export const update = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name required' });
  await Category.findByIdAndUpdate(req.params.id, { name, description });
  res.json({ message: 'Category updated' });
});

export const remove = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
});

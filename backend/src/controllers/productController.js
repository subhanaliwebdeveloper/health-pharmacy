import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  let { search = '', category = '', sort = 'newest', limit = 50, page = 1 } = req.query;
  limit = Math.min(Number(limit) || 50, 100);
  page = Math.max(Number(page) || 1, 1);

  const filter = { active: true };

  if (search) {
    const re = new RegExp(search, 'i');
    filter.$or = [{ name: re }, { brand: re }, { description: re }];
  }

  if (category) {
    // Accept category by ObjectId or by name
    if (/^[a-f\d]{24}$/i.test(String(category))) {
      filter.category = category;
    } else {
      // Resolve category name → id via populate; simpler to match after populate
      // We do a separate lookup to keep this query lean
      const { default: Category } = await import('../models/Category.js');
      const cat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
      filter.category = cat ? cat._id : null;
    }
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    popularity: { sales_count: -1 },
    newest: { createdAt: -1 },
  };
  const sortQuery = sortMap[sort] || { createdAt: -1 };

  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort(sortQuery)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json(products);
});

export const getOne = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

export const adminList = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('category', 'name').sort({ createdAt: -1 });
  res.json(products);
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body;
  const image = req.cloudinary?.secure_url || b.image || '';
  const image_public_id = req.cloudinary?.public_id || '';

  let batches = [];
  if (b.batches) {
    try {
      batches = typeof b.batches === 'string' ? JSON.parse(b.batches) : b.batches;
    } catch {
      batches = [];
    }
  }

  const product = new Product({
    name: b.name,
    description: b.description || '',
    price: b.price,
    discount_price: b.discount_price || null,
    category: b.category_id || null,
    brand: b.brand || '',
    image,
    image_public_id,
    stock: Number(b.stock) || 0,
    sku: b.sku || '',
    requires_prescription: Boolean(Number(b.requires_prescription)),
    active: b.active === undefined ? true : Boolean(Number(b.active)),
    batches,
  });

  await product.save();
  res.status(201).json({ id: product._id, _id: product._id, message: 'Product created', product });
});

export const update = asyncHandler(async (req, res) => {
  const b = req.body;
  const updateData = {
    name: b.name,
    description: b.description || '',
    price: b.price,
    discount_price: b.discount_price || null,
    category: b.category_id || null,
    brand: b.brand || '',
    stock: Number(b.stock) || 0,
    sku: b.sku || '',
    requires_prescription: Boolean(Number(b.requires_prescription)),
    active: b.active === undefined ? true : Boolean(Number(b.active)),
  };

  if (b.batches !== undefined) {
    let batches = [];
    try {
      batches = typeof b.batches === 'string' ? JSON.parse(b.batches) : b.batches;
    } catch {
      batches = [];
    }
    updateData.batches = batches;
    if (batches.length > 0) {
      updateData.stock = batches.reduce((sum, item) => sum + (Number(item.stock_qty || item.stock) || 0), 0);
    }
  }

  // Only overwrite image if a new file was uploaded
  if (req.cloudinary) {
    updateData.image = req.cloudinary.secure_url;
    updateData.image_public_id = req.cloudinary.public_id;
  } else if (b.image) {
    updateData.image = b.image;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json({ message: 'Product updated', product });
});

export const getBatches = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product.batches || []);
});

export const addBatch = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.batches.push(req.body);
  await product.save();
  res.status(201).json(product.batches);
});

export const remove = asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

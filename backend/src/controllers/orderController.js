import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Prescription from '../models/Prescription.js';
import { generateOrderId } from '../utils/generateOrderId.js';
import { ORDER_STATUSES } from '../utils/orderStatus.js';
import asyncHandler from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'COD', couponCode = '', deliveryFee: reqDeliveryFee } = req.body;
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    const finalItems = [];

    for (const item of items) {
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error(`Invalid item quantity for ${item.name || 'product'}`);
      }

      const product = await Product.findOne({ _id: item.product_id, active: true }).session(session);
      if (!product || product.stock < qty) {
        throw new Error(`Insufficient stock for ${item.name || 'product'}`);
      }
      const price = Number(product.discount_price ?? product.price);
      subtotal += price * qty;
      finalItems.push({ product, qty, price });
    }

    // Prescription validation: block order if any item requires prescription and user lacks approved Rx
    const hasRxProduct = finalItems.some(({ product }) => product.requires_prescription);
    if (hasRxProduct) {
      const approvedRx = await Prescription.findOne({
        user: req.user.id,
        status: 'approved',
      }).session(session);
      if (!approvedRx) {
        throw new Error('This order contains prescription-required products. An approved prescription is required before placing the order.');
      }
    }

    const deliveryFee = 0;
    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        active: true,
        $or: [{ expires_at: null }, { expires_at: { $gte: new Date() } }],
      }).session(session);
      if (!coupon) throw new Error('Coupon is invalid or expired');
      discount =
        coupon.type === 'percent'
          ? (subtotal * Number(coupon.value)) / 100
          : Number(coupon.value);
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const orderNumber = generateOrderId();

    const [order] = await Order.create(
      [
        {
          order_number: orderNumber,
          user: req.user.id,
          items: finalItems.map(({ product, qty, price }) => ({
            product: product._id,
            name: product.name,
            image: product.image,
            quantity: qty,
            unit_price: price,
          })),
          subtotal,
          delivery_fee: deliveryFee,
          discount,
          total,
          payment_method: paymentMethod,
          payment_status: 'pending',
          status: 'placed',
          shipping_address: shippingAddress || {},
          coupon_code: couponCode.toUpperCase(),
        },
      ],
      { session }
    );

    // Atomically deduct stock and increment sales_count for each product
    for (const { product, qty } of finalItems) {
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -qty, sales_count: qty } },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(201).json({
      id: order._id,
      order_number: orderNumber,
      subtotal,
      delivery_fee: deliveryFee,
      discount,
      total,
      status: 'placed',
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

export const mine = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const all = asyncHandler(async (req, res) => {
  const { search = '', status = '' } = req.query;

  // Build aggregation to join user info and optionally filter
  const pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
  ];

  const matchStage = {};
  if (status) matchStage.status = status;
  if (search) {
    const re = new RegExp(search, 'i');
    matchStage.$or = [{ order_number: re }, { 'userInfo.name': re }, { 'userInfo.email': re }];
  }
  if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage });

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $addFields: {
        customer_name: '$userInfo.name',
        email: '$userInfo.email',
      },
    },
    { $unset: 'userInfo' }
  );

  const orders = await Order.aggregate(pipeline);
  res.json(orders);
});

export const details = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone address city')
    .populate('items.product', 'name image');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const userId = String(order.user._id ?? order.user);
  if (req.user.role !== 'admin' && userId !== String(req.user.id)) {
    return res.status(403).json({ message: 'You are not allowed to view this order' });
  }

  res.json(order);
});

export const updateStatus = asyncHandler(async (req, res) => {
  if (!ORDER_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Order status updated', status: order.status });
});

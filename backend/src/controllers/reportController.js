import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Aggregated, real-data snapshot for the admin Reports page. */
export const summary = asyncHandler(async (req, res) => {
  const [orderStats] = await Order.aggregate([
    {
      $group: {
        _id: null,
        total_orders: { $sum: 1 },
        total_revenue: {
          $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$total', 0] },
        },
        pending_orders: {
          $sum: {
            $cond: [
              { $in: ['$status', ['placed', 'confirmed', 'preparing', 'out_for_delivery']] },
              1,
              0,
            ],
          },
        },
        delivered_orders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        cancelled_orders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      },
    },
  ]);

  const total_customers = await User.countDocuments({ role: 'customer' });

  const [productStats] = await Product.aggregate([
    { $match: { active: true } },
    {
      $group: {
        _id: null,
        total_products: { $sum: 1 },
        low_stock: { $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] } },
      },
    },
  ]);

  const status_breakdown = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);

  const recent_orders = await Order.find({})
    .populate('user', 'name')
    .select('order_number total status createdAt user')
    .sort({ createdAt: -1 })
    .limit(8);

  const top_products = await Product.find({})
    .select('name sales_count stock')
    .sort({ sales_count: -1 })
    .limit(5);

  res.json({
    total_orders: orderStats?.total_orders || 0,
    total_revenue: orderStats?.total_revenue || 0,
    pending_orders: orderStats?.pending_orders || 0,
    delivered_orders: orderStats?.delivered_orders || 0,
    cancelled_orders: orderStats?.cancelled_orders || 0,
    total_customers,
    total_products: productStats?.total_products || 0,
    low_stock_products: productStats?.low_stock || 0,
    status_breakdown,
    recent_orders,
    top_products,
  });
});

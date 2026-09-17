import {pool} from '../config/db.js';

// Aggregated, real-data snapshot for the admin Reports page.
export async function summary(req, res) {
  const [[orderStats]] = await pool.query(
    `SELECT
      COUNT(*) total_orders,
      COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN total ELSE 0 END),0) total_revenue,
      SUM(CASE WHEN status IN ('placed','confirmed','preparing','out_for_delivery') THEN 1 ELSE 0 END) pending_orders,
      SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) delivered_orders,
      SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) cancelled_orders
     FROM orders`
  );
  const [[customerStats]] = await pool.query(`SELECT COUNT(*) total_customers FROM users WHERE role='customer'`);
  const [[productStats]] = await pool.query(`SELECT COUNT(*) total_products, SUM(CASE WHEN stock<10 THEN 1 ELSE 0 END) low_stock FROM products WHERE active=1`);
  const [statusBreakdown] = await pool.query(`SELECT status, COUNT(*) count FROM orders GROUP BY status`);
  const [recentOrders] = await pool.query(
    `SELECT o.id, o.order_number, o.total, o.status, o.created_at, u.name customer_name
     FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC LIMIT 8`
  );
  const [topProducts] = await pool.query(
    `SELECT id, name, sales_count, stock FROM products ORDER BY sales_count DESC LIMIT 5`
  );

  res.json({
    total_orders: Number(orderStats.total_orders) || 0,
    total_revenue: Number(orderStats.total_revenue) || 0,
    pending_orders: Number(orderStats.pending_orders) || 0,
    delivered_orders: Number(orderStats.delivered_orders) || 0,
    cancelled_orders: Number(orderStats.cancelled_orders) || 0,
    total_customers: Number(customerStats.total_customers) || 0,
    total_products: Number(productStats.total_products) || 0,
    low_stock_products: Number(productStats.low_stock) || 0,
    status_breakdown: statusBreakdown,
    recent_orders: recentOrders,
    top_products: topProducts
  });
}

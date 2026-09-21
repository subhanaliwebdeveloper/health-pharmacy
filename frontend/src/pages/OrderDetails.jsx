import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderDetails } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import { statusLabel } from '../utils/orderStatus';
import OrderTracking from '../components/orders/OrderTracking';
import Loader from '../components/common/Loader';

export default function OrderDetails() {
  const { user }              = useAuth();
  const { id }                = useParams();
  const [order, setOrder]     = useState(null);
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    orderDetails(id).then(setOrder).catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, [user, id]);

  if (!user) return <Navigate to={`/login?next=/my-orders/${id}`} />;
  if (loading) return <Loader />;
  if (err) return (
    <div className="page">
      <div className="error">{err}</div>
      <Link className="btn-outline" to="/my-orders">Back to My Orders</Link>
    </div>
  );
  if (!order) return null;

  const address = (() => {
    try { return typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : (order.shipping_address || {}); }
    catch { return {}; }
  })();

  return (
    <div className="page narrow">
      <div className="page-title">
        <span className="eyebrow">ORDER DETAILS</span>
        <h1>{order.order_number}</h1>
        <p>Placed on {new Date(order.createdAt || order.created_at).toLocaleString()}</p>
      </div>

      <div className="order-detail-card">
        <h3>Track Order</h3>
        <OrderTracking status={order.status} />
        <div className="track-current">
          Current status: <span className={`status ${order.status}`}>{statusLabel(order.status)}</span>
        </div>
      </div>

      <div className="order-detail-grid">
        <div className="order-detail-card">
          <h3>Items</h3>
          <div className="order-items">
            {order.items?.map((it, idx) => (
              <div className="order-item-row" key={it.product?._id || idx}>
                {it.image && <img src={it.image} alt={it.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, marginRight: 8 }} />}
                <span>{it.name}</span>
                <span>x{it.quantity}</span>
                <b>{formatPrice(Number(it.unit_price) * it.quantity)}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="order-detail-card">
          <h3>Delivery Address</h3>
          <p className="muted">
            {address.name}<br />
            {address.phone}<br />
            {address.address}, {address.city} {address.postalCode || ''}
          </p>
          <h3>Payment</h3>
          <p className="muted">
            Method: {order.payment_method}<br />
            Status: {order.payment_status}
          </p>
        </div>
      </div>

      <div className="order-detail-card summary-block">
        <h3>Order Summary</h3>
        <div className="summary-line"><span>Subtotal</span><b>{formatPrice(order.subtotal)}</b></div>
        <div className="summary-line"><span>Delivery</span><b>{formatPrice(order.delivery_fee)}</b></div>
        {Number(order.discount) > 0 && (
          <div className="summary-line"><span>Discount</span><b>-{formatPrice(order.discount)}</b></div>
        )}
        <hr />
        <div className="summary-line total"><span>Total</span><b>{formatPrice(order.total)}</b></div>
      </div>

      <Link className="btn-outline" to="/my-orders">Back to My Orders</Link>
    </div>
  );
}

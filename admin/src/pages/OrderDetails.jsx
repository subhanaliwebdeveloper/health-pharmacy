import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { request } from '../services/api';
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadOrder = async () => {
    try {
      const data = await request(`/orders/${id}`);
      setOrder(data);
      setSelectedStatus(data.status || 'placed');
      setErr('');
    } catch (e) {
      setErr(e.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!selectedStatus || selectedStatus === order?.status) return;

    setUpdating(true);
    setMsg('');
    setErr('');

    try {
      await request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: selectedStatus }),
      });
      setMsg('Order status updated successfully');
      await loadOrder();
    } catch (error) {
      setErr(error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="muted" style={{ padding: '30px' }}>Loading order details...</p>;
  }

  if (err && !order) {
    return (
      <div style={{ padding: '30px' }}>
        <div className="err">{err}</div>
        <Link to="/orders" className="btn-admin ghost" style={{ marginTop: '15px', display: 'inline-block' }}>
          ← Back to Orders
        </Link>
      </div>
    );
  }

  let address = {};
  try {
    address =
      typeof order?.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order?.shipping_address || {};
  } catch {
    address = {};
  }

  const customer = order?.user || {};
  const customerName = customer.name || order?.customer_name || address.name || 'Guest Customer';
  const customerEmail = customer.email || order?.email || address.email || '-';
  const customerPhone = customer.phone || order?.phone || address.phone || '-';

  return (
    <>
      <div className="page-head">
        <div>
          <small>SALES & FULFILLMENT</small>
          <h1>Order #{order.order_number}</h1>
        </div>
        <div>
          <Link to="/orders" className="btn-admin ghost">
            ← Back to Orders
          </Link>
        </div>
      </div>

      {err && <div className="err" style={{ marginBottom: '15px' }}>{err}</div>}
      {msg && <div className="msg" style={{ marginBottom: '15px', color: 'var(--green)', fontWeight: 'bold' }}>{msg}</div>}

      <div className="order-detail-grid">
        {/* Left Column: Items and Customer Info */}
        <div>
          <section className="panel">
            <div className="panel-head">
              <h2>Order Items ({order.items?.length || 0})</h2>
              <StatusBadge status={order.status} />
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((it, idx) => (
                    <tr key={it.product?._id || it.product || idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {it.image || it.product?.image ? (
                            <img
                              src={it.image || it.product?.image}
                              alt={it.name}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid var(--line)',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                background: '#f0f4f3',
                                borderRadius: '6px',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '14px',
                              }}
                            >
                              💊
                            </div>
                          )}
                          <div>
                            <b>{it.name}</b>
                          </div>
                        </div>
                      </td>
                      <td>Rs. {Number(it.unit_price).toLocaleString()}</td>
                      <td><b>{it.quantity}</b></td>
                      <td><b>Rs. {(Number(it.unit_price) * it.quantity).toLocaleString()}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Customer & Delivery Address</h2>
            </div>
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Customer Details
                </h4>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                  <b>{customerName}</b><br />
                  Email: {customerEmail}<br />
                  Phone: {customerPhone}
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Shipping Address
                </h4>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                  {address.address ? (
                    <>
                      {address.address}<br />
                      {address.city || ''} {address.postalCode || ''}<br />
                      {address.notes && <small style={{ color: 'var(--muted)' }}>Note: {address.notes}</small>}
                    </>
                  ) : (
                    <span className="muted">No shipping address recorded.</span>
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Status Updater, Payment & Totals */}
        <div>
          <section className="panel">
            <div className="panel-head">
              <h2>Update Order Status</h2>
            </div>
            <form style={{ padding: '20px' }} onSubmit={handleStatusChange}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                Current Status: <StatusBadge status={order.status} />
              </label>
              <select
                className="status-select"
                style={{ width: '100%', padding: '10px', fontSize: '12px', marginBottom: '15px' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="btn-admin"
                style={{ width: '100%', margin: 0 }}
                disabled={updating || selectedStatus === order.status}
              >
                {updating ? 'Updating...' : 'Save New Status'}
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Payment & Totals</h2>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="bar-row">
                <span>Payment Method</span>
                <b>{order.payment_method || 'COD'}</b>
              </div>

              <div className="bar-row">
                <span>Payment Status</span>
                <StatusBadge
                  status={order.payment_status === 'paid' ? 'delivered' : 'pending'}
                  label={order.payment_status || 'Pending'}
                />
              </div>

              {order.coupon_code && (
                <div className="bar-row">
                  <span>Coupon Applied</span>
                  <span className="pill" style={{ background: '#eaf8f2', color: 'var(--green)', fontWeight: 'bold' }}>
                    {order.coupon_code}
                  </span>
                </div>
              )}

              <div className="bar-row">
                <span>Subtotal</span>
                <b>Rs. {Number(order.subtotal || 0).toLocaleString()}</b>
              </div>

              <div className="bar-row">
                <span>Delivery Fee</span>
                <b>Rs. {Number(order.delivery_fee || 0).toLocaleString()}</b>
              </div>

              {Number(order.discount || 0) > 0 && (
                <div className="bar-row" style={{ color: 'var(--green)' }}>
                  <span>Discount</span>
                  <b>- Rs. {Number(order.discount).toLocaleString()}</b>
                </div>
              )}

              <div
                className="bar-row"
                style={{
                  borderTop: '2px solid var(--line)',
                  borderBottom: '0',
                  marginTop: '10px',
                  paddingTop: '12px',
                  fontSize: '15px',
                }}
              >
                <span><b>Total</b></span>
                <b style={{ color: 'var(--green)' }}>
                  Rs. {Number(order.total || 0).toLocaleString()}
                </b>
              </div>

              <div style={{ marginTop: '15px', fontSize: '11px', color: 'var(--muted)' }}>
                Placed on: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

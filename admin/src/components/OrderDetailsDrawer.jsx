import React, { useEffect, useState } from 'react';
import { request } from '../services/api';
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus';
import StatusBadge from './StatusBadge';

export default function OrderDetailsDrawer({ orderId, onClose, onChanged }) {
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    if (!orderId) return;
    request(`/orders/${orderId}`)
      .then(setOrder)
      .catch((e) => setErr(e.message));
  };

  useEffect(() => {
    if (orderId) load();
  }, [orderId]);

  if (!orderId) return null;

  const changeStatus = async (status) => {
    setBusy(true);
    try {
      await request(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
      onChanged?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  let address = {};
  try {
    address =
      typeof order?.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order?.shipping_address || {};
  } catch {
    address = {};
  }

  const customerName = order?.user?.name || order?.customer_name || address.name || 'Customer';
  const customerEmail = order?.user?.email || order?.email || address.email || '-';
  const customerPhone = order?.user?.phone || order?.phone || address.phone || '-';

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>Order #{order?.order_number || 'Details'}</h2>
          <button type="button" className="drawer-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {err && <div className="err" style={{ marginBottom: '12px' }}>{err}</div>}

        {!order ? (
          <p className="muted">Loading order...</p>
        ) : (
          <>
            <div className="drawer-section">
              <h4>Customer Information</h4>
              <p>
                <b>{customerName}</b><br />
                {customerEmail}<br />
                {customerPhone}
              </p>
            </div>

            <div className="drawer-section">
              <h4>Delivery Address</h4>
              <p>
                {address.address ? (
                  <>
                    {address.address}<br />
                    {address.city} {address.postalCode || ''}
                  </>
                ) : (
                  'No delivery address recorded'
                )}
              </p>
            </div>

            <div className="drawer-section">
              <h4>Items ({order.items?.length || 0})</h4>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((it, idx) => (
                      <tr key={it.product?._id || it.product || idx}>
                        <td>{it.name}</td>
                        <td>{it.quantity}</td>
                        <td>Rs. {Number(it.unit_price).toLocaleString()}</td>
                        <td>Rs. {(Number(it.unit_price) * it.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="drawer-section">
              <h4>Payment & Totals</h4>
              <div className="bar-row">
                <span>Payment Method</span>
                <b>{order.payment_method || 'COD'}</b>
              </div>
              <div className="bar-row">
                <span>Payment Status</span>
                <b>{order.payment_status || 'Pending'}</b>
              </div>
              <div className="bar-row">
                <span>Subtotal</span>
                <b>Rs. {Number(order.subtotal || 0).toLocaleString()}</b>
              </div>
              <div className="bar-row">
                <span>Delivery Fee</span>
                <b>Rs. {Number(order.delivery_fee || 0).toLocaleString()}</b>
              </div>
              {Number(order.discount) > 0 && (
                <div className="bar-row" style={{ color: 'var(--green)' }}>
                  <span>Discount</span>
                  <b>-Rs. {Number(order.discount).toLocaleString()}</b>
                </div>
              )}
              <div className="bar-row">
                <span>Total</span>
                <b>Rs. {Number(order.total || 0).toLocaleString()}</b>
              </div>
            </div>

            <div className="drawer-section">
              <h4>Update Status</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  className="status-select"
                  disabled={busy}
                  value={order.status}
                  onChange={(e) => changeStatus(e.target.value)}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
                <StatusBadge status={order.status} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

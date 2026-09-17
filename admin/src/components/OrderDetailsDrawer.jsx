import React from "react";
import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus';

export default function OrderDetailsDrawer({ orderId, onClose, onChanged }) {
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = () => request(`/orders/${orderId}`).then(setOrder).catch(e => setErr(e.message));
  useEffect(() => { if (orderId) load(); }, [orderId]);

  if (!orderId) return null;

  const changeStatus = async (status) => {
    setBusy(true);
    try {
      await request(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await load();
      onChanged?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  let address = {};
  try { address = typeof order?.shipping_address === 'string' ? JSON.parse(order.shipping_address) : (order?.shipping_address || {}); } catch { address = {}; }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>{order?.order_number || 'Order Details'}</h2>
          <button className="drawer-close" onClick={onClose}>&times;</button>
        </div>
        {err && <div className="err">{err}</div>}
        {!order ? <p className="muted">Loading...</p> : <>
          <div className="drawer-section">
            <h4>Customer</h4>
            <p>{order.customer_name}<br />{order.email}<br />{order.phone}</p>
          </div>
          <div className="drawer-section">
            <h4>Delivery Address</h4>
            <p>{address.name}<br />{address.phone}<br />{address.address}, {address.city} {address.postalCode || ''}</p>
          </div>
          <div className="drawer-section">
            <h4>Items</h4>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>
                  {order.items?.map(it => (
                    <tr key={it.id}>
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
            <div className="bar-row"><span>Payment Method</span><b>{order.payment_method}</b></div>
            <div className="bar-row"><span>Payment Status</span><b>{order.payment_status}</b></div>
            <div className="bar-row"><span>Subtotal</span><b>Rs. {Number(order.subtotal).toLocaleString()}</b></div>
            <div className="bar-row"><span>Delivery Fee</span><b>Rs. {Number(order.delivery_fee).toLocaleString()}</b></div>
            {Number(order.discount) > 0 && <div className="bar-row"><span>Discount</span><b>-Rs. {Number(order.discount).toLocaleString()}</b></div>}
            <div className="bar-row"><span>Total</span><b>Rs. {Number(order.total).toLocaleString()}</b></div>
          </div>
          <div className="drawer-section">
            <h4>Update Status</h4>
            <select className="status-select" disabled={busy} value={order.status} onChange={e => changeStatus(e.target.value)}>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
          </div>
        </>}
      </div>
    </div>
  );
}

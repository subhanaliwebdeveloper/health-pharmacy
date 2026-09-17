import React from "react";
import { request } from '../services/api';
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus';

export default function OrderTable({ rows, onChange, onView }) {
  const update = async (id, status) => {
    await request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    onChange?.();
  };
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr>
        </thead>
        <tbody>
          {rows.map(o => (
            <tr key={o.id}>
              <td><b>{o.order_number}</b></td>
              <td>{o.customer_name}<small>{o.email}</small></td>
              <td>Rs. {Number(o.total).toLocaleString()}</td>
              <td>{o.payment_method}</td>
              <td>
                <select className="status-select" value={o.status} onChange={e => update(o.id, e.target.value)}>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td><button className="approve" onClick={() => onView?.(o.id)}>View</button></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={7} className="no-data">No orders found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

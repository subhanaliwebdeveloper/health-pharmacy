import React from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api';
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus';
import StatusBadge from './StatusBadge';

export default function OrderTable({ rows = [], onChange, onView }) {
  const updateStatus = async (orderId, status) => {
    try {
      await request(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      onChange?.();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const orderId = o._id || o.id;
            return (
              <tr key={orderId}>
                <td>
                  <Link
                    to={`/order/${orderId}`}
                    style={{ color: 'var(--green)', fontWeight: 'bold' }}
                  >
                    #{o.order_number}
                  </Link>
                </td>
                <td>
                  <b>{o.customer_name || o.user?.name || 'Customer'}</b>
                  <small>{o.email || o.user?.email || '-'}</small>
                </td>
                <td>
                  <b>Rs. {Number(o.total || 0).toLocaleString()}</b>
                </td>
                <td>
                  <small>{o.payment_method || 'COD'}</small>
                </td>
                <td>
                  <select
                    className="status-select"
                    value={o.status}
                    onChange={(e) => updateStatus(orderId, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString()
                    : o.created_at
                    ? new Date(o.created_at).toLocaleDateString()
                    : '-'}
                </td>
                <td>
                  <div className="row-actions">
                    <Link
                      to={`/order/${orderId}`}
                      className="approve"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      View Details
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
          {!rows.length && (
            <tr>
              <td colSpan={7} className="no-data">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

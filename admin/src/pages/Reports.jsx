import React from "react";
import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { statusLabel } from '../utils/orderStatus';

export default function Reports() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    request('/reports/summary').then(setData).catch(e => setErr(e.message));
  }, []);

  if (err) return <div className="err">{err}</div>;
  if (!data) return <p className="muted">Loading reports...</p>;

  return (
    <>
      <div className="page-head"><div><small>ANALYTICS</small><h1>Reports</h1></div></div>

      <div className="stats">
        <div className="stat"><span className="stat-icon">🛍️</span><div><small>Total Orders</small><h2>{data.total_orders}</h2></div></div>
        <div className="stat"><span className="stat-icon">💰</span><div><small>Total Revenue</small><h2>Rs. {data.total_revenue.toLocaleString()}</h2></div></div>
        <div className="stat"><span className="stat-icon">⏳</span><div><small>Pending Orders</small><h2>{data.pending_orders}</h2></div></div>
        <div className="stat"><span className="stat-icon">✅</span><div><small>Delivered Orders</small><h2>{data.delivered_orders}</h2></div></div>
      </div>
      <div className="stats">
        <div className="stat"><span className="stat-icon">👥</span><div><small>Customers</small><h2>{data.total_customers}</h2></div></div>
        <div className="stat"><span className="stat-icon">💊</span><div><small>Active Products</small><h2>{data.total_products}</h2></div></div>
        <div className="stat"><span className="stat-icon">⚠️</span><div><small>Low Stock</small><h2>{data.low_stock_products}</h2></div></div>
        <div className="stat"><span className="stat-icon">❌</span><div><small>Cancelled Orders</small><h2>{data.cancelled_orders}</h2></div></div>
      </div>

      <section className="report-grid">
        <div className="report-card">
          <h3>Order Status Breakdown</h3>
          {data.status_breakdown.map(s => (
            <div className="bar-row" key={s.status}><span>{statusLabel(s.status)}</span><b>{s.count}</b></div>
          ))}
          {!data.status_breakdown.length && <p className="muted">No orders yet.</p>}
        </div>
        <div className="report-card">
          <h3>Top Selling Products</h3>
          {data.top_products.map(p => (
            <div className="bar-row" key={p.id}><span>{p.name}</span><b>{p.sales_count} sold</b></div>
          ))}
          {!data.top_products.length && <p className="muted">No sales yet.</p>}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Recent Orders</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {data.recent_orders.map(o => (
                <tr key={o.id}>
                  <td><b>{o.order_number}</b></td>
                  <td>{o.customer_name}</td>
                  <td>Rs. {Number(o.total).toLocaleString()}</td>
                  <td><span className={`pill ${o.status}`}>{statusLabel(o.status)}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {!data.recent_orders.length && <tr><td colSpan={5} className="no-data">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

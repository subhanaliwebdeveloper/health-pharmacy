import React from "react";
import { useEffect, useState } from 'react';
import { request } from '../services/api';
import DataTable from '../components/DataTable';
import { statusLabel } from '../utils/orderStatus';

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => { request('/users').then(setRows); }, []);

  const viewCustomer = async (c) => {
    setSelected(c);
    setLoadingOrders(true);
    try {
      const data = await request(`/users/${c.id}/orders`);
      setOrders(data);
    } finally {
      setLoadingOrders(false);
    }
  };

  const close = () => { setSelected(null); setOrders([]); };

  return (
    <>
      <div className="page-head"><div><small>USERS</small><h1>Customers</h1></div></div>
      <section className="panel">
        <DataTable
          rows={rows.filter(x => x.role === 'customer')}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'city', label: 'City' },
            { key: 'created_at', label: 'Joined', render: r => new Date(r.created_at).toLocaleDateString() },
            { key: 'id', label: 'Actions', render: r => <button className="approve" onClick={() => viewCustomer(r)}>View Orders</button> }
          ]}
        />
      </section>

      {selected && (
        <div className="drawer-overlay" onClick={close}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>{selected.name}</h2>
              <button className="drawer-close" onClick={close}>&times;</button>
            </div>
            <div className="drawer-section">
              <h4>Customer Details</h4>
              <p>{selected.email}<br />{selected.phone || 'No phone on file'}<br />{selected.address}{selected.address ? ', ' : ''}{selected.city}</p>
            </div>
            <div className="drawer-section">
              <h4>Order History</h4>
              {loadingOrders && <p className="muted">Loading orders...</p>}
              {!loadingOrders && (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Order</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td><b>{o.order_number}</b></td>
                          <td>Rs. {Number(o.total).toLocaleString()}</td>
                          <td><span className={`pill ${o.status}`}>{statusLabel(o.status)}</span></td>
                          <td>{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {!orders.length && <tr><td colSpan={4} className="no-data">No orders from this customer yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { request } from '../services/api';
import OrderTable from '../components/OrderTable';
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus';

export default function Orders() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const data = await request(`/orders${params.toString() ? `?${params}` : ''}`);
      setRows(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, status]);

  return (
    <>
      <div className="page-head">
        <div>
          <small>SALES & FULFILLMENT</small>
          <h1>Orders</h1>
        </div>
      </div>

      <section className="panel">
        <div className="quick-form">
          <input
            placeholder="Search order #, customer name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses ({rows.length})</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="muted" style={{ padding: '20px' }}>Loading orders...</p>
        ) : (
          <OrderTable rows={rows} onChange={load} />
        )}
      </section>
    </>
  );
}

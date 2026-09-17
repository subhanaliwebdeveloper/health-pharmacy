import React from "react";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../services/api';
import OrderTable from '../components/OrderTable';
import OrderDetailsDrawer from '../components/OrderDetailsDrawer';
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus';

export default function Orders() {
  const { id } = useParams();
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [viewId, setViewId] = useState(id ? Number(id) : null);

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    request(`/orders${params.toString() ? `?${params}` : ''}`).then(setRows);
  };

  useEffect(load, [search, status]);
  useEffect(() => { setViewId(id ? Number(id) : null); }, [id]);

  const openOrder = (orderId) => { setViewId(orderId); nav(`/order/${orderId}`); };
  const closeDrawer = () => { setViewId(null); nav('/orders'); };

  return (
    <>
      <div className="page-head">
        <div><small>SALES</small><h1>Orders</h1></div>
      </div>
      <section className="panel">
        <div className="quick-form">
          <input placeholder="Search order #, customer name or email" value={search} onChange={e => setSearch(e.target.value)} />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </div>
        <OrderTable rows={rows} onChange={load} onView={openOrder} />
      </section>
      {viewId && <OrderDetailsDrawer orderId={viewId} onClose={closeDrawer} onChanged={load} />}
    </>
  );
}

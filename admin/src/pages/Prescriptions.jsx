import React, { useEffect, useState } from 'react';
import { request } from '../services/api';
import PrescriptionViewer from '../components/PrescriptionViewer';
import { useAuth } from '../context/AuthContext';

export default function Prescriptions() {
  const { canReviewPrescriptions, role } = useAuth();
  const [rows, setRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rxData, ordersData] = await Promise.all([
        request('/prescriptions'),
        request('/orders').catch(() => []),
      ]);
      setRows(rxData || []);
      setOrders(ordersData || []);
      setMsg('');
    } catch (error) {
      console.error('Prescriptions loading error:', error);
      setMsg(error.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = statusFilter
    ? rows.filter((r) => r.status === statusFilter)
    : rows;

  return (
    <>
      <div className="page-head">
        <div>
          <small>PHARMACY REVIEW</small>
          <h1>Prescriptions</h1>
        </div>
        {!canReviewPrescriptions && (
          <div style={{ fontSize: '11px', color: '#b25e00', background: '#fff8e6', padding: '6px 12px', borderRadius: '6px' }}>
            ⓘ Your role ({role || 'Staff'}) is View Only. Pharmacist Reviewer or Super Admin role is required to approve/reject.
          </div>
        )}
      </div>

      <section className="panel">
        <div className="quick-form">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses ({rows.length})</option>
            <option value="pending">Pending Review ({rows.filter((r) => r.status === 'pending').length})</option>
            <option value="approved">Approved ({rows.filter((r) => r.status === 'approved').length})</option>
            <option value="rejected">Rejected ({rows.filter((r) => r.status === 'rejected').length})</option>
          </select>
        </div>

        {msg && <div className="msg" style={{ margin: '15px' }}>{msg}</div>}
        {loading ? (
          <p className="muted" style={{ padding: '20px' }}>Loading prescriptions...</p>
        ) : (
          <PrescriptionViewer
            rows={filtered}
            orders={orders}
            onChange={loadData}
          />
        )}
      </section>
    </>
  );
}
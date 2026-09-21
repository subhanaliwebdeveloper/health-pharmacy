import React from 'react';

export default function PrescriptionStatus({ items = [] }) {
  return (
    <div className="form-card">
      <h3>Prescription History</h3>
      {!items.length ? (
        <p className="muted">No prescriptions uploaded yet.</p>
      ) : (
        items.map((p) => (
          <div className="rx-row" key={p._id}>
            <div>
              <b>Prescription #{String(p._id).slice(-6).toUpperCase()}</b>
              <small>{new Date(p.createdAt || p.created_at).toLocaleString()}</small>
              {p.note && <p className="muted" style={{ margin: '4px 0 0' }}>{p.note}</p>}
            </div>
            <span className={`status ${p.status}`}>{p.status}</span>
          </div>
        ))
      )}
    </div>
  );
}

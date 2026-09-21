import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function BatchManager({ batches = [], onChange }) {
  const [batchNumber, setBatchNumber] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [error, setError] = useState('');

  const getDaysUntilExpiry = (dateStr) => {
    if (!dateStr) return null;
    const exp = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleAddBatch = (e) => {
    e.preventDefault();
    setError('');

    const trimmedBatchNumber = batchNumber.trim();
    if (!trimmedBatchNumber) {
      setError('Batch number is required.');
      return;
    }

    if (!expiryDate) {
      setError('Expiry date is required.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedExpiry = new Date(expiryDate);
    if (selectedExpiry < today) {
      setError('Cannot add batch: Expiry date is in the past!');
      return;
    }

    const qty = Number(stockQty);
    if (isNaN(qty) || qty < 0) {
      setError('Stock quantity must be a non-negative number.');
      return;
    }

    const newBatch = {
      batch_number: trimmedBatchNumber,
      mfg_date: mfgDate || null,
      expiry_date: expiryDate,
      stock_qty: qty,
    };

    const updated = [...batches, newBatch];
    onChange(updated);

    // Reset inputs
    setBatchNumber('');
    setMfgDate('');
    setExpiryDate('');
    setStockQty('');
  };

  const handleRemoveBatch = (indexToRemove) => {
    const updated = batches.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const totalStock = batches.reduce((sum, b) => sum + (Number(b.stock_qty || b.stock) || 0), 0);

  return (
    <div className="batch-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>Product Batches & Expiry Tracking</h3>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
          Total Batch Stock: <b>{totalStock}</b> ({batches.length} {batches.length === 1 ? 'batch' : 'batches'})
        </span>
      </div>

      {error && <div className="err" style={{ marginBottom: '12px' }}>{error}</div>}

      <div className="batch-grid">
        <label>
          Batch #
          <input
            type="text"
            placeholder="e.g. BATCH-2026-01"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />
        </label>

        <label>
          Mfg Date
          <input
            type="date"
            value={mfgDate}
            onChange={(e) => setMfgDate(e.target.value)}
          />
        </label>

        <label>
          Expiry Date *
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => {
              setExpiryDate(e.target.value);
              if (error) setError('');
            }}
          />
        </label>

        <label>
          Stock Qty
          <input
            type="number"
            min="0"
            placeholder="Units"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
          />
        </label>

        <div>
          <button
            type="button"
            className="btn-admin"
            style={{ width: '100%', marginTop: '5px' }}
            onClick={handleAddBatch}
          >
            + Add Batch
          </button>
        </div>
      </div>

      {batches.length > 0 ? (
        <div className="table-wrap">
          <table className="batch-table">
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Mfg Date</th>
                <th>Expiry Date</th>
                <th>Stock</th>
                <th>Expiry Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b, idx) => {
                const days = getDaysUntilExpiry(b.expiry_date);
                let expiryStatus = 'good';
                let expiryLabel = 'Good';

                if (days === null) {
                  expiryLabel = 'No Expiry';
                } else if (days <= 0) {
                  expiryStatus = 'expired';
                  expiryLabel = 'Expired';
                } else if (days <= 90) {
                  expiryStatus = 'expiring_soon';
                  expiryLabel = `Expiring soon (${days}d)`;
                } else {
                  expiryStatus = 'good';
                  expiryLabel = `Good (${days}d)`;
                }

                return (
                  <tr key={b._id || b.batch_number || idx}>
                    <td><b>{b.batch_number}</b></td>
                    <td>{b.mfg_date ? new Date(b.mfg_date).toLocaleDateString() : '-'}</td>
                    <td>{b.expiry_date ? new Date(b.expiry_date).toLocaleDateString() : '-'}</td>
                    <td><b>{b.stock_qty ?? b.stock ?? 0}</b></td>
                    <td>
                      <StatusBadge status={expiryStatus} label={expiryLabel} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="delete"
                        onClick={() => handleRemoveBatch(idx)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: '11px', margin: '5px 0' }}>
          No batches recorded for this product yet. Add a batch above to track lots and expiration dates.
        </p>
      )}
    </div>
  );
}

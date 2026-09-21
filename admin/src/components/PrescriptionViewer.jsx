import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

export default function PrescriptionViewer({ rows = [], onChange, orders = [] }) {
  const { canReviewPrescriptions, role } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});

  // Map orders waiting on prescriptions (if any)
  const getLinkedOrder = (prescription) => {
    // 1. Direct property from backend if populated or stored
    if (prescription.order && typeof prescription.order === 'object') {
      return prescription.order;
    }
    if (prescription.order_id || prescription.order_number) {
      return { _id: prescription.order_id, order_number: prescription.order_number };
    }
    // 2. Cross-reference with loaded orders list if available
    const matched = orders.find(
      (o) =>
        String(o.prescription?._id || o.prescription || o.prescription_id) === String(prescription._id)
    );
    return matched || null;
  };

  const updateStatus = async (prescriptionId, status) => {
    if (!canReviewPrescriptions) return;

    setUpdatingId(prescriptionId);
    try {
      const note = adminNotes[prescriptionId] ?? '';
      await request(`/prescriptions/${prescriptionId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          admin_note: note,
        }),
      });
      onChange?.();
    } catch (err) {
      alert(err.message || 'Failed to update prescription status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Prescription Image</th>
              <th>Linked Order</th>
              <th>Customer Note</th>
              <th>Reviewer Note</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const linkedOrder = getLinkedOrder(p);
              const isUpdating = updatingId === p._id;

              return (
                <tr key={p._id || p.id}>
                  <td>
                    <b>{p.user?.name || p.customer_name || 'Customer'}</b>
                    <small>{p.user?.email || p.email || '-'}</small>
                  </td>

                  <td>
                    {p.image_url ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={p.image_url}
                          alt="Prescription thumbnail"
                          style={{
                            width: '45px',
                            height: '45px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid var(--line)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedImage(p.image_url)}
                        />
                        <button
                          type="button"
                          className="approve"
                          style={{ padding: '4px 7px', fontSize: '9px' }}
                          onClick={() => setSelectedImage(p.image_url)}
                        >
                          Enlarge
                        </button>
                      </div>
                    ) : (
                      <span className="muted">No Image</span>
                    )}
                  </td>

                  <td>
                    {linkedOrder ? (
                      <Link
                        to={`/order/${linkedOrder._id || linkedOrder.id}`}
                        style={{ color: 'var(--green)', fontWeight: 'bold' }}
                      >
                        #{linkedOrder.order_number || linkedOrder._id || linkedOrder.id}
                      </Link>
                    ) : (
                      <small style={{ color: 'var(--muted)' }}>Direct Upload (No Order)</small>
                    )}
                  </td>

                  <td style={{ maxWidth: '160px', whiteSpace: 'normal', fontSize: '11px' }}>
                    {p.note || '-'}
                  </td>

                  <td style={{ minWidth: '150px' }}>
                    {canReviewPrescriptions ? (
                      <input
                        type="text"
                        placeholder="Optional note..."
                        defaultValue={p.admin_note || ''}
                        onChange={(e) =>
                          setAdminNotes({ ...adminNotes, [p._id]: e.target.value })
                        }
                        style={{ fontSize: '10px', padding: '4px 6px', margin: 0 }}
                      />
                    ) : (
                      <small>{p.admin_note || '-'}</small>
                    )}
                  </td>

                  <td>
                    <StatusBadge status={p.status} />
                  </td>

                  <td>
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
                      : '-'}
                  </td>

                  <td>
                    {canReviewPrescriptions ? (
                      <div className="row-actions">
                        <button
                          type="button"
                          className="approve"
                          disabled={isUpdating || p.status === 'approved'}
                          onClick={() => updateStatus(p._id, 'approved')}
                          title="Approve Prescription"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="delete"
                          disabled={isUpdating || p.status === 'rejected'}
                          onClick={() => updateStatus(p._id, 'rejected')}
                          title="Reject Prescription"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <small style={{ color: 'var(--muted)' }}>View Only ({role || 'Staff'})</small>
                    )}
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={8} className="no-data">
                  No prescriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Lightbox modal for full prescription preview */}
      {selectedImage && (
        <div
          className="drawer-overlay"
          style={{ justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <b>Prescription Image</b>
              <button
                type="button"
                className="drawer-close"
                onClick={() => setSelectedImage(null)}
              >
                &times;
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Prescription"
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <div style={{ marginTop: '12px' }}>
              <a
                href={selectedImage}
                target="_blank"
                rel="noreferrer"
                className="view-link"
                style={{ fontSize: '12px' }}
              >
                Open in new tab ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

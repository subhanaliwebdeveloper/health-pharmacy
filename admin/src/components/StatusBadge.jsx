import React from 'react';

const STATUS_LABELS = {
  // Orders
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  // Prescriptions
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  // General
  active: 'Active',
  inactive: 'Inactive',
  expired: 'Expired',
  expiring_soon: 'Expiring Soon',
  good: 'Good',
};

export default function StatusBadge({ status, label, className = '' }) {
  const normStatus = String(status || '').toLowerCase();
  const displayLabel = label || STATUS_LABELS[normStatus] || status || '-';

  return (
    <span className={`pill ${normStatus} ${className}`.trim()}>
      {displayLabel}
    </span>
  );
}

import React from "react";
import { TRACKING_STEPS, statusLabel } from '../../utils/orderStatus';

export default function OrderTracking({ status }) {
  if (status === 'cancelled') {
    return <div className="tracking-cancelled">
      <span>✕</span>
      <div><b>Order Cancelled</b><small>This order will not be delivered.</small></div>
    </div>;
  }
  const activeIndex = Math.max(TRACKING_STEPS.indexOf(status), 0);
  return (
    <div className="tracking">
      {TRACKING_STEPS.map((step, i) => (
        <div className={`tracking-step ${i <= activeIndex ? 'done' : ''} ${i === activeIndex ? 'current' : ''}`} key={step}>
          <div className="tracking-dot">{i < activeIndex ? '✓' : i + 1}</div>
          <div className="tracking-label">{statusLabel(step)}</div>
          {i < TRACKING_STEPS.length - 1 && <div className="tracking-line" />}
        </div>
      ))}
    </div>
  );
}

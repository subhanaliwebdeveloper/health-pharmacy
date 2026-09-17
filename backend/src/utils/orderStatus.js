// Canonical order status flow (matches customer tracking timeline):
// Order Placed -> Confirmed -> Preparing -> Out for Delivery -> Delivered
// 'cancelled' is a terminal side-status admins can still set.
export const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

// Ordered steps used to render the visual tracking timeline (cancelled excluded).
export const TRACKING_STEPS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

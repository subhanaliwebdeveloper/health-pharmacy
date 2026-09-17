export const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

// The five steps shown on the visual tracking timeline, in order.
export const TRACKING_STEPS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export const statusLabel = (status) => STATUS_LABELS[status] || status;

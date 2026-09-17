import React, { useEffect, useState } from 'react';
import { request } from '../services/api';
import DataTable from '../components/DataTable';
import { statusLabel } from '../utils/orderStatus';

function addressLine(order) {
try {
const a =
typeof order.shipping_address === 'string'
? JSON.parse(order.shipping_address)
: order.shipping_address || {};

return `${a.address || ''}, ${a.city || ''}`.trim();

} catch {
return '-';
}
}

export default function Delivery() {
const [rows, setRows] = useState([]);
const [onlyActive, setOnlyActive] = useState(true);

const load = async () => {
try {
const data = await request('/orders');
setRows(data);
} catch (error) {
console.error('Delivery orders loading error:', error);
}
};

useEffect(() => {
load();
}, []);

const filtered = onlyActive
? rows.filter(
(r) => !['delivered', 'cancelled'].includes(r.status)
)
: rows;

return (
<>
<div className="page-head">
<div>
<small>FULFILLMENT</small>
<h1>Delivery</h1>
</div>
</div>

  <section className="panel">
    <div className="quick-form">
      <label className="check">
        <input
          type="checkbox"
          checked={onlyActive}
          onChange={(e) => setOnlyActive(e.target.checked)}
        />
        Show only orders awaiting delivery
      </label>
    </div>

    <DataTable
      rows={filtered}
      columns={[
        {
          key: 'order_number',
          label: 'Order'
        },
        {
          key: 'customer_name',
          label: 'Customer',
          render: (r) => (
            <div>
              {r.customer_name}
              <small>{r.email}</small>
            </div>
          )
        },
        {
          key: 'address',
          label: 'Delivery Address',
          render: (r) => addressLine(r)
        },
        {
          key: 'delivery_fee',
          label: 'Delivery Fee',
          render: (r) =>
            `Rs. ${Number(r.delivery_fee).toLocaleString()}`
        },
        {
          key: 'status',
          label: 'Status',
          render: (r) => (
            <span className={`pill ${r.status}`}>
              {statusLabel(r.status)}
            </span>
          )
        },
        {
          key: 'created_at',
          label: 'Placed',
          render: (r) =>
            new Date(r.created_at).toLocaleDateString()
        }
      ]}
    />
  </section>
</>

);
}
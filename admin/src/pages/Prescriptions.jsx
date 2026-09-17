import React, { useEffect, useState } from 'react';
import { request } from '../services/api';
import PrescriptionViewer from '../components/PrescriptionViewer';

export default function Prescriptions() {
const [rows, setRows] = useState([]);
const [msg, setMsg] = useState('');

const loadPrescriptions = async () => {
try {
const data = await request('/prescriptions');
setRows(data);
setMsg('');
} catch (error) {
console.error('Prescriptions loading error:', error);
setMsg(error.message || 'Failed to load prescriptions');
}
};

useEffect(() => {
loadPrescriptions();
}, []);

return (
<>
<div className="page-head">
<div>
<small>PHARMACY REVIEW</small>
<h1>Prescriptions</h1>
</div>
</div>

  <section className="panel">
    {msg && <div className="msg">{msg}</div>}

    <PrescriptionViewer
      rows={rows}
      onChange={loadPrescriptions}
    />
  </section>
</>

);
}
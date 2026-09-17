import React from "react";
import { useEffect, useState } from 'react';
import { request } from '../services/api';

export default function Settings() {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { request('/settings').then(setForm); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      const updated = await request('/settings', { method: 'PUT', body: JSON.stringify(form) });
      setForm(updated);
      setMsg('Settings saved successfully.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!form) return <p className="muted">Loading settings...</p>;

  return (
    <>
      <div className="page-head"><div><small>SYSTEM</small><h1>Settings</h1></div></div>
      <section className="panel">
        <h2>Store Settings</h2>
        <form className="settings" onSubmit={save}>
          <label>Store Name
            <input value={form.store_name || ''} onChange={e => set('store_name', e.target.value)} required />
          </label>
          <label>Support Phone
            <input value={form.support_phone || ''} onChange={e => set('support_phone', e.target.value)} />
          </label>
          <label>Support Email
            <input type="email" value={form.support_email || ''} onChange={e => set('support_email', e.target.value)} />
          </label>
          <label>Store Address
            <input value={form.address || ''} onChange={e => set('address', e.target.value)} />
          </label>
          <label>Delivery Fee (Rs.)
            <input type="number" min="0" value={form.delivery_fee ?? 0} onChange={e => set('delivery_fee', e.target.value)} />
          </label>
          <label>Free Delivery Threshold (Rs.)
            <input type="number" min="0" value={form.free_delivery_threshold ?? 0} onChange={e => set('free_delivery_threshold', e.target.value)} />
          </label>
          <button className="btn-admin" disabled={busy}>{busy ? 'Saving...' : 'Save Settings'}</button>
          {msg && <span className="msg">{msg}</span>}
        </form>
      </section>
    </>
  );
}

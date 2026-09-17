import React from "react";
import { useState } from 'react';
import { uploadPrescription } from '../../services/prescriptionService';

export default function PrescriptionUpload({ onDone }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setProgress(0);
    setMsg('');
    try {
      await uploadPrescription(file, note, setProgress);
      setMsg('Prescription uploaded successfully. Our pharmacy team will review it.');
      setFile(null);
      setNote('');
      onDone?.();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form-card" onSubmit={submit}>
      <h3>Upload Prescription</h3>
      <p className="muted">Upload a clear JPG, PNG, WEBP image or a video file.</p>
      <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      {busy && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Uploading: {progress}%</div>
          <div style={{ width: '100%', height: 8, background: '#e9ecef', borderRadius: 999 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#0d6efd', borderRadius: 999 }} />
          </div>
        </div>
      )}
      <textarea placeholder="Optional note for pharmacist" value={note} onChange={e => setNote(e.target.value)} />
      <button className="btn-primary" disabled={!file || busy}>{busy ? 'Uploading...' : 'Upload Prescription'}</button>
      {msg && <div className="notice">{msg}</div>}
    </form>
  );
}

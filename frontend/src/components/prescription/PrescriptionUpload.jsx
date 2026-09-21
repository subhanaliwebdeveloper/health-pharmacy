import React, { useState } from 'react';
import { uploadPrescription } from '../../services/prescriptionService';

export default function PrescriptionUpload({ onDone }) {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [note, setNote]         = useState('');
  const [busy, setBusy]         = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg]           = useState('');
  const [isError, setIsError]   = useState(false);

  const handleFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setMsg('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setProgress(0);
    setMsg('');
    setIsError(false);

    try {
      const result = await uploadPrescription(file, note, setProgress);
      setMsg('Prescription uploaded successfully. Our pharmacy team will review it.');
      // Show Cloudinary preview if returned
      if (result?.image_url) setPreview(result.image_url);
      setFile(null);
      setNote('');
      onDone?.();
    } catch (e) {
      setIsError(true);
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form-card" onSubmit={submit}>
      <h3>Upload Prescription</h3>
      <p className="muted">Upload a clear JPG, PNG, or WebP image (max 5 MB).</p>

      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} />

      {preview && (
        <img
          src={preview}
          alt="Prescription preview"
          style={{ marginTop: 10, maxHeight: 180, borderRadius: 8, objectFit: 'contain' }}
        />
      )}

      {busy && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Uploading: {progress}%</div>
          <div style={{ width: '100%', height: 8, background: '#e9ecef', borderRadius: 999 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#0d6efd', borderRadius: 999, transition: 'width 0.2s' }} />
          </div>
        </div>
      )}

      <textarea
        placeholder="Optional note for pharmacist"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button className="btn-primary" disabled={!file || busy}>
        {busy ? 'Uploading...' : 'Upload Prescription'}
      </button>

      {msg && <div className={isError ? 'error' : 'notice'}>{msg}</div>}
    </form>
  );
}

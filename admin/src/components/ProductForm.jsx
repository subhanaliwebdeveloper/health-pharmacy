import React from "react";
import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';

const empty = { name: '', description: '', price: '', discount_price: '', category_id: '', brand: '', stock: '', sku: '', requires_prescription: 0, active: 1, image: null };

export default function ProductForm({ categories, editing, onDone, onCancelEdit }) {
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (editing) {
      setF({
        name: editing.name || '', description: editing.description || '', price: editing.price || '',
        discount_price: editing.discount_price || '', category_id: editing.category_id || '', brand: editing.brand || '',
        stock: editing.stock ?? '', sku: editing.sku || '', requires_prescription: editing.requires_prescription ? 1 : 0,
        active: editing.active === 0 ? 0 : 1, image: null
      });
      setMsg('');
    } else {
      setF(empty);
    }
  }, [editing]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) {
      setF({ ...f, image: null });
      setUploadProgress(0);
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset) {
      try {
        setUploading(true);
        setUploadProgress(0);
        setMsg('Uploading image to Cloudinary...');
        const result = await uploadToCloudinary(selectedFile, {
          cloudName,
          uploadPreset,
          onProgress: setUploadProgress,
        });
        const url = result?.secure_url || result?.url;
        setF({ ...f, image: url || selectedFile.name });
        setMsg('Image uploaded successfully.');
      } catch (err) {
        setF({ ...f, image: null });
        setMsg(err.message || 'Image upload failed.');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
      return;
    }

    setF({ ...f, image: selectedFile });
    setUploadProgress(100);
    setMsg('Cloudinary not configured; file will be sent to your server.');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg('');
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => { if (v !== null) fd.append(k, v); });
    try {
      if (editing) {
        await request(`/products/${editing.id}`, { method: 'PUT', body: fd });
        setMsg('Product updated');
      } else {
        await request('/products', { method: 'POST', body: fd });
        setMsg('Product created');
        setF(empty);
      }
      onDone?.();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="form-grid">
        <label>Product Name<input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label>
        <label>Brand<input value={f.brand} onChange={e => setF({ ...f, brand: e.target.value })} /></label>
        <label>Price (Rs.)<input type="number" required value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></label>
        <label>Discount Price<input type="number" value={f.discount_price} onChange={e => setF({ ...f, discount_price: e.target.value })} /></label>
        <label>Category
          <select value={f.category_id} onChange={e => setF({ ...f, category_id: e.target.value })}>
            <option value="">Select category</option>
            {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Stock<input type="number" value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} /></label>
        <label>SKU<input value={f.sku} onChange={e => setF({ ...f, sku: e.target.value })} /></label>
        <label>
          Product Image
          <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
        </label>
        {uploading && (
          <div className="wide">
            <div style={{ fontSize: 12, marginBottom: 4 }}>Uploading: {uploadProgress}%</div>
            <div style={{ width: '100%', height: 8, background: '#e9ecef', borderRadius: 999 }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#28a745', borderRadius: 999 }} />
            </div>
          </div>
        )}
        <label className="check"><input type="checkbox" checked={!!f.requires_prescription} onChange={e => setF({ ...f, requires_prescription: e.target.checked ? 1 : 0 })} /> Prescription required</label>
        <label className="check"><input type="checkbox" checked={f.active === 1} onChange={e => setF({ ...f, active: e.target.checked ? 1 : 0 })} /> Active (visible to customers)</label>
        <label className="wide">Description<textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></label>
      </div>
      <button className="btn-admin" disabled={busy || uploading}>{busy ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}</button>
      {editing && <button type="button" className="btn-admin ghost" onClick={onCancelEdit}>Cancel Edit</button>}
      {msg && <span className="msg">{msg}</span>}
    </form>
  );
}

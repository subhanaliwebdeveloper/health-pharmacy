import React, { useEffect, useState } from 'react';
import { request } from '../services/api';
import BatchManager from './BatchManager';

export default function ProductForm({ categories = [], editing = null, onDone, onCancelEdit }) {
  const [f, setF] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    brand: '',
    stock: 0,
    sku: '',
    requires_prescription: false,
    active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [batches, setBatches] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (editing) {
      setF({
        name: editing.name || '',
        description: editing.description || '',
        price: editing.price ?? '',
        discount_price: editing.discount_price ?? '',
        category_id: editing.category?._id || editing.category || editing.category_id || '',
        brand: editing.brand || '',
        stock: editing.stock ?? 0,
        sku: editing.sku || '',
        requires_prescription: Boolean(editing.requires_prescription),
        active: editing.active !== false,
      });
      setImagePreview(editing.image || '');
      setBatches(editing.batches || []);
      setImageFile(null);
      setMsg('');
      setErr('');
    } else {
      setF({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        category_id: '',
        brand: '',
        stock: 0,
        sku: '',
        requires_prescription: false,
        active: true,
      });
      setImagePreview('');
      setImageFile(null);
      setBatches([]);
      setMsg('');
      setErr('');
    }
  }, [editing]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(editing?.image || '');
    }
  };

  const handleBatchesChange = (newBatches) => {
    setBatches(newBatches);
    const total = newBatches.reduce((sum, b) => sum + (Number(b.stock_qty || b.stock) || 0), 0);
    setF((prev) => ({ ...prev, stock: total }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setErr('');

    const fd = new FormData();
    fd.append('name', f.name.trim());
    fd.append('brand', f.brand.trim());
    fd.append('sku', f.sku.trim());
    fd.append('price', Number(f.price) || 0);
    if (f.discount_price !== '') fd.append('discount_price', Number(f.discount_price));
    if (f.category_id) fd.append('category_id', f.category_id);
    fd.append('description', f.description.trim());
    fd.append('requires_prescription', f.requires_prescription ? 1 : 0);
    fd.append('active', f.active ? 1 : 0);

    const totalStock = batches.length > 0
      ? batches.reduce((sum, b) => sum + (Number(b.stock_qty || b.stock) || 0), 0)
      : (Number(f.stock) || 0);
    fd.append('stock', totalStock);
    fd.append('batches', JSON.stringify(batches));

    if (imageFile) {
      fd.append('image', imageFile);
    } else if (editing?.image) {
      fd.append('image', editing.image);
    }

    try {
      const editId = editing?._id || editing?.id;
      if (editId) {
        await request(`/products/${editId}`, {
          method: 'PUT',
          body: fd,
        });
        setMsg('Product updated successfully');
      } else {
        await request('/products', {
          method: 'POST',
          body: fd,
        });
        setMsg('Product created successfully');
      }
      onDone?.();
    } catch (err) {
      setErr(err.message || 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      {err && <div className="err" style={{ marginBottom: '15px' }}>{err}</div>}
      {msg && <div className="msg" style={{ marginBottom: '15px', color: 'var(--green)', fontWeight: 'bold' }}>{msg}</div>}

      <div className="form-grid">
        <label>
          Product Name *
          <input
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </label>

        <label>
          Brand
          <input
            value={f.brand}
            onChange={(e) => setF({ ...f, brand: e.target.value })}
          />
        </label>

        <label>
          SKU
          <input
            value={f.sku}
            onChange={(e) => setF({ ...f, sku: e.target.value })}
          />
        </label>

        <label>
          Category
          <select
            value={f.category_id}
            onChange={(e) => setF({ ...f, category_id: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Price (Rs.) *
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={f.price}
            onChange={(e) => setF({ ...f, price: e.target.value })}
          />
        </label>

        <label>
          Discount Price (Rs.)
          <input
            type="number"
            min="0"
            step="0.01"
            value={f.discount_price}
            onChange={(e) => setF({ ...f, discount_price: e.target.value })}
          />
        </label>

        <label>
          Aggregate Stock
          <input
            type="number"
            min="0"
            disabled={batches.length > 0}
            value={f.stock}
            onChange={(e) => setF({ ...f, stock: e.target.value })}
          />
        </label>

        <label>
          Product Image (Cloudinary)
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {imagePreview && (
            <div className="image-preview-box">
              <img
                src={imagePreview}
                alt="Preview"
                className="image-preview-thumb"
              />
            </div>
          )}
        </label>

        <div className="wide">
          <label>
            Description
            <textarea
              rows={3}
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <label className="check">
            <input
              type="checkbox"
              checked={f.requires_prescription}
              onChange={(e) => setF({ ...f, requires_prescription: e.target.checked })}
            />
            Requires Prescription (Rx)
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={f.active}
              onChange={(e) => setF({ ...f, active: e.target.checked })}
            />
            Active
          </label>
        </div>
      </div>

      <BatchManager
        batches={batches}
        onChange={handleBatchesChange}
      />

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn-admin" disabled={busy}>
          {busy ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
        </button>
        {editing && (
          <button type="button" className="btn-admin ghost" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
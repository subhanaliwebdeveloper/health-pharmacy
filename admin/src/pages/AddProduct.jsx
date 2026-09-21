import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../services/api';
import BatchManager from '../components/BatchManager';

export default function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    name: '',
    brand: '',
    sku: '',
    price: '',
    discount_price: '',
    category_id: '',
    description: '',
    stock: 0,
    requires_prescription: false,
    active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    request('/categories')
      .then(setCategories)
      .catch((e) => setErr(e.message || 'Failed to load categories'));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview('');
    }
  };

  const handleBatchesChange = (newBatches) => {
    setBatches(newBatches);
    // Auto sync aggregate stock with total batch stock
    const batchTotal = newBatches.reduce(
      (sum, b) => sum + (Number(b.stock_qty || b.stock) || 0),
      0
    );
    setForm((prev) => ({ ...prev, stock: batchTotal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setErr('');

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('brand', form.brand.trim());
    fd.append('sku', form.sku.trim());
    fd.append('price', Number(form.price) || 0);
    if (form.discount_price !== '') {
      fd.append('discount_price', Number(form.discount_price));
    }
    if (form.category_id) {
      fd.append('category_id', form.category_id);
    }
    fd.append('description', form.description.trim());
    fd.append('requires_prescription', form.requires_prescription ? 1 : 0);
    fd.append('active', form.active ? 1 : 0);

    // Compute and append stock
    const totalStock = batches.length > 0
      ? batches.reduce((sum, b) => sum + (Number(b.stock_qty || b.stock) || 0), 0)
      : (Number(form.stock) || 0);
    fd.append('stock', totalStock);

    // Batches
    if (batches.length > 0) {
      fd.append('batches', JSON.stringify(batches));
    }

    // Image: send file if selected, or external URL if entered
    if (imageFile) {
      fd.append('image', imageFile);
    } else if (imagePreview && imagePreview.startsWith('http')) {
      fd.append('image', imagePreview);
    }

    try {
      await request('/products', {
        method: 'POST',
        body: fd,
      });

      setMsg('Product created successfully!');
      setTimeout(() => {
        navigate('/products');
      }, 1000);
    } catch (error) {
      setErr(error.message || 'Failed to create product');
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <small>CATALOG MANAGEMENT</small>
          <h1>Add New Product</h1>
        </div>
        <div>
          <Link to="/products" className="btn-admin ghost">
            ← Back to Products
          </Link>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Product Details & Inventory</h2>
        </div>

        {err && <div className="err" style={{ margin: '15px' }}>{err}</div>}
        {msg && <div className="msg" style={{ margin: '15px', color: 'var(--green)', fontWeight: 'bold' }}>{msg}</div>}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Product Name *
              <input
                required
                type="text"
                placeholder="e.g. Panadol 500mg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label>
              Brand
              <input
                type="text"
                placeholder="e.g. GSK"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </label>

            <label>
              SKU
              <input
                type="text"
                placeholder="e.g. PAN-500"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </label>

            <label>
              Category
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
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
              Retail Price (Rs.) *
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>

            <label>
              Discount Price (Rs.)
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Leave blank if none"
                value={form.discount_price}
                onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
              />
            </label>

            <label>
              Aggregate Stock
              <input
                type="number"
                min="0"
                disabled={batches.length > 0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              {batches.length > 0 && (
                <small style={{ color: 'var(--muted)', display: 'block', marginTop: '3px' }}>
                  Synced automatically from batch stock ({form.stock} units)
                </small>
              )}
            </label>

            <label>
              Product Image (Cloudinary Upload)
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
                  <small style={{ color: 'var(--green)' }}>Image ready for upload</small>
                </div>
              )}
            </label>

            <div className="wide">
              <label>
                Description
                <textarea
                  rows={3}
                  placeholder="Detailed description, indications, dosage..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.requires_prescription}
                  onChange={(e) => setForm({ ...form, requires_prescription: e.target.checked })}
                />
                Requires Prescription (Rx)
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Active (Visible in Catalog)
              </label>
            </div>
          </div>

          {/* Batch & Expiry Management */}
          <BatchManager
            batches={batches}
            onChange={handleBatchesChange}
          />

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn-admin"
              disabled={busy}
            >
              {busy ? 'Creating Product...' : 'Save Product'}
            </button>
            <Link to="/products" className="btn-admin ghost">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </>
  );
}

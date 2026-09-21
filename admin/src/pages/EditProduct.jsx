import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { request } from '../services/api';
import BatchManager from '../components/BatchManager';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const [existingImage, setExistingImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prod] = await Promise.all([
          request('/categories'),
          request(`/products/${id}`),
        ]);

        setCategories(cats || []);
        if (prod) {
          setForm({
            name: prod.name || '',
            brand: prod.brand || '',
            sku: prod.sku || '',
            price: prod.price ?? '',
            discount_price: prod.discount_price ?? '',
            category_id: prod.category?._id || prod.category || prod.category_id || '',
            description: prod.description || '',
            stock: prod.stock ?? 0,
            requires_prescription: Boolean(prod.requires_prescription),
            active: prod.active !== false,
          });

          // Existing image URL from Cloudinary — NEVER prepend API URL!
          setExistingImage(prod.image || '');
          setBatches(prod.batches || []);
        }
      } catch (error) {
        setErr(error.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

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
    // Sync aggregate stock
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

    const totalStock = batches.length > 0
      ? batches.reduce((sum, b) => sum + (Number(b.stock_qty || b.stock) || 0), 0)
      : (Number(form.stock) || 0);
    fd.append('stock', totalStock);

    // Batches
    fd.append('batches', JSON.stringify(batches));

    // Image: new file or preserve existing
    if (imageFile) {
      fd.append('image', imageFile);
    } else if (existingImage) {
      fd.append('image', existingImage);
    }

    try {
      const res = await request(`/products/${id}`, {
        method: 'PUT',
        body: fd,
      });

      setMsg('Product updated successfully!');
      if (res.product?.image) {
        setExistingImage(res.product.image);
        setImageFile(null);
        setImagePreview('');
      }
      setTimeout(() => {
        navigate('/products');
      }, 1000);
    } catch (error) {
      setErr(error.message || 'Failed to update product');
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="muted" style={{ padding: '30px' }}>Loading product details...</p>;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <small>CATALOG MANAGEMENT</small>
          <h1>Edit Product: {form.name}</h1>
        </div>
        <div>
          <Link to="/products" className="btn-admin ghost">
            ← Back to Products
          </Link>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Edit Product Information</h2>
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label>
              Brand
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </label>

            <label>
              SKU
              <input
                type="text"
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
              Product Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="image-preview-box">
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="New preview"
                      className="image-preview-thumb"
                    />
                    <small style={{ color: 'var(--green)', display: 'block' }}>New file selected</small>
                  </div>
                ) : existingImage ? (
                  <div>
                    <img
                      src={existingImage}
                      alt="Current"
                      className="image-preview-thumb"
                    />
                    <small style={{ color: 'var(--muted)', display: 'block' }}>Current image</small>
                  </div>
                ) : (
                  <small style={{ color: 'var(--muted)' }}>No image uploaded</small>
                )}
              </div>
            </label>

            <div className="wide">
              <label>
                Description
                <textarea
                  rows={3}
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
              {busy ? 'Saving Changes...' : 'Update Product'}
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

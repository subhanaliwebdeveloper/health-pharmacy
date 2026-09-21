import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Products() {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [prods, categories] = await Promise.all([
        request('/products/admin/all'),
        request('/categories').catch(() => []),
      ]);
      setRows(prods || []);
      setCats(categories || []);
      setMsg('');
    } catch (e) {
      setMsg(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await request(`/products/${id}`, { method: 'DELETE' });
      setMsg('Product deleted successfully');
      load();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Helper to check for expiring batches (<= 90 days)
  const getBatchWarning = (batches = []) => {
    if (!batches || !batches.length) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (const b of batches) {
      if (!b.expiry_date) continue;
      const days = Math.ceil((new Date(b.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 0) {
        return { label: 'Expired Batch', status: 'expired' };
      }
      if (days <= 90) {
        return { label: `Batch Expiry ${days}d`, status: 'expiring_soon' };
      }
    }
    return null;
  };

  const visible = rows.filter((r) => {
    const matchesSearch =
      !search ||
      (r.name && r.name.toLowerCase().includes(search.toLowerCase())) ||
      (r.brand && r.brand.toLowerCase().includes(search.toLowerCase())) ||
      (r.sku && r.sku.toLowerCase().includes(search.toLowerCase()));

    const categoryId = r.category?._id || r.category || r.category_id;
    const matchesCat = !selectedCategory || String(categoryId) === String(selectedCategory);

    return matchesSearch && matchesCat;
  });

  return (
    <>
      <div className="page-head">
        <div>
          <small>CATALOG MANAGEMENT</small>
          <h1>Products</h1>
        </div>
        <div>
          <Link to="/add-product" className="btn-admin" style={{ display: 'inline-block', textDecoration: 'none' }}>
            + Add New Product
          </Link>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>All Products <span>{rows.length}</span></h2>
        </div>

        <div className="quick-form">
          <input
            placeholder="Search by name, brand or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {cats.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {msg && <div className="msg" style={{ margin: '15px' }}>{msg}</div>}

        {loading ? (
          <p className="muted" style={{ padding: '20px' }}>Loading products catalog...</p>
        ) : (
          <DataTable
            rows={visible}
            columns={[
              {
                key: 'image',
                label: 'Image',
                render: (r) =>
                  r.image ? (
                    <img
                      src={r.image}
                      alt={r.name}
                      style={{
                        width: '38px',
                        height: '38px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>No img</span>
                  ),
              },
              {
                key: 'name',
                label: 'Product',
                render: (r) => (
                  <div>
                    <b>{r.name}</b>
                    <small>{r.brand ? `${r.brand} • ` : ''}SKU: {r.sku || '-'}</small>
                  </div>
                ),
              },
              {
                key: 'category',
                label: 'Category',
                render: (r) => r.category?.name || r.category_name || '-',
              },
              {
                key: 'price',
                label: 'Price',
                render: (r) => (
                  <div>
                    <b>Rs. {r.discount_price ? r.discount_price : r.price}</b>
                    {r.discount_price && (
                      <small style={{ textDecoration: 'line-through' }}>
                        Rs. {r.price}
                      </small>
                    )}
                  </div>
                ),
              },
              {
                key: 'stock',
                label: 'Stock',
                render: (r) => (
                  <span className={r.stock < 10 ? 'low' : ''}>
                    {r.stock} units
                  </span>
                ),
              },
              {
                key: 'batches',
                label: 'Batches',
                render: (r) => {
                  const warn = getBatchWarning(r.batches);
                  const count = r.batches?.length || 0;
                  return (
                    <div>
                      <span>{count} {count === 1 ? 'batch' : 'batches'}</span>
                      {warn && (
                        <div style={{ marginTop: '3px' }}>
                          <StatusBadge status={warn.status} label={warn.label} />
                        </div>
                      )}
                    </div>
                  );
                },
              },
              {
                key: 'requires_prescription',
                label: 'Rx',
                render: (r) => (
                  r.requires_prescription ? (
                    <span className="pill pending" style={{ fontWeight: 'bold' }}>Rx Req</span>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: '10px' }}>OTC</span>
                  )
                ),
              },
              {
                key: 'active',
                label: 'Status',
                render: (r) => (
                  <StatusBadge
                    status={r.active !== false ? 'active' : 'inactive'}
                    label={r.active !== false ? 'Active' : 'Inactive'}
                  />
                ),
              },
              {
                key: '_id',
                label: 'Actions',
                render: (r) => (
                  <div className="row-actions">
                    <Link
                      to={`/edit-product/${r._id || r.id}`}
                      className="approve"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="delete"
                      onClick={() => deleteProduct(r._id || r.id)}
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </section>
    </>
  );
}

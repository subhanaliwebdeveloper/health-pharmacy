import React from "react";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { request } from '../services/api';
import DataTable from '../components/DataTable';
import ProductForm from '../components/ProductForm';

export default function Products() {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => request('/products/admin/all').then(setRows);
  useEffect(() => { load(); request('/categories').then(setCats); }, []);
  useEffect(() => { if (id && rows.length) setEditing(rows.find(r => String(r.id) === String(id)) || null); }, [id, rows]);

  const del = async (id) => {
    if (confirm('Delete this product? This cannot be undone.')) {
      await request(`/products/${id}`, { method: 'DELETE' });
      if (editing?.id === id) setEditing(null);
      load();
    }
  };

  const onDone = () => { setEditing(null); load(); };

  const visible = rows.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || (r.brand || '').toLowerCase().includes(search.toLowerCase()) || (r.sku || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="page-head"><div><small>CATALOG</small><h1>Products</h1></div></div>
      <section className="panel">
        <div className="panel-head"><h2>{editing ? `Edit: ${editing.name}` : 'Add Product'}</h2></div>
        <ProductForm categories={cats} editing={editing} onDone={onDone} onCancelEdit={() => setEditing(null)} />
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>All Products <span>{rows.length}</span></h2>
        </div>
        <div className="quick-form">
          <input placeholder="Search by name, brand or SKU" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <DataTable
          rows={visible}
          columns={[
            { key: 'name', label: 'Product', render: r => <div><b>{r.name}</b><small>{r.brand}</small></div> },
            { key: 'category_name', label: 'Category' },
            { key: 'price', label: 'Price', render: r => `Rs. ${r.price}` },
            { key: 'stock', label: 'Stock', render: r => <span className={r.stock < 10 ? 'low' : ''}>{r.stock}</span> },
            { key: 'requires_prescription', label: 'Rx', render: r => r.requires_prescription ? 'Yes' : 'No' },
            { key: 'active', label: 'Active', render: r => <span className={`pill ${r.active ? 'delivered' : 'cancelled'}`}>{r.active ? 'Yes' : 'No'}</span> },
            { key: 'id', label: 'Actions', render: r => <div className="row-actions"><button className="approve" onClick={() => setEditing(r)}>Edit</button><button className="delete" onClick={() => del(r.id)}>Delete</button></div> }
          ]}
        />
      </section>
    </>
  );
}

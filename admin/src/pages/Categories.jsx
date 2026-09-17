import React, { useEffect, useState } from 'react';
import { request } from '../services/api';
import DataTable from '../components/DataTable';

export default function Categories() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await request('/categories');
        setRows(data);
      } catch (error) {
        console.error('Categories loading error:', error);
        setMsg(error.message || 'Failed to load categories');
      }
    }

    fetchCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await request('/categories');
      setRows(data);
    } catch (error) {
      console.error('Categories loading error:', error);
      setMsg(error.message || 'Failed to load categories');
    }
  }

  async function submit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMsg('Category name is required');
      return;
    }

    setMsg('');

    try {
      const body = JSON.stringify({
        name: name.trim(),
        description: description.trim()
      });

      if (editingId) {
        await request(`/categories/${editingId}`, {
          method: 'PUT',
          body
        });

        setMsg('Category updated successfully');
      } else {
        await request('/categories', {
          method: 'POST',
          body
        });

        setMsg('Category added successfully');
      }

      setName('');
      setDescription('');
      setEditingId(null);

      await loadCategories();
    } catch (error) {
      console.error('Category save error:', error);
      setMsg(error.message || 'Something went wrong');
    }
  }

  function edit(category) {
    setEditingId(category.id);
    setName(category.name || '');
    setDescription(category.description || '');
    setMsg('');
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setDescription('');
    setMsg('');
  }

  async function deleteCategory(id) {
    const confirmed = window.confirm(
      'Delete this category? Products in this category will become uncategorized.'
    );

    if (!confirmed) {
      return;
    }

    try {
      await request(`/categories/${id}`, {
        method: 'DELETE'
      });

      setMsg('Category deleted successfully');
      await loadCategories();
    } catch (error) {
      console.error('Category delete error:', error);
      setMsg(error.message || 'Failed to delete category');
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <small>CATALOG</small>
          <h1>Categories</h1>
        </div>
      </div>

      <section className="panel">
        <form className="quick-form" onSubmit={submit}>
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <button type="submit" className="btn-admin">
            {editingId ? 'Update Category' : 'Add Category'}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn-admin ghost"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          )}

          {msg && <span className="msg">{msg}</span>}
        </form>
      </section>

      <section className="panel">
        <DataTable
          rows={rows}
          columns={[
            {
              key: 'name',
              label: 'Category'
            },
            {
              key: 'description',
              label: 'Description'
            },
            {
              key: 'product_count',
              label: 'Products'
            },
            {
              key: 'id',
              label: 'Actions',
              render: (category) => (
                <div className="row-actions">
                  <button
                    type="button"
                    className="approve"
                    onClick={() => edit(category)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete"
                    onClick={() => deleteCategory(category.id)}
                  >
                    Delete
                  </button>
                </div>
              )
            }
          ]}
        />
      </section>
    </>
  );
}
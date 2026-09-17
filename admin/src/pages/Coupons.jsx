import React, { useEffect, useState } from 'react';
import { request } from '../services/api';
import DataTable from '../components/DataTable';

const empty = {
  code: '',
  type: 'percent',
  value: '',
  expires_at: '',
  active: 1
};

export default function Coupons() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await request('/coupons');
      setRows(data);
    } catch (error) {
      console.error('Coupons loading error:', error);
      setMsg(error.message || 'Failed to load coupons');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      if (editingId) {
        await request(`/coupons/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(f)
        });

        setMsg('Coupon updated successfully');
      } else {
        await request('/coupons', {
          method: 'POST',
          body: JSON.stringify(f)
        });

        setMsg('Coupon created successfully');
      }

      setF({ ...empty });
      setEditingId(null);

      await loadCoupons();
    } catch (error) {
      console.error('Coupon save error:', error);
      setMsg(error.message || 'Something went wrong');
    }
  };

  const edit = (coupon) => {
    setEditingId(coupon.id);

    setF({
      code: coupon.code || '',
      type: coupon.type || 'percent',
      value: coupon.value || '',
      expires_at: coupon.expires_at
        ? coupon.expires_at.slice(0, 16)
        : '',
      active: coupon.active ? 1 : 0
    });

    setMsg('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setF({ ...empty });
    setMsg('');
  };

  const toggleActive = async (coupon) => {
    try {
      await request(`/coupons/${coupon.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...coupon,
          active: coupon.active ? 0 : 1
        })
      });

      await loadCoupons();
    } catch (error) {
      console.error('Coupon status error:', error);
      setMsg(error.message || 'Failed to update coupon');
    }
  };

  const deleteCoupon = async (id) => {
    const confirmed = window.confirm(
      'Delete this coupon?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await request(`/coupons/${id}`, {
        method: 'DELETE'
      });

      await loadCoupons();
      setMsg('Coupon deleted successfully');
    } catch (error) {
      console.error('Coupon delete error:', error);
      setMsg(error.message || 'Failed to delete coupon');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <small>MARKETING</small>
          <h1>Coupons</h1>
        </div>
      </div>

      <section className="panel">
        <form
          className="quick-form"
          onSubmit={submit}
        >
          <input
            type="text"
            placeholder="Code"
            value={f.code}
            onChange={(e) =>
              setF({
                ...f,
                code: e.target.value
              })
            }
            required
          />

          <select
            value={f.type}
            onChange={(e) =>
              setF({
                ...f,
                type: e.target.value
              })
            }
          >
            <option value="percent">
              Percent
            </option>

            <option value="fixed">
              Fixed Rs.
            </option>
          </select>

          <input
            type="number"
            placeholder="Value"
            value={f.value}
            onChange={(e) =>
              setF({
                ...f,
                value: e.target.value
              })
            }
            required
          />

          <input
            type="datetime-local"
            value={f.expires_at}
            onChange={(e) =>
              setF({
                ...f,
                expires_at: e.target.value
              })
            }
          />

          <button
            type="submit"
            className="btn-admin"
          >
            {editingId
              ? 'Update Coupon'
              : 'Create Coupon'}
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

          {msg && (
            <span className="msg">
              {msg}
            </span>
          )}
        </form>
      </section>

      <section className="panel">
        <DataTable
          rows={rows}
          columns={[
            {
              key: 'code',
              label: 'Code'
            },

            {
              key: 'type',
              label: 'Type'
            },

            {
              key: 'value',
              label: 'Value'
            },

            {
              key: 'expires_at',
              label: 'Expires',
              render: (row) =>
                row.expires_at
                  ? new Date(
                      row.expires_at
                    ).toLocaleDateString()
                  : 'Never'
            },

            {
              key: 'active',
              label: 'Active',
              render: (row) => (
                <button
                  type="button"
                  className={
                    row.active
                      ? 'approve'
                      : 'delete'
                  }
                  onClick={() =>
                    toggleActive(row)
                  }
                >
                  {row.active
                    ? 'Active'
                    : 'Inactive'}
                </button>
              )
            },

            {
              key: 'id',
              label: 'Actions',
              render: (row) => (
                <div className="row-actions">
                  <button
                    type="button"
                    className="approve"
                    onClick={() =>
                      edit(row)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete"
                    onClick={() =>
                      deleteCoupon(row.id)
                    }
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
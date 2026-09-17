import React, { useEffect, useState } from 'react';
import { request } from '../services/api';
import DataTable from '../components/DataTable';

export default function Reviews() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');

  const loadReviews = async () => {
    try {
      const data = await request('/reviews');
      setRows(data);
      setMsg('');
    } catch (error) {
      console.error('Reviews loading error:', error);
      setMsg(error.message || 'Failed to load reviews');
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const mod = async (id, approved) => {
    try {
      await request(`/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ approved })
      });

      await loadReviews();
    } catch (error) {
      console.error('Review update error:', error);
      setMsg(error.message || 'Failed to update review');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <small>QUALITY CONTROL</small>
          <h1>Reviews</h1>
        </div>
      </div>

      <section className="panel">
        {msg && (
          <div className="msg">
            {msg}
          </div>
        )}

        <DataTable
          rows={rows}
          columns={[
            {
              key: 'product_name',
              label: 'Product'
            },
            {
              key: 'customer_name',
              label: 'Customer'
            },
            {
              key: 'rating',
              label: 'Rating',
              render: (row) =>
                '★'.repeat(Number(row.rating) || 0)
            },
            {
              key: 'comment',
              label: 'Comment'
            },
            {
              key: 'approved',
              label: 'Action',
              render: (row) => (
                <button
                  type="button"
                  className="approve"
                  onClick={() =>
                    mod(row.id, !row.approved)
                  }
                >
                  {row.approved
                    ? 'Unapprove'
                    : 'Approve'}
                </button>
              )
            }
          ]}
        />
      </section>
    </>
  );
}
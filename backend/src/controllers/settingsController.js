import { pool } from '../config/db.js';

async function ensureRow() {
  const [rows] = await pool.query('SELECT * FROM settings WHERE id=1');
  if (rows.length) return rows[0];
  await pool.query(
    "INSERT INTO settings(id,store_name,support_phone,support_email,address,delivery_fee,free_delivery_threshold) VALUES (1,'Health Pharmacy','+92 300 1234567','support@healthpharmacy.pk','Multan, Punjab, Pakistan',0,0)"
  );
  const [rows2] = await pool.query('SELECT * FROM settings WHERE id=1');
  return rows2[0];
}

export async function get(req, res) {
  res.json(await ensureRow());
}

export async function update(req, res) {
  const { store_name, support_phone, support_email, address, delivery_fee, free_delivery_threshold } = req.body;
  await ensureRow();
  await pool.query(
    'UPDATE settings SET store_name=?,support_phone=?,support_email=?,address=?,delivery_fee=?,free_delivery_threshold=? WHERE id=1',
    [store_name, support_phone, support_email, address, 0, 0]
  );
  res.json(await ensureRow());
}

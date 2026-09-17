import {pool} from '../config/db.js';
export async function all(req,res){const [rows]=await pool.query('SELECT id,name,email,phone,address,city,role,created_at FROM users ORDER BY created_at DESC');res.json(rows)}
export async function one(req,res){const [rows]=await pool.query('SELECT id,name,email,phone,address,city,role,created_at FROM users WHERE id=?',[req.params.id]);if(!rows.length)return res.status(404).json({message:'Customer not found'});res.json(rows[0])}
export async function ordersFor(req,res){const [rows]=await pool.query('SELECT id,order_number,total,status,payment_method,created_at FROM orders WHERE user_id=? ORDER BY created_at DESC',[req.params.id]);res.json(rows)}
export async function updateProfile(req,res){const {name,phone,address,city}=req.body;await pool.query('UPDATE users SET name=?,phone=?,address=?,city=? WHERE id=?',[name,phone,address,city,req.user.id]);res.json({message:'Profile updated'})}

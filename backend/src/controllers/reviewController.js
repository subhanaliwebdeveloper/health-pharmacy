import {pool} from '../config/db.js';
export async function list(req,res){const [r]=await pool.query('SELECT r.*,u.name customer_name,p.name product_name FROM reviews r JOIN users u ON u.id=r.user_id JOIN products p ON p.id=r.product_id ORDER BY r.created_at DESC');res.json(r)}
export async function create(req,res){const {product_id,rating,comment}=req.body;await pool.query('INSERT INTO reviews(user_id,product_id,rating,comment,approved) VALUES(?,?,?,?,0)',[req.user.id,product_id,rating,comment||'']);res.status(201).json({message:'Review submitted for approval'})}
export async function moderate(req,res){await pool.query('UPDATE reviews SET approved=? WHERE id=?',[Number(req.body.approved),req.params.id]);res.json({message:'Review updated'})}

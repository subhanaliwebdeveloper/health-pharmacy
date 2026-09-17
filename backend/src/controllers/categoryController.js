import {pool} from '../config/db.js';
export async function list(req,res){const [rows]=await pool.query('SELECT c.*,COUNT(p.id) product_count FROM categories c LEFT JOIN products p ON p.category_id=c.id AND p.active=1 GROUP BY c.id ORDER BY c.name');res.json(rows)}
export async function create(req,res){const {name,description}=req.body;if(!name)return res.status(400).json({message:'Category name required'});const [r]=await pool.query('INSERT INTO categories(name,description) VALUES(?,?)',[name,description||'']);res.status(201).json({id:r.insertId})}
export async function update(req,res){const {name,description}=req.body;if(!name)return res.status(400).json({message:'Category name required'});await pool.query('UPDATE categories SET name=?,description=? WHERE id=?',[name,description||'',req.params.id]);res.json({message:'Category updated'})}
export async function remove(req,res){await pool.query('DELETE FROM categories WHERE id=?',[req.params.id]);res.json({message:'Category deleted'})}

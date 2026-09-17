import jwt from 'jsonwebtoken'; import {env} from '../config/env.js';
export function protect(req,res,next){const h=req.headers.authorization||''; if(!h.startsWith('Bearer ')) return res.status(401).json({message:'Authentication required'}); try{req.user=jwt.verify(h.slice(7),env.jwt); next()}catch{res.status(401).json({message:'Invalid or expired token'})}}

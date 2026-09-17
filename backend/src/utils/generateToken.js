import jwt from 'jsonwebtoken'; import {env} from '../config/env.js';
export const generateToken=user=>jwt.sign({id:user.id,name:user.name,email:user.email,role:user.role},env.jwt,{expiresIn:'7d'});

import {Router} from 'express';import {methods} from '../controllers/paymentController.js';const r=Router();r.get('/methods',methods);export default r;

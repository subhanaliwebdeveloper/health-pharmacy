import React from "react";
import {useEffect,useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getProduct} from '../../services/productService';
import {useCart} from '../../context/CartContext';
import {formatPrice} from '../../utils/formatPrice';
import Loader from '../common/Loader';

export default function ProductDetails(){
  const {id}=useParams(),[p,setP]=useState(null),[err,setErr]=useState(''),{add}=useCart();
  const navigate = useNavigate();

  useEffect(()=>{getProduct(id).then(setP).catch(e=>setErr(e.message))},[id]);
  if(err)return <div className="empty">{err}</div>;
  if(!p)return <Loader/>;

  const orderNow = () => {
    add(p);
    navigate('/checkout');
  };

  return <div className="detail"><div className="detail-image">💊</div><div className="detail-info"><span className="eyebrow">{p.brand||'HAMDI-Nutraceutical Pharmacy'}</span><h1>{p.name}</h1><div className="stars">★★★★★ <em>(4.5)</em></div><div className="detail-price">{formatPrice(p.discount_price||p.price)} {p.discount_price&&<del>{formatPrice(p.price)}</del>}</div><p>{p.description}</p><div className={p.stock?'in-stock':'out-stock'}>{p.stock?`✓ In Stock (${p.stock})`:'Out of Stock'}</div>{p.requires_prescription&&<div className="rx-warning">Prescription required for this medicine.</div>}<div className="product-action-row"><button className="btn-primary wide-btn" title="Add to Cart" aria-label="Add to Cart" disabled={!p.stock} onClick={()=>add(p)}>🛒</button><button className="btn-primary wide-btn" disabled={!p.stock} onClick={orderNow}>Order Now</button></div><div className="detail-tabs"><b>Description</b><b>Usage</b><b>Side Effects</b><b>Reviews</b></div><p className="muted">Use medicines only as directed on the label or by a qualified healthcare professional.</p></div></div>}


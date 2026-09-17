import React from "react";
import {useEffect,useState} from 'react';import {Link,Navigate} from 'react-router-dom';import {useAuth} from '../context/AuthContext';import {myOrders} from '../services/orderService';import {formatPrice} from '../utils/formatPrice';import {statusLabel} from '../utils/orderStatus';import Loader from '../components/common/Loader';

export default function MyOrders(){
  const {user}=useAuth();
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{if(user)myOrders().then(setRows).finally(()=>setLoading(false));else setLoading(false)},[user]);
  if(!user)return <Navigate to="/login?next=/my-orders"/>;
  if(loading)return <Loader/>;
  return <div className="page">
    <div className="page-title"><span className="eyebrow">ORDER HISTORY</span><h1>My Orders</h1></div>
    <div className="order-list">
      {rows.map(o=>
        <div className="order-card-full" key={o.id}>
          <div className="order-card-head">
            <div>
              <b>{o.order_number}</b>
              <small>{new Date(o.created_at).toLocaleString()}</small>
            </div>
            <span className={`status ${o.status}`}>{statusLabel(o.status)}</span>
          </div>
          <p className="order-items-summary">{o.items_summary || `${o.item_count} item(s)`}</p>
          <div className="order-card-totals">
            <span>Subtotal: <b>{formatPrice(o.subtotal)}</b></span>
            <span>Delivery: <b>{formatPrice(o.delivery_fee)}</b></span>
            <span>Total: <b>{formatPrice(o.total)}</b></span>
          </div>
          <div className="order-card-actions">
            <Link className="btn-outline" to={`/my-orders/${o.id}`}>View Details</Link>
            <Link className="btn-primary" to={`/my-orders/${o.id}`}>Track Order</Link>
          </div>
        </div>
      )}
      {!rows.length && <div className="empty"><h2>No orders yet</h2><p>Your placed orders will show up here.</p><Link className="btn-primary" to="/products">Start Shopping</Link></div>}
    </div>
  </div>;
}

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

export default function Cart() {
  const { items } = useCart();

  return (
    <div className="page">
      <div className="page-title">
        <span className="eyebrow">YOUR SHOPPING BAG</span>
        <h1>Shopping Cart</h1>
      </div>
      {!items.length ? (
        <div className="empty">
          <h2>Your cart is empty</h2>
          <p>Add medicines to your cart to continue.</p>
          <Link className="btn-primary" to="/products">Browse Medicines</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((p) => <CartItem key={p._id} p={p} />)}
          </div>
          <CartSummary />
        </div>
      )}
    </div>
  );
}

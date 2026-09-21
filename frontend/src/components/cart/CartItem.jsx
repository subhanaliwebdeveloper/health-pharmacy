import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';

export default function CartItem({ p }) {
  const { update, remove } = useCart();

  return (
    <div className="cart-item">
      <div className="cart-thumb">
        {p.image && p.image.startsWith('http') ? (
          <img src={p.image} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          <span>💊</span>
        )}
      </div>
      <div>
        <b>{p.name}</b>
        <small>{p.brand}</small>
      </div>
      <strong>{formatPrice(p.discount_price || p.price)}</strong>
      <div className="qty">
        <button onClick={() => update(p._id, p.quantity - 1)}>-</button>
        <span>{p.quantity}</span>
        <button onClick={() => update(p._id, p.quantity + 1)}>+</button>
      </div>
      <strong>{formatPrice((p.discount_price || p.price) * p.quantity)}</strong>
      <button className="remove" onClick={() => remove(p._id)}>×</button>
    </div>
  );
}

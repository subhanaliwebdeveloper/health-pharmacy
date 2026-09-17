import React from "react";
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';

export default function CartSummary() {
  const { total } = useCart();
  const delivery = 0;

  return (
    <aside className="summary">
      <h3>Order Summary</h3>
      <div><span>Subtotal</span><b>{formatPrice(total)}</b></div>
      <div><span>Delivery</span><b>Free</b></div>
      <hr />
      <div className="total"><span>Total</span><b>{formatPrice(total + delivery)}</b></div>
      <Link to="/checkout" className="btn-primary full">Proceed to Checkout</Link>
    </aside>
  );
}

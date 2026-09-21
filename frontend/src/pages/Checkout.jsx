import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { getSettings } from '../services/settingsService';
import AddressForm from '../components/checkout/AddressForm';
import PaymentMethod from '../components/checkout/PaymentMethod';
import OrderSummary from '../components/checkout/OrderSummary';

export default function Checkout() {
  const { user }          = useAuth();
  const { items, total, clear } = useCart();
  const nav               = useNavigate();

  const [address, setAddress]   = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', city: user?.city || '' });
  const [payment, setPayment]   = useState('COD');
  const [coupon, setCoupon]     = useState(null);
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState('');
  const [deliveryFee, setDeliveryFee]           = useState(0);
  const [freeThreshold, setFreeThreshold]       = useState(Infinity);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setDeliveryFee(Number(s.delivery_fee) || 0);
        setFreeThreshold(Number(s.free_delivery_threshold) || Infinity);
      })
      .catch(() => {}); // non-fatal; defaults to free
  }, []);

  if (!user) return <Navigate to="/login?next=/checkout" />;
  if (!items.length) return <Navigate to="/cart" />;

  const appliedDeliveryFee = total >= freeThreshold ? 0 : deliveryFee;

  const submit = async () => {
    if (!address.name || !address.phone || !address.address || !address.city) {
      return setErr('Please complete your delivery address.');
    }
    setBusy(true);
    try {
      const r = await createOrder({
        items: items.map((x) => ({ product_id: x._id, quantity: x.quantity, name: x.name })),
        shippingAddress: address,
        paymentMethod: payment,
        deliveryFee: appliedDeliveryFee,
        couponCode: coupon?.code || '',
      });
      clear();
      nav(`/order-success?order=${r.order_number}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="page-title">
        <span className="eyebrow">SECURE CHECKOUT</span>
        <h1>Checkout</h1>
      </div>
      {err && <div className="error">{err}</div>}
      <div className="checkout-layout">
        <div>
          <AddressForm value={address} onChange={setAddress} />
          <PaymentMethod value={payment} onChange={setPayment} />
        </div>
        <OrderSummary
          subtotal={total}
          delivery={appliedDeliveryFee}
          freeThreshold={freeThreshold}
          coupon={coupon}
          onCoupon={setCoupon}
          submitting={busy}
          onSubmit={submit}
        />
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { formatPrice } from "../../utils/formatPrice";
import { validateCoupon } from "../../services/orderService";

export default function OrderSummary({
  subtotal,
  delivery = 100,
  coupon,
  onCoupon,
  submitting,
  onSubmit,
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal + delivery - discount);

  const apply = async () => {
    if (!code.trim()) return;

    setBusy(true);
    setMsg("");

    try {
      const r = await validateCoupon(code.trim(), subtotal);
      onCoupon(r);
      setMsg(`Coupon "${r.code}" applied.`);
    } catch (e) {
      onCoupon(null);
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    onCoupon(null);
    setCode("");
    setMsg("");
  };

  return (
    <div className="summary">
      <h3>Final Total</h3>

      <div className="coupon-row">
        <input
          type="text"
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={!!coupon}
        />

        {!coupon ? (
          <button
            type="button"
            className="btn-outline"
            onClick={apply}
            disabled={busy}
          >
            {busy ? "..." : "Apply"}
          </button>
        ) : (
          <button
            type="button"
            className="btn-outline"
            onClick={remove}
          >
            Remove
          </button>
        )}
      </div>

      {msg && (
        <small className={coupon ? "notice" : "error-text"}>
          {msg}
        </small>
      )}

      <div className="summary-row">
        <span>Subtotal</span>
        <b>{formatPrice(subtotal)}</b>
      </div>

      <div className="summary-row">
        <span>Delivery</span>
        <b>{delivery === 0 ? "Free" : formatPrice(delivery)}</b>
      </div>

      {discount > 0 && (
        <div className="summary-row">
          <span>Discount</span>
          <b>-{formatPrice(discount)}</b>
        </div>
      )}

      <hr />

      <div className="total">
        <span>Total</span>
        <b>{formatPrice(total)}</b>
      </div>

      <button
        type="button"
        className="btn-primary full"
        disabled={submitting}
        onClick={onSubmit}
      >
        {submitting ? "Placing order..." : "Place Order"}
      </button>
    </div>
  );
}
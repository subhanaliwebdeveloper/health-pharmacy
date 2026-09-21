import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'hp_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /** Key cart items by MongoDB _id string */
  const add = (p) =>
    setItems((prev) => {
      const idx = prev.findIndex((a) => a._id === p._id);
      if (idx < 0) return [...prev, { ...p, quantity: 1 }];
      return prev.map((a, i) =>
        i === idx ? { ...a, quantity: Math.min(a.quantity + 1, a.stock || 99) } : a
      );
    });

  const remove = (_id) => setItems((prev) => prev.filter((a) => a._id !== _id));

  const update = (_id, qty) =>
    setItems((prev) =>
      prev.map((a) =>
        a._id === _id ? { ...a, quantity: Math.max(1, Math.min(Number(qty), a.stock || 99)) } : a
      )
    );

  const clear = () => setItems([]);

  const total = items.reduce((s, p) => s + Number(p.discount_price || p.price) * p.quantity, 0);
  const count = items.reduce((s, p) => s + p.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

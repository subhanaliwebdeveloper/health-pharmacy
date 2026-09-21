import React, { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hp_wishlist') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('hp_wishlist', JSON.stringify(items));
  }, [items]);

  /** Toggle wishlist by MongoDB _id */
  const toggle = (p) =>
    setItems((prev) =>
      prev.some((a) => a._id === p._id)
        ? prev.filter((a) => a._id !== p._id)
        : [...prev, p]
    );

  const isWish = (_id) => items.some((a) => a._id === _id);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWish }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);

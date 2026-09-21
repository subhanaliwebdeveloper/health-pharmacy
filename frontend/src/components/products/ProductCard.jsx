import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/formatPrice';

const PLACEHOLDER = '💊';

export default function ProductCard({ p }) {
  const { add }          = useCart();
  const { toggle, isWish } = useWishlist();
  const navigate         = useNavigate();

  const orderNow = () => { add(p); navigate('/checkout'); };

  // Images are now full Cloudinary secure_urls — no base URL prepending needed
  const imageUrl = p.image && p.image.startsWith('http') ? p.image : null;

  return (
    <article className="product-card">
      <button
        type="button"
        className={`heart ${isWish(p._id) ? 'active' : ''}`}
        onClick={() => toggle(p)}
        aria-label="Add to wishlist"
      >
        ♥
      </button>

      <Link to={`/products/${p._id}`} className="product-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={p.name}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.image-fallback')) {
                const fb = document.createElement('span');
                fb.className = 'image-fallback';
                fb.textContent = PLACEHOLDER;
                parent.appendChild(fb);
              }
            }}
          />
        ) : (
          <span className="image-fallback">{PLACEHOLDER}</span>
        )}
      </Link>

      <div className="product-info">
        <small>{p.brand || 'Health Pharmacy'}</small>
        {p.requires_prescription && <span className="rx">Rx</span>}

        <Link to={`/products/${p._id}`}>
          <h3>{p.name}</h3>
        </Link>

        <div className="stars">★★★★★ <em>(4.5)</em></div>

        <div className="price">
          {formatPrice(p.discount_price || p.price)}
          {p.discount_price && <del>{formatPrice(p.price)}</del>}
        </div>

        <button
          type="button"
          className="add-btn"
          onClick={orderNow}
          disabled={!p.stock}
        >
          {p.stock ? 'Order Now' : 'Out of Stock'}
        </button>
      </div>
    </article>
  );
}
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice } from "../../utils/formatPrice";

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { toggle, isWish } = useWishlist();
  const navigate = useNavigate();

  const orderNow = () => {
    add(p);
    navigate("/checkout");
  };

  const API_BASE = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  ).replace(/\/api\/?$/, "");

  let imageUrl = null;

  if (p.image) {
    if (p.image.startsWith("http")) {
      imageUrl = p.image;
    } else if (p.image.startsWith("/images/")) {
      imageUrl = p.image;
    } else {
      imageUrl =
        API_BASE +
        (p.image.startsWith("/") ? p.image : `/${p.image}`);
    }
  }

  return (
    <article className="product-card">
      <button
        type="button"
        className={`heart ${isWish(p.id) ? "active" : ""}`}
        onClick={() => toggle(p)}
        aria-label="Add to wishlist"
      >
        ♥
      </button>

      <Link to={`/products/${p.id}`} className="product-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={p.name}
            onError={(e) => {
              e.currentTarget.style.display = "none";

              const parent = e.currentTarget.parentElement;

              if (parent && !parent.querySelector(".image-fallback")) {
                const fallback = document.createElement("span");
                fallback.className = "image-fallback";
                fallback.textContent = "💊";
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <span className="image-fallback">💊</span>
        )}
      </Link>

      <div className="product-info">
        <small>{p.brand || "Health Pharmacy"}</small>

        {p.requires_prescription && (
          <span className="rx">Rx</span>
        )}

        <Link to={`/products/${p.id}`}>
          <h3>{p.name}</h3>
        </Link>

        <div className="stars">
          ★★★★★ <em>(4.5)</em>
        </div>

        <div className="price">
          {formatPrice(p.discount_price || p.price)}

          {p.discount_price && (
            <del>{formatPrice(p.price)}</del>
          )}
        </div>

        <button
          type="button"
          className="add-btn"
          onClick={orderNow}
          disabled={!p.stock}
        >
          {p.stock ? "Order Now" : "Out of Stock"}
        </button>
      </div>
    </article>
  );
}
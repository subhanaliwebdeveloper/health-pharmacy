import React from 'react';
import { Link } from 'react-router-dom';

const cats = [
  ['Pain Relief', '💊'],
  ['Vitamins & Supplements', '🍊'],
  ['Cough & Cold', '🧴'],
  ['Diabetes Care', '🩺'],
  ['Skin Care', '🧴'],
  ['Baby Care', '🍼'],
  ['Personal Care', '🧼'],
  ['First Aid', '🩹']
];

export default function Categories() {
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="eyebrow">SHOP BY NEED</span>
          <h2>Popular Categories</h2>
        </div>
        <Link to="/categories">View all →</Link>
      </div>

      <div className="category-row">
        {cats.map(([name, icon]) => (
          <Link
            className="category-card"
            key={name}
            to={`/products?category=${encodeURIComponent(name)}`}
          >
            <span>{icon}</span>
            <b>{name}</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

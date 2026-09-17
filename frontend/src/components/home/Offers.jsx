import React from 'react';
import { Link } from 'react-router-dom';

export default function Offers() {
  return (
    <section className="offer">
      <div>
        <span className="eyebrow">HEALTH SAVINGS</span>
        <h2>Your Health Matters</h2>
        <p>Get genuine medicines and health products at fair prices.</p>
      </div>
      <Link to="/products" className="btn-light">Shop Health Products →</Link>
    </section>
  );
}

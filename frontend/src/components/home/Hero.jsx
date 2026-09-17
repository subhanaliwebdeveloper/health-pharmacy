import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div>
        <span className="eyebrow">ONLINE MEDICINES • BETTER HEALTH</span>
        <h1>
          Healthy Life,<br />
          <strong>Better Care.</strong>
        </h1>
        <p>Quality medicines and healthcare products delivered safely to your doorstep.</p>
        <Link to="/products" className="btn-primary">
          Shop Now <span>→</span>
        </Link>
      </div>
      <div className="hero-art">
        <div className="medicine-bottle">💊</div>
        <div className="hero-circle">❤</div>
      </div>
    </section>
  );
}

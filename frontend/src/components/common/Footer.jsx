import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="brand footer-brand">
            <img
              src="/hamdi-nutraceutical-logo.png"
              alt="HAMDI-Nutraceutical Pharmacy"
              className="footer-brand-logo"
            />
            <span>
              HAMDI-<span>Nutraceutical</span> Pharmacy
              <small>Your trusted online pharmacy</small>
            </span>
          </div>
          <p>Quality medicines and healthcare products delivered to your doorstep.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <Link to="/products">Medicines</Link>
          <Link to="/prescriptions">Prescriptions</Link>
          <Link to="/my-orders">My Orders</Link>
        </div>

        <div>
          <h4>Support</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <span>+92 300 1234567</span>
        </div>

        <div>
          <h4>Safe Shopping</h4>
          <span>✓ Genuine products</span>
          <span>✓ Secure checkout</span>
          <span>✓ Fast delivery</span>
        </div>
      </div>
      <div className="copyright">© 2026 HAMDI-Nutraceutical Pharmacy. All rights reserved.</div>
    </footer>
  );
}

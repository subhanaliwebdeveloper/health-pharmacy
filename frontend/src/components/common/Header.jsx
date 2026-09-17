import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const submitSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate("/products");
      closeMenu();
      return;
    }

    navigate("/products?search=" + encodeURIComponent(value));
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    closeMenu();
  };

  return (
    <>
      {/* =====================================================
          TOP BAR
      ====================================================== */}
      <div className="hp-topbar">
        <div className="hp-topbar-inner">
          <span>🚚 Fast delivery</span>
          <span>✓ Genuine products</span>
          <span>🔒 Secure shopping</span>
        </div>
      </div>

      {/* =====================================================
          MAIN HEADER
      ====================================================== */}
      <header className="hp-header">
        <div className="hp-header-inner">

          {/* LOGO */}
          <Link
            to="/"
            className="hp-brand"
            onClick={closeMenu}
          >
            <span className="hp-brand-icon">✚</span>

            <span className="hp-brand-text">
              Health<span>Pharmacy</span>
              <small>Trusted care, better health</small>
            </span>
          </Link>

          {/* DESKTOP SEARCH */}
          <form
            className="hp-search hp-desktop-search"
            onSubmit={submitSearch}
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines, health products..."
              aria-label="Search products"
            />

            <button type="submit" aria-label="Search">
              🔍
            </button>
          </form>

          {/* HEADER ACTIONS */}
          <div className="hp-actions">

            {/* ACCOUNT */}
            <Link
              to={user ? "/profile" : "/login"}
              className="hp-action"
              onClick={closeMenu}
              title={user ? "Account" : "Login"}
            >
              <span>👤</span>
              <small>{user ? "Account" : "Login"}</small>
            </Link>

            {/* ORDERS - DESKTOP */}
            {user && (
              <Link
                to="/my-orders"
                className="hp-action hp-orders"
                onClick={closeMenu}
                title="My Orders"
              >
                <span>📦</span>
                <small>Orders</small>
              </Link>
            )}

            {/* CART */}
            <Link
              to="/cart"
              className="hp-cart"
              onClick={closeMenu}
              title="Cart"
            >
              <span>🛒</span>

              {count > 0 && (
                <b>{count}</b>
              )}
            </Link>

            {/* THREE LINE MENU */}
            <button
              type="button"
              className="hp-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* ===================================================
            MOBILE SEARCH
        ==================================================== */}
        <div className="hp-mobile-search-wrap">
          <form
            className="hp-search hp-mobile-search"
            onSubmit={submitSearch}
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines, health products..."
              aria-label="Search products"
            />

            <button type="submit" aria-label="Search">
              🔍
            </button>
          </form>
        </div>
      </header>

      {/* =====================================================
          DESKTOP NAVIGATION
      ====================================================== */}
      <nav className="hp-desktop-nav">
        <div className="hp-nav-inner">

          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/products">
            Medicines
          </NavLink>

          <NavLink to="/categories">
            Health
          </NavLink>

          <NavLink to="/products?sort=popularity">
            Offers
          </NavLink>

          <NavLink to="/about">
            About Us
          </NavLink>

          <NavLink to="/contact">
            Contact
          </NavLink>

          {user && (
            <NavLink to="/my-orders">
              Track Orders
            </NavLink>
          )}

          {user && (
            <button
              type="button"
              className="hp-desktop-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}
      {menuOpen && (
        <div
          className="hp-menu-overlay"
          onClick={closeMenu}
        >
          <aside
            className="hp-mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MENU HEADER */}
            <div className="hp-mobile-menu-head">
              <div className="hp-mobile-menu-title">
                <span className="hp-brand-icon">✚</span>

                <strong>
                  Health<span>Pharmacy</span>
                </strong>
              </div>

              <button
                type="button"
                className="hp-close"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            {/* USER AREA */}
            <div className="hp-mobile-user">
              <div className="hp-mobile-user-icon">
                👤
              </div>

              <div>
                <strong>
                  {user ? "Welcome back" : "Welcome"}
                </strong>

                <small>
                  {user
                    ? "Manage your account"
                    : "Login or create your account"}
                </small>
              </div>
            </div>

            {/* MENU LINKS */}
            <div className="hp-mobile-links">

              <NavLink
                to="/"
                end
                onClick={closeMenu}
              >
                <span>🏠</span>
                <span>Home</span>
              </NavLink>

              <NavLink
                to="/products"
                onClick={closeMenu}
              >
                <span>💊</span>
                <span>Medicines</span>
              </NavLink>

              <NavLink
                to="/categories"
                onClick={closeMenu}
              >
                <span>❤️</span>
                <span>Health</span>
              </NavLink>

              <NavLink
                to="/products?sort=popularity"
                onClick={closeMenu}
              >
                <span>🔥</span>
                <span>Offers</span>
              </NavLink>

              <NavLink
                to="/about"
                onClick={closeMenu}
              >
                <span>ℹ️</span>
                <span>About Us</span>
              </NavLink>

              <NavLink
                to="/contact"
                onClick={closeMenu}
              >
                <span>📞</span>
                <span>Contact</span>
              </NavLink>

              {user && (
                <NavLink
                  to="/my-orders"
                  onClick={closeMenu}
                >
                  <span>📦</span>
                  <span>My Orders</span>
                </NavLink>
              )}

              <NavLink
                to="/cart"
                onClick={closeMenu}
              >
                <span>🛒</span>
                <span>Cart</span>

                {count > 0 && (
                  <b className="hp-mobile-cart-count">
                    {count}
                  </b>
                )}
              </NavLink>

              {!user && (
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                >
                  <span>👤</span>
                  <span>Login</span>
                </NavLink>
              )}

              {user && (
                <button
                  type="button"
                  className="hp-mobile-logout"
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
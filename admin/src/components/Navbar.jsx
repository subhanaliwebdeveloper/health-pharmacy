import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();

  return (
    <header className="admin-nav">
      <div className="admin-nav-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
          aria-expanded={sidebarOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <span className="mobile-title">Health Pharmacy</span>
      </div>

      <div className="admin-user">
        <span>👤 {user?.name}</span>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
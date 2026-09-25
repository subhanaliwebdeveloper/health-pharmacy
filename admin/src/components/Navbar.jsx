import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout, role } = useAuth();

  const formatRole = (r) => {
    if (r === 'pharmacist_reviewer') return 'Pharmacist';
    if (r === 'super_admin') return 'Super Admin';
    if (r === 'admin') return 'Admin';
    return r || 'Staff';
  };

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

        <span className="mobile-title">Hadi Nutraceutical Pharmacy</span>
      </div>

      <div className="admin-user">
        <span>👤 {user?.name || 'Administrator'}</span>
        {role && (
          <span className="pill approved" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
            {formatRole(role)}
          </span>
        )}
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
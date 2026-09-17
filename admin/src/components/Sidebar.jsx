import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const links = [
    ["/", "Dashboard", "bi-speedometer2"],
    ["/products", "Products", "bi-capsule"],
    ["/categories", "Categories", "bi-grid"],
    ["/orders", "Orders", "bi-bag-check"],
    ["/customers", "Customers", "bi-people"],
    ["/prescriptions", "Prescriptions", "bi-file-medical"],
    ["/payments", "Payments", "bi-credit-card"],
    ["/delivery", "Delivery", "bi-truck"],
    ["/coupons", "Coupons", "bi-ticket-perforated"],
    ["/reviews", "Reviews", "bi-star"],
    ["/reports", "Reports", "bi-bar-chart"],
    ["/settings", "Settings", "bi-gear"],
  ];

  const handleLinkClick = () => {
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? "sidebar-mobile-open" : ""}`}>
      <div className="admin-brand">
        <span>✚</span>

        <div>
          <b>Health Pharmacy</b>
          <small>Admin Panel</small>
        </div>

        <button
          type="button"
          className="sidebar-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <nav>
        {links.map(([to, name, icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={handleLinkClick}
          >
            <i className={`bi ${icon}`} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
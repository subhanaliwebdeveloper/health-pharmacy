import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { role } = useAuth();

  const allLinks = [
    { to: "/", name: "Dashboard", icon: "bi-speedometer2", roles: ["admin", "super_admin", "pharmacist_reviewer"] },
    { to: "/products", name: "Products", icon: "bi-capsule", roles: ["admin", "super_admin"] },
    { to: "/categories", name: "Categories", icon: "bi-grid", roles: ["admin", "super_admin"] },
    { to: "/orders", name: "Orders", icon: "bi-bag-check", roles: ["admin", "super_admin", "pharmacist_reviewer"] },
    { to: "/customers", name: "Customers", icon: "bi-people", roles: ["admin", "super_admin"] },
    { to: "/prescriptions", name: "Prescriptions", icon: "bi-file-medical", roles: ["admin", "super_admin", "pharmacist_reviewer"] },
    { to: "/payments", name: "Payments", icon: "bi-credit-card", roles: ["admin", "super_admin"] },
    { to: "/delivery", name: "Delivery", icon: "bi-truck", roles: ["admin", "super_admin"] },
    { to: "/coupons", name: "Coupons", icon: "bi-ticket-perforated", roles: ["admin", "super_admin"] },
    { to: "/reviews", name: "Reviews", icon: "bi-star", roles: ["admin", "super_admin"] },
    { to: "/reports", name: "Reports", icon: "bi-bar-chart", roles: ["admin", "super_admin"] },
    { to: "/settings", name: "Settings", icon: "bi-gear", roles: ["admin", "super_admin"] },
  ];

  const permittedLinks = allLinks.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const handleLinkClick = () => {
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? "sidebar-mobile-open" : ""}`}>
      <div className="admin-brand">
         <img
    src="/hamdi.png"
    alt="HADI-Nutraceutical Pharmacy"
    className="admin-brand-logo"
  />

        <div>
          <b>HADI-Nutraceutical Pharmacy</b>
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
        {permittedLinks.map(({ to, name, icon }) => (
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
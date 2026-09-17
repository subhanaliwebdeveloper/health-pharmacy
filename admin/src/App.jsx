import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AdminRoutes from "./routes/AdminRoutes";
import Login from "./pages/Login";

export default function App() {
  const { user, loading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div className="loading-screen">Loading admin...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className={`admin-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
        
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="admin-main">
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <main>
            <AdminRoutes />
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
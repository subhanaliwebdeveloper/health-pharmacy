import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import EditProduct from '../pages/EditProduct';
import Categories from '../pages/Categories';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import Customers from '../pages/Customers';
import Prescriptions from '../pages/Prescriptions';
import Payments from '../pages/Payments';
import Delivery from '../pages/Delivery';
import Coupons from '../pages/Coupons';
import Reviews from '../pages/Reviews';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';

function RoleGuard({ allowedRoles, children }) {
  const { role } = useAuth();
  if (!allowedRoles.includes(role)) {
    return (
      <div style={{ padding: '30px' }}>
        <div className="err">Access Denied: Your account role ({role}) does not have permission to access this section.</div>
      </div>
    );
  }
  return children;
}

const ADMIN_ONLY = ['admin', 'super_admin'];
const ALL_ADMINS = ['admin', 'super_admin', 'pharmacist_reviewer'];

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<RoleGuard allowedRoles={ADMIN_ONLY}><Products /></RoleGuard>} />
      <Route path="/add-product" element={<RoleGuard allowedRoles={ADMIN_ONLY}><AddProduct /></RoleGuard>} />
      <Route path="/edit-product/:id" element={<RoleGuard allowedRoles={ADMIN_ONLY}><EditProduct /></RoleGuard>} />
      <Route path="/categories" element={<RoleGuard allowedRoles={ADMIN_ONLY}><Categories /></RoleGuard>} />
      <Route path="/orders" element={<RoleGuard allowedRoles={ALL_ADMINS}><Orders /></RoleGuard>} />
      <Route path="/order/:id" element={<RoleGuard allowedRoles={ALL_ADMINS}><OrderDetails /></RoleGuard>} />
      <Route path="/customers" element={<RoleGuard allowedRoles={ADMIN_ONLY}><Customers /></RoleGuard>} />
      <Route path="/prescriptions" element={<RoleGuard allowedRoles={ALL_ADMINS}><Prescriptions /></RoleGuard>} />
      <Route path="/payments" element={<RoleGuard allowedRoles={ADMIN_ONLY}><Payments /></RoleGuard>} />
      <Route path="/delivery" element={<RoleGuard allowedRoles={ADMIN_ONLY}><Delivery /></RoleGuard>} />
      <Route path="/coupons" element={<RoleGuard allowedRoles={ADMIN_ONLY}><Coupons /></RoleGuard>} />
      <Route path="/reviews" element={<RoleGuard allowedRoles={ADMIN_ONLY}><Reviews /></RoleGuard>} />
      <Route path="/reports" element={<RoleGuard allowedRoles={ADMIN_ONLY}><Reports /></RoleGuard>} />
      <Route path="/settings" element={<RoleGuard allowedRoles={ADMIN_ONLY}><Settings /></RoleGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

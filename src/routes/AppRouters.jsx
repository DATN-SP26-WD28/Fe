import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
// Layouts
import AdminLayout from '../layouts/AdminLayout'
import ClientLayout from '@/layouts/ClientLayout'
import GuestLayout from '@/layouts/GuestLayout'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import { ADMIN_ALLOWED_ROLES } from '@/shared/utils/authSession'
// Admin pages
import Dashboard from '@/pages/admin/Dashboard'
import CategoryManagement from '@/pages/admin/CategoryManagement'
import DishManagement from '@/pages/admin/DishManagement'
import TableManagement from '@/pages/admin/TableManagement'
import OrderManagement from '@/pages/admin/OrderManagement'
import PaymentAndBill from '@/pages/admin/PaymentAndBill'
import ReviewManagement from '@/pages/admin/ReviewManagement'
import StaffManagement from '@/pages/admin/StaffManagement'
import UserManagement from '@/pages/admin/UserManagement'
// Guest pages
import {
  CallStaffPage,
  CustomerPage,
  OrderDetailPage,
  OrdersPage,
  PaymentPage,
} from '@/pages/guest'
// Client pages
import MenuInterface from '@/pages/Client/MenuInterface'
import Login from '@/pages/Client/Login'
import Register from '@/pages/Client/Register'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Navigate to="login" replace />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        </Route>
        {/* Guest: Khách hàng quét QR */}
        <Route path="/table/:tableId" element={<CustomerPage />} />
        <Route path="/table-order/:tableId" element={<GuestLayout />}>
          <Route path="menu" element={<MenuInterface />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="call-staff" element={<CallStaffPage />} />
        </Route>
        {/* Admin: Quản trị viên */}
        <Route element={<ProtectedRoute allowedRoles={ADMIN_ALLOWED_ROLES} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="dishes" element={<DishManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="payment-and-billing" element={<PaymentAndBill />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="staffs" element={<StaffManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Route>
        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/error/404"
          element={<div className="p-10 text-center">404 - Page not found</div>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes

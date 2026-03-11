import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
// Layouts
import AdminLayout from '../layouts/AdminLayout'
import ClientLayout from '@/layouts/ClientLayout'
import GuestLayout from '@/layouts/GuestLayout'
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
  CartPage,
  CustomerPage,
  MenuPage,
  OrderDetailPage,
  OrdersPage,
  PaymentPage,
} from '@/pages/guest'
// Client pages
import Home from '@/pages/Client/Home'
import MenuInterface from '@/pages/Client/MenuInterface'
import Login from '@/pages/Client/Login'
import Register from '@/pages/Client/Register'
import Contact from '@/pages/Client/Contact'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client: Khách hàng tham khảo trang web */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="select-table" element={<MenuInterface />} />
          <Route path="contact" element={<Contact />} />
          <Route path="profile" element={<div className="p-10 text-center">Profile Coming Soon</div>} />
          <Route path="cart" element={<div className="p-10 text-center">Cart Coming Soon</div>} />
          <Route path="orders" element={<div className="p-10 text-center">Orders Coming Soon</div>} />
        </Route>
        {/* Guest: Khách hàng quét QR */}
        <Route path="/order/:tableId" element={<GuestLayout />}>
          <Route index element={<Navigate to="customer" />} />
          <Route path="customer" element={<CustomerPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="call-staff" element={<CallStaffPage />} />
        </Route>
        {/* Admin: Quản trị viên */}
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
        {/* Authentication routes */}
        <Route path="/auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/error/404" element={<div className="p-10 text-center">404 - Page not found</div>} />
        <Route path="/error/invalid-qr" element={<div className="p-10 text-center">QR Code không hợp lệ</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes

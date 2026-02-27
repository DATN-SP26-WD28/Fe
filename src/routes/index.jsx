import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import AdminLayout from '../layouts/AdminLayout'
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
import ClientLayout from '@/layouts/ClientLayout'
// Client pages
import Home from '@/pages/Client/Home'
import MenuInterface from '@/pages/Client/MenuInterface'
import Login from '@/pages/Client/Login'
import Register from '@/pages/Client/Register'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin layout */}
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

        {/* Client route */}
        <Route
          path='/'
          element={
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#FA4A0C', // Cam Roosta
                  borderRadius: 30,        // Bo góc lớn như thiết kế
                  colorBgContainer: '#EFEEEE', // Màu nền xám nhẹ của Input trong ảnh
                  fontFamily: "'Source Sans Pro', sans-serif",
                },
              }}
            >
              <ClientLayout />
            </ConfigProvider>
          }
        >
          <Route index element={<Home />} />
          <Route path="select-table" element={<MenuInterface />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes

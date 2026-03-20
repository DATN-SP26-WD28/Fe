import React, { useState } from 'react';
import {
  ShoppingCartOutlined,
  HomeOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Badge } from 'antd';
import CartDrawer from '@/pages/guest/CartDrawer';
// 1. Import CartDrawer bạn vừa tách ra

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  // 2. Quản lý trạng thái đóng mở ngay tại Footer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-[100] pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <NavItem icon={<HomeOutlined />} label="Trang chủ" path="/" navigate={navigate} location={location} />
        <NavItem icon={<FileTextOutlined />} label="Đã gọi" path="/orders" navigate={navigate} location={location} />

        {/* 3. Nút Giỏ hàng: Nhấn vào là setIsDrawerOpen(true) */}
        <div
          className="relative -top-5 cursor-pointer group"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Badge count={totalItems} color="#f07f29" size="small" offset={[-2, 5]}>
            <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white active:scale-90 transition-transform">
              <ShoppingCartOutlined className="text-2xl" />
            </div>
          </Badge>
        </div>

        <NavItem icon={<CustomerServiceOutlined />} label="Hỗ trợ" path="/contact" navigate={navigate} location={location} />
        <NavItem icon={<UserOutlined />} label="Cá nhân" path="/profile" navigate={navigate} location={location} />
      </nav>

      {/* 4. Chèn Drawer vào đây, nó sẽ nằm "chờ" sẵn ở Footer */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};

// Component con NavItem
const NavItem = ({ icon, label, path, navigate, location }) => {
  const isActive = location.pathname === path;
  return (
    <div
      onClick={() => navigate(path)}
      className={`flex flex-col items-center gap-1 min-w-[64px] cursor-pointer transition-colors ${isActive ? 'text-orange-500 font-bold' : 'text-gray-400'
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] uppercase font-medium">{label}</span>
    </div>
  );
};

export default Footer;
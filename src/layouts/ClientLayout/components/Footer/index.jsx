import React from 'react';
import { ShoppingCartOutlined, HomeOutlined, FileTextOutlined, CustomerServiceOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const NavItem = ({ icon, label, path }) => {
    const isActive = location.pathname === path;
    return (
      <div 
        onClick={() => navigate(path)}
        className={`flex flex-col items-center gap-1 min-w-[64px] cursor-pointer transition-colors ${isActive ? 'text-red-600' : 'text-gray-400'}`}
      >
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-medium">{label}</span>
      </div>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-50 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <NavItem icon={<HomeOutlined />} label="Trang chủ" path="/" />
      <NavItem icon={<FileTextOutlined />} label="Đã gọi" path="/orders" />
      
      {/* Nút Giỏ hàng nổi bật */}
      <div className="relative -top-5" onClick={() => navigate('/cart')}>
        <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white active:scale-90 transition-transform">
          <ShoppingCartOutlined className="text-2xl" />
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
            0
          </span>
        </div>
      </div>

      <NavItem icon={<CustomerServiceOutlined />} label="Hỗ trợ" path="/support" />
      <NavItem icon={<UserOutlined />} label="Cá nhân" path="/profile" />
    </nav>
  );
};

export default Footer;
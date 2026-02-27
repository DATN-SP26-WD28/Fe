import React from 'react';
import { ShoppingCartOutlined, HomeOutlined, FileTextOutlined, CustomerServiceOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: <HomeOutlined />, label: 'Trang chủ', path: '/' },
  { icon: <FileTextOutlined />, label: 'Đã gọi', path: '/orders' },
  { icon: <CustomerServiceOutlined />, label: 'Hỗ trợ', path: '/support' },
  { icon: <UserOutlined />, label: 'Cá nhân', path: '/profile' },
];

const NavItem = ({ icon, label, path, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 min-w-[56px] transition-colors ${
      isActive ? 'text-brand' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-medium leading-none">{label}</span>
  </button>
);

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-50 pb-safe shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      {NAV_ITEMS.slice(0, 2).map(({ icon, label, path }) => (
        <NavItem
          key={path}
          icon={icon}
          label={label}
          path={path}
          isActive={location.pathname === path}
          onClick={() => navigate(path)}
        />
      ))}

      {/* Cart FAB */}
      <div className="relative -top-5">
        <button
          onClick={() => navigate('/cart')}
          className="w-14 h-14 bg-brand rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-light border-4 border-white active:scale-90 transition-transform"
        >
          <ShoppingCartOutlined className="text-2xl" />
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-brand-dark text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white leading-none">
            0
          </span>
        </button>
      </div>

      {NAV_ITEMS.slice(2).map(({ icon, label, path }) => (
        <NavItem
          key={path}
          icon={icon}
          label={label}
          path={path}
          isActive={location.pathname === path}
          onClick={() => navigate(path)}
        />
      ))}
    </nav>
  );
};

export default Footer;
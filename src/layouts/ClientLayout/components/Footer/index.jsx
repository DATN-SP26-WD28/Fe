import React, { useState } from 'react';
import { ShoppingCartOutlined, HomeOutlined, FileTextOutlined, CustomerServiceOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOrders, setShowOrders] = useState(false);

  const orders = [
    {
      id: 1,
      table: 'Bàn 01',
      items: [
        { name: 'Cơm gà xối mắm', qty: 1, price: 45000 },
        { name: 'Trà đá', qty: 2, price: 5000 },
      ],
    },
    {
      id: 2,
      table: 'Bàn 03',
      items: [
        { name: 'Bún bò Huế', qty: 1, price: 50000 },
        { name: 'Nước suối', qty: 1, price: 8000 },
      ],
    },
  ];

  const formatPrice = (v) => `${v.toLocaleString('vi-VN')}đ`;

  const NavItem = ({ icon, label, path, onClick }) => {
    const isActive = location.pathname === path;
    return (
      <div
        onClick={() => (onClick ? onClick() : navigate(path))}
        className={`flex flex-col items-center gap-1 min-w-[64px] cursor-pointer transition-colors ${isActive ? 'text-red-600' : 'text-gray-400'}`}
      >
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-medium">{label}</span>
      </div>
    );
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-50 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <NavItem icon={<HomeOutlined />} label="Trang chủ" path="/" />
        <NavItem icon={<FileTextOutlined />} label="Đã gọi" path="/orders" onClick={() => setShowOrders(true)} />

        <div className="relative -top-5" onClick={() => navigate('/cart')}>
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white active:scale-90 transition-transform">
            <ShoppingCartOutlined className="text-2xl" />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
              0
            </span>
          </div>
        </div>

        <NavItem icon={<CustomerServiceOutlined />} label="Hỗ trợ" path="/contact" />
        <NavItem icon={<UserOutlined />} label="Cá nhân" path="/profile" />
      </nav>

      {showOrders && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40" onClick={() => setShowOrders(false)}>
          <div className="bg-white w-[640px] max-w-[92%] rounded-lg p-6 shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileTextOutlined /> Lịch sử đơn hàng theo bàn
              </h3>
              <button className="text-gray-400 hover:text-gray-700" onClick={() => setShowOrders(false)}>✕</button>
            </div>

            <div className="divide-y">
              {orders.map((o) => {
                const total = o.items.reduce((s, it) => s + it.price * it.qty, 0);
                return (
                  <div key={o.id} className="py-4">
                    <h4 className="font-medium mb-2">{o.table}</h4>
                    <ul className="text-sm text-gray-600 list-disc pl-5 mb-2">
                      {o.items.map((it, idx) => (
                        <li key={idx} className="mb-1">
                          {it.name} x{it.qty} — {formatPrice(it.price * it.qty)}
                        </li>
                      ))}
                    </ul>
                    <div className="text-sm font-medium">Tổng tiền: {formatPrice(total)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
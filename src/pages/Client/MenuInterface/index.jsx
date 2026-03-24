import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin, Empty, message, Typography, Badge } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

import categoryAPI from '@/configs/category.api';
import dishAPI from '@/configs/dish.api';
import FoodCard from '@/layouts/ClientLayout/components/FoodCard';
import { useCart } from '@/contexts/CartContext';
import Footer from '@/layouts/ClientLayout/components/Footer';
import CartDrawer from '@/pages/guest/CartDrawer';

const { Title } = Typography;

const MenuInterface = () => {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const { addToCart, totalItems, totalPrice } = useCart();

  const [activeTab, setActiveTab] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false); // Vẫn giữ state này cho nút Floating Bar riêng của trang Menu
  const mobilTabRefs = useRef([]);

  const guestName = sessionStorage.getItem('guestName');
  const selectedTable = JSON.parse(sessionStorage.getItem('selectedTable') || '{}');

  useEffect(() => {
    if (!tableId) navigate('/select-table');
    else if (!guestName) navigate(`/table/${tableId}`);
  }, [tableId, guestName, navigate]);

  const { data: categories = [], isLoading: isCatLoading } = useQuery({ queryKey: ['categories'], queryFn: () => categoryAPI.getAll() });
  const { data: dishes = [], isLoading: isDishLoading } = useQuery({ queryKey: ['dishes'], queryFn: () => dishAPI.getAll() });

  const filteredDishes = useMemo(() => {
    if (categories.length === 0 || dishes.length === 0) return [];
    const currentCategoryId = categories[activeTab]?._id;
    return dishes.filter(dish => (dish.category?._id || dish.category) === currentCategoryId);
  }, [dishes, categories, activeTab]);

  if (isCatLoading || isDishLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><Spin size="large" tip="Roosta đang chuẩn bị thực đơn..." /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-orange-500 text-white px-5 py-3 flex justify-between items-center shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] opacity-80 uppercase font-medium">Chào mừng</span>
          <span className="text-sm font-black uppercase">{guestName}</span>
        </div>
        <div className="bg-white/20 px-4 py-1.5 rounded-2xl backdrop-blur-md border border-white/10 text-center">
          <span className="font-black text-sm">BÀN {selectedTable.table_number || '...'}</span>
        </div>
      </div>

      {/* CATEGORY BAR */}
      <nav className="md:hidden sticky top-[56px] z-10 flex overflow-x-auto scrollbar-hide bg-white border-b shadow-sm">
        {categories.map((cat, index) => (
          <button key={cat._id} ref={(el) => (mobilTabRefs.current[index] = el)} onClick={() => setActiveTab(index)} className={`px-5 py-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === index ? 'text-orange-500 border-orange-500' : 'text-gray-400 border-transparent'}`}>
            {cat.name}
          </button>
        ))}
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="mb-6 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-[21/9]">
          <img src={categories[activeTab]?.image} className="w-full h-full object-cover" alt="Banner" />
        </div>

        <div className="flex items-end justify-between mb-6 px-1">
          <Title level={3} className="!m-0 !font-black !uppercase !tracking-tighter italic text-gray-800">{categories[activeTab]?.name}</Title>
          <Badge count={`${filteredDishes.length} món`} color="#f07f29" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDishes.length > 0 ? filteredDishes.map((dish) => (
            <FoodCard key={dish._id} image={dish.image} name={dish.name} description={dish.description} price={(Number(dish.price) || 0).toLocaleString('vi-VN') + 'đ'} onAdd={() => { addToCart(dish); message.success(`Đã thêm ${dish.name}`); }} />
          )) : <div className="col-span-full py-20 text-center"><Empty description="Món ăn đang cập nhật..." /></div>}
        </div>
      </div>

      {/* FLOATING CART BAR (Nút đen xem nhanh của trang Menu) */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92%] md:w-auto md:right-10 md:translate-x-0 z-30 transition-all">
          <button onClick={() => setIsCartOpen(true)} className="w-full md:min-w-[360px] bg-gray-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-2xl active:scale-95 border border-white/5">
            <div className="flex items-center gap-3">
              <Badge count={totalItems} color="#f07f29"><div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center"><ShoppingCartOutlined className="text-lg text-orange-400" /></div></Badge>
              <span className="font-bold text-xs uppercase tracking-widest">Xem nhanh giỏ hàng</span>
            </div>
            <span className="font-black text-xl text-orange-500 italic">{(totalPrice || 0).toLocaleString('vi-VN')}đ</span>
          </button>
        </div>
      )}

      {/* FOOTER & DRAWER */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Footer onOpenCart={() => setIsCartOpen(true)} />
    </div>
  );
};

export default MenuInterface;
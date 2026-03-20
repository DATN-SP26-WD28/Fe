import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Spin, Empty, message, Drawer, List,
  Avatar, Button, Typography, Badge
} from 'antd';
import { PlusOutlined, MinusOutlined, ShoppingCartOutlined } from '@ant-design/icons';

// Import API và Context
import categoryAPI from '@/configs/category.api';
import dishAPI from '@/configs/dish.api';
import FoodCard from '@/layouts/ClientLayout/components/FoodCard';
import { useCart } from '@/contexts/CartContext';

const { Text, Title } = Typography;

const MenuInterface = () => {
  const navigate = useNavigate();
  const { tableId } = useParams();

  // Lấy dữ liệu từ CartContext
  const { cart, addToCart, removeFromCart, totalItems, totalPrice } = useCart();

  // State quản lý UI
  const [activeTab, setActiveTab] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const mobilTabRefs = useRef([]);

  // Thông tin bàn và khách
  const guestName = sessionStorage.getItem('guestName');
  const selectedTable = JSON.parse(sessionStorage.getItem('selectedTable') || '{}');

  // Kiểm tra bảo vệ Route
  useEffect(() => {
    if (!tableId) {
      navigate('/select-table');
    } else if (!guestName) {
      message.info("Vui lòng nhập tên để Roosta phục vụ bạn tốt hơn");
      navigate(`/table/${tableId}`);
    }
  }, [tableId, guestName, navigate]);

  // Fetch dữ liệu từ API
  const { data: categories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  });

  const { data: dishes = [], isLoading: isDishLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => dishAPI.getAll(),
  });

  // Logic lọc món ăn (Sửa lỗi ép kiểu Price tại đây để tránh NaN)
  const filteredDishes = useMemo(() => {
    if (categories.length === 0 || dishes.length === 0) return [];
    const currentCategoryId = categories[activeTab]?._id;
    return dishes.filter(dish => {
      const dishCatId = dish.category?._id || dish.category;
      return dishCatId === currentCategoryId;
    });
  }, [dishes, categories, activeTab]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    mobilTabRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };

  if (isCatLoading || isDishLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spin size="large" tip="Roosta đang chuẩn bị thực đơn..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 bg-orange-500 text-white px-5 py-3 flex justify-between items-center shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] opacity-80 uppercase font-medium">Chào mừng</span>
          <span className="text-sm font-black uppercase">{guestName}</span>
        </div>
        <div className="bg-white/20 px-4 py-1.5 rounded-2xl backdrop-blur-md border border-white/10 text-center">
          <span className="font-black text-sm">BÀN {selectedTable.table_number || '...'}</span>
        </div>
      </div>

      {/* ── CATEGORY BAR (MOBILE) ── */}
      <nav className="md:hidden sticky top-[56px] z-10 flex overflow-x-auto scrollbar-hide bg-white border-b shadow-sm">
        {categories.map((cat, index) => (
          <button
            key={cat._id}
            ref={(el) => (mobilTabRefs.current[index] = el)}
            onClick={() => handleTabChange(index)}
            className={`px-5 py-4 text-xs font-bold whitespace-nowrap transition-all border-b-2
              ${activeTab === index ? 'text-orange-500 border-orange-500' : 'text-gray-400 border-transparent'}`}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 py-4">
        {/* Banner */}
        <div className="mb-6 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-[21/9]">
          <img
            src={categories[activeTab]?.image || "https://media.timeout.com/images/105938459/750/422/image.jpg"}
            className="w-full h-full object-cover"
            alt="Banner"
          />
        </div>

        {/* List Dishes */}
        <div className="flex items-end justify-between mb-6 px-1">
          <Title level={3} className="!m-0 !font-black !uppercase !tracking-tighter italic">
            {categories[activeTab]?.name}
          </Title>
          <Badge count={`${filteredDishes.length} món`} color="#f07f29" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDishes.length > 0 ? (
            filteredDishes.map((dish) => (
              <FoodCard
                key={dish._id}
                image={dish.image}
                name={dish.name}
                description={dish.description}
                // Ép kiểu giá tiền về số trước khi toLocaleString để tránh NaN
                price={(Number(dish.price) || 0).toLocaleString('vi-VN') + 'đ'}
                onAdd={() => {
                  addToCart(dish);
                  message.success(`Đã thêm ${dish.name}`);
                }}
              />
            ))
          ) : (
            <div className="col-span-full py-20"><Empty description="Món ăn đang cập nhật..." /></div>
          )}
        </div>
      </div>

      {/* ── FLOATING CART BAR ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-auto md:right-10 md:translate-x-0 z-30 transition-all">
        <button
          onClick={() => setIsCartOpen(true)}
          className="w-full md:min-w-[360px] bg-gray-900 text-white p-5 rounded-[2rem] flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 border border-white/5"
        >
          <div className="flex items-center gap-4">
            <Badge count={totalItems} offset={[2, 0]} color="#f07f29">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <ShoppingCartOutlined className="text-xl text-orange-400" />
              </div>
            </Badge>
            <div className="text-left">
              <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Giỏ hàng</span>
              <span className="font-bold text-sm">XEM CHI TIẾT</span>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase font-bold">Tạm tính</span>
            <span className="font-black text-2xl text-orange-500 italic">
              {(totalPrice || 0).toLocaleString('vi-VN')}đ
            </span>
          </div>
        </button>
      </div>

      {/* ── DRAWER CHI TIẾT GIỎ HÀNG ── */}
      <Drawer
        title={<div className="flex justify-between items-center"><Title level={4} className="!m-0">Món đã chọn</Title><Text type="secondary">{totalItems} món</Text></div>}
        placement="bottom"
        onClose={() => setIsCartOpen(false)}
        open={isCartOpen}
        height="75%"
        className="rounded-t-[3rem]"
        footer={
          <div className="p-4 bg-gray-50 rounded-t-3xl border-t">
            <div className="flex justify-between items-center mb-6">
              <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs">Tổng cộng thanh toán</Text>
              <Text className="text-3xl font-black text-orange-500 italic">
                {(totalPrice || 0).toLocaleString('vi-VN')}đ
              </Text>
            </div>
            <Button
              type="primary"
              block
              size="large"
              className="h-16 rounded-2xl bg-orange-500 font-black text-lg border-none uppercase tracking-widest shadow-lg shadow-orange-200"
              onClick={() => navigate(`/table-order/${tableId}/payment`)}
            >
              Gửi đơn xuống bếp
            </Button>
          </div>
        }
      >
        {cart.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={cart}
            renderItem={(item) => (
              <List.Item
                className="px-0 py-6"
                actions={[
                  <div key="qty" className="flex items-center bg-gray-100 p-1 rounded-full gap-4">
                    <Button
                      shape="circle"
                      icon={<MinusOutlined />}
                      size="small"
                      onClick={() => removeFromCart(item._id)}
                      className="border-none shadow-sm"
                    />
                    <b className="text-lg w-4 text-center">{item.quantity}</b>
                    <Button
                      shape="circle"
                      type="primary"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => addToCart(item)}
                      className="bg-orange-500 border-none shadow-sm"
                    />
                  </div>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.image} shape="square" size={80} className="rounded-2xl shadow-sm" />}
                  title={<span className="text-lg font-black text-gray-800">{item.name}</span>}
                  description={
                    <span className="text-orange-500 font-bold text-base">
                      {(Number(item.price) * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <Empty description="Bạn chưa chọn món nào" />
            <Button onClick={() => setIsCartOpen(false)} className="mt-4 rounded-full">Tiếp tục chọn món</Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MenuInterface;
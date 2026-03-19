import categoryAPI from '@/configs/category.api';
import dishAPI from '@/configs/dish.api';
import FoodCard from '@/layouts/ClientLayout/components/FoodCard';
import { useQuery } from '@tanstack/react-query';
import { Empty, message, Spin } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';



const MenuInterface = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');
  const tableNum = searchParams.get('tableNum');

  const [activeTab, setActiveTab] = useState(0);
  const mobilTabRefs = useRef([]);

  // 1. Lấy danh sách danh mục (Sử dụng categoryAPI.getAll)
  const { data: categories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  });

  // 2. Lấy danh sách món ăn (Sử dụng dishAPI.getAll)
  const { data: dishes = [], isLoading: isDishLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => dishAPI.getAll(),
  });

  // 3. Logic lọc món ăn theo Category
  const filteredDishes = useMemo(() => {
    if (categories.length === 0 || dishes.length === 0) return [];

    // Lấy ID của category đang chọn dựa trên activeTab
    const currentCategoryId = categories[activeTab]?._id;

    return dishes.filter(dish => {
      // Trường hợp category là object (đã qua mapBackendDishToFrontend)
      if (dish.category && typeof dish.category === 'object') {
        return dish.category._id === currentCategoryId;
      }
      // Trường hợp chỉ có ID
      return dish.category === currentCategoryId;
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
    return <div className="min-h-screen flex items-center justify-center bg-white"><Spin size="large" tip="Đang chuẩn bị thực đơn..." /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-28">
      {/* Header báo số bàn */}
      <div className="sticky top-0 z-20 bg-orange-500 text-white px-4 py-2 flex justify-between items-center shadow-md">
        <span className="text-sm font-bold uppercase">Roosta Restaurant</span>
        <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
          Bàn: <span className="font-bold">{tableNum || 'N/A'}</span>
        </div>
      </div>

      {/* ── Mobile Category Bar ── */}
      <nav className="md:hidden sticky top-[40px] z-10 flex overflow-x-auto scrollbar-hide bg-white border-b border-gray-100 shadow-sm">
        {categories.map((cat, index) => (
          <button
            key={cat._id}
            ref={(el) => (mobilTabRefs.current[index] = el)}
            onClick={() => handleTabChange(index)}
            className={`px-5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2
              ${activeTab === index ? 'text-orange-500 border-orange-500' : 'text-gray-400 border-transparent'}`}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 py-4">
        {/* Banner */}
        <div className="mb-6 rounded-3xl overflow-hidden shadow-lg">
          <img
            src={categories[activeTab]?.image || "https://media.timeout.com/images/105938459/750/422/image.jpg"}
            className="w-full h-32 md:h-60 object-cover"
            alt="Banner"
          />
        </div>

        {/* ── Desktop Category Pills ── */}
        <div className="hidden md:flex gap-3 mb-8">
          {categories.map((cat, index) => (
            <button
              key={cat._id}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all
                ${activeTab === index ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* List Dishes */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
            {categories[activeTab]?.name}
          </h2>
          <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">
            {filteredDishes.length} MÓN
          </span>
        </div>

        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDishes.map((dish) => (
              <FoodCard
                key={dish._id}
                image={dish.image}
                name={dish.name}
                description={dish.description}
                price={dish.price.toLocaleString('vi-VN') + 'đ'}
                onAdd={() => message.success(`Đã thêm ${dish.name} vào giỏ`)}
              />
            ))}
          </div>
        ) : (
          <Empty description="Danh mục này đang được cập nhật..." className="mt-10" />
        )}
      </div>

      {/* ── Floating Cart Bar ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-auto md:right-10 md:translate-x-0 z-30">
        <button
          onClick={() => navigate('/cart')}
          className="w-full md:min-w-[320px] bg-gray-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-2xl active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm">
              0
            </div>
            <span className="font-bold text-sm tracking-tight">XEM GIỎ HÀNG</span>
          </div>
          <span className="font-black text-orange-400 italic">0đ</span>
        </button>
      </div>
    </div>
  );
};

export default MenuInterface;
import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FoodCard from '@/layouts/ClientLayout/components/FoodCard';
import { useCart } from '@/contexts/CartContext';
import categoryAPI from '@/configs/category.api';
import dishAPI from '@/configs/dish.api';
import { formatCurrency } from '@/shared/utils/currency';


const MenuInterface = () => {
  const [activeTab, setActiveTab] = useState(0);
  const mobilTabRefs = useRef([]);
  const { addToCart, openCart } = useCart();

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  });

  const activeCategory = categories[activeTab];

  const { data: dishes = [], isLoading: isDishesLoading } = useQuery({
    queryKey: ['dishes', activeCategory?._id || 'all'],
    queryFn: () => dishAPI.getAll(activeCategory ? { category_id: activeCategory._id } : null),
  });

  const handleAddItem = (dish) => {
    addToCart({
      _id: dish._id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      description: dish.description,
    });
    // Gợi ý: Nếu muốn thêm xong bật giỏ hàng lên luôn thì dùng: openCart();
  };

  return (
    <div className="pb-24"> {/* Thêm padding bottom để không bị thanh Bar che */}
      {/* ── Mobile Tab Bar ── */}
      <nav className="md:hidden sticky top-0 z-20 flex overflow-x-auto bg-white/80 backdrop-blur-md border-b">
        {categories.map((item, index) => (
          <button
            key={item._id}
            ref={(el) => (mobilTabRefs.current[index] = el)}
            onClick={() => setActiveTab(index)}
            className={`px-5 py-4 text-xs whitespace-nowrap transition-all border-b-2 ${activeTab === index ? 'text-[#f07f29] border-[#f07f29] font-bold' : 'text-gray-400 border-transparent'}`}
          >
            {item.name.toUpperCase()}
          </button>
        ))}
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        {/* ── Desktop Category Pills ── */}
        <div className="hidden md:flex gap-3 overflow-x-auto mb-8">
          {categories.map((item, index) => (
            <button
              key={item._id}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${activeTab === index ? 'bg-[#f07f29] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1.5 bg-[#f07f29] rounded-full"></div>
          <h2 className="font-extrabold text-2xl text-gray-800">{categories[activeTab]?.name}</h2>
          <span className="bg-orange-100 text-[#f07f29] px-2 py-0.5 rounded text-xs font-bold">{dishes.length}</span>
        </div>

        {/* Dish Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isDishesLoading ? (
            <div className="col-span-full py-20 text-center text-gray-400">Đang chuẩn bị thực đơn...</div>
          ) : (
            dishes.map((dish) => (
              <FoodCard
                key={dish._id}
                image={dish.image}
                name={dish.name}
                description={dish.description}
                price={formatCurrency(dish.price)}
                onAdd={() => handleAddItem(dish)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuInterface;
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

  // Add "All" category at the beginning
  const categoriesWithAll = [
    { _id: 'all', name: 'All' },
    ...categories,
  ];

  const activeCategory = categoriesWithAll[activeTab];

  const { data: dishes = [], isLoading: isDishesLoading } = useQuery({
    queryKey: ['dishes', activeCategory?._id || 'all'],
    queryFn: () => dishAPI.getAll(activeCategory?._id === 'all' ? null : { category_id: activeCategory?._id }),
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
      <nav className="md:hidden sticky top-0 z-20 flex overflow-x-auto bg-white shadow-sm border-b border-gray-200">
        {categoriesWithAll.map((item, index) => (
          <button
            key={item._id}
            ref={(el) => (mobilTabRefs.current[index] = el)}
            onClick={() => setActiveTab(index)}
            className={`px-6 py-3.5 text-sm whitespace-nowrap transition-all border-b-3 font-medium ${activeTab === index ? 'text-[#f07f29] border-[#f07f29]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
          >
            {item.name}
          </button>
        ))}
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {/* ── Desktop Category Pills ── */}
        <div className="hidden md:flex flex-wrap gap-3 mb-10 pb-6 border-b border-gray-200">
          {categoriesWithAll.map((item, index) => (
            <button
              key={item._id}
              onClick={() => setActiveTab(index)}
              className={`px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === index ? 'bg-[#f07f29] text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-200 hover:scale-105' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#f07f29] hover:text-[#f07f29] hover:shadow-md'}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Heading */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1 bg-gradient-to-b from-[#f07f29] to-orange-400 rounded-full"></div>
              <div>
                <h2 className="font-black text-3xl md:text-4xl text-gray-900">{categoriesWithAll[activeTab]?.name}</h2>
              </div>
            </div>
          </div>
          <span className="bg-gradient-to-r from-orange-100 to-orange-50 text-[#f07f29] px-4 py-2 rounded-full text-sm font-bold border border-orange-200">{dishes.length} items</span>
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
import FoodCard from '@/layouts/ClientLayout/components/FoodCard';
import CartModal from '@/components/CartModal';
import CartSummaryBar from '@/components/CartSummaryBar';
import { parsePrice, formatCurrency } from '@/shared/utils/currency';
import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import categoryAPI from '@/configs/category.api';
import dishAPI from '@/configs/dish.api';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '@/redux/slices/cart.slices';

const MenuInterface = () => {
  const [activeTab, setActiveTab] = useState(0);
  const mobilTabRefs = useRef([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state) => state.cart);

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const categoryNames = (categories && categories.length) ? categories.map((c) => c.name) : [];
  const activeCategory = categories && categories.length ? categories[activeTab] : null;

  const { data: dishes = [], isLoading: isDishesLoading } = useQuery({
    queryKey: ['dishes', activeCategory?._id || 'all'],
    queryFn: () => dishAPI.getAll(activeCategory ? { category_id: activeCategory._id } : null),
    enabled: true,
    staleTime: 1000 * 60 * 2,
  });

  const handleMobileTabChange = (index) => {
    setActiveTab(index);
    mobilTabRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const handleAddItem = (dish) => {
    dispatch(addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      description: dish.description,
    }));
  };

  return (
    <>
      {/* ── Mobile: sticky horizontal tab bar (< md) ── */}
      <nav className="md:hidden sticky top-0 z-10 flex overflow-x-auto scrollbar-hide bg-white border-b border-gray-100 shrink-0">
        {(categoryNames.length ? categoryNames : (isCategoriesLoading ? ['Đang tải...'] : ['Không có danh mục'])).map((item, index) => (
          <button
            key={index}
            ref={(el) => (mobilTabRefs.current[index] = el)}
            onClick={() => handleMobileTabChange(index)}
            className={`px-4 py-3 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors
              ${activeTab === index
                ? 'text-brand border-brand font-semibold'
                : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* ── Main content: fills full width on mobile, centered on md+ ── */}
      <div className="max-w-7xl mx-auto w-full px-3 py-3 md:px-6 md:py-6 lg:px-8 lg:py-8">
        {/* ── Tablet / Desktop: horizontal category pill bar (≥ md) ── */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
          {(categoryNames.length ? categoryNames : (isCategoriesLoading ? ['Đang tải...'] : ['Không có danh mục'])).map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-colors
                ${activeTab === index
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Section heading */}
        <div className="flex items-center justify-between mb-3 md:mb-5">
          <h2 className="font-semibold text-gray-800 text-sm md:text-base lg:text-lg">
            {categoryNames[activeTab] || (isCategoriesLoading ? 'Đang tải...' : 'Danh mục')}
          </h2>
          <span className="text-xs text-gray-400 tabular-nums">{dishes.length} món</span>
        </div>

        {/* ── Dish grid: 1 col → 2 col tablet → 3 col desktop → 4 col wide ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
            {isDishesLoading ? (
              // simple loading placeholders
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-3">
                  <div className="animate-pulse flex gap-3">
                    <div className="bg-gray-200 w-24 h-24 rounded-xl md:w-full md:h-40" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                      <div className="h-6 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              dishes.map((dish) => (
                <FoodCard
                  key={dish._id}
                  image={dish.image}
                  name={dish.name}
                  description={dish.description}
                  price={formatCurrency(dish.price)}
                  onAdd={() => handleAddItem({ id: dish._id, name: dish.name, price: parsePrice(dish.price), image: dish.image, description: dish.description })}
                />
              ))
            )}
        </div>

      </div>

      {/* Cart Summary Bar - Sticky Bottom */}
      <CartSummaryBar
        items={cartItems}
        onClick={() => setIsModalOpen(true)}
      />

      {/* Cart Modal */}
      <CartModal
        items={cartItems}
        isModalOpen={isModalOpen}
        onCloseModal={() => setIsModalOpen(false)}
      />

    </>
  );
};

export default MenuInterface;
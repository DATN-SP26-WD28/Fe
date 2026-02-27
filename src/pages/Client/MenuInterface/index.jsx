import FoodCard from '@/layouts/ClientLayout/components/FoodCard';
import React, { useRef, useState } from 'react';

const CATEGORIES = ['Món đặc sắc', 'Nước lẩu', 'Thịt bò & Cừu', 'Hải sản', 'Rau củ', 'Đồ uống'];

const MOCK_DISHES = [
  {
    id: 1,
    image: 'https://image.cooky.vn/posproduct/g0/27150/s400x400/0c95078d-10cb-44c4-bd99-a4a10853f071.jpeg',
    name: 'Thịt Bò Mỹ Thượng Hạng',
    description: 'Mềm, ngọt, thái lát mỏng phù hợp nhúng lẩu',
    price: '159.000đ',
  },
  {
    id: 2,
    image: 'https://image.cooky.vn/posproduct/g0/27150/s400x400/0c95078d-10cb-44c4-bd99-a4a10853f071.jpeg',
    name: 'Nấm Kim Châm Hàn Quốc',
    description: 'Giòn dai, thơm ngon, bổ dưỡng',
    price: '59.000đ',
  },
  {
    id: 3,
    image: 'https://image.cooky.vn/posproduct/g0/27150/s400x400/0c95078d-10cb-44c4-bd99-a4a10853f071.jpeg',
    name: 'Hải Sản Tươi Sống Mix',
    description: 'Tôm, mực, ngao tươi theo ngày',
    price: '249.000đ',
  },
  {
    id: 4,
    image: 'https://image.cooky.vn/posproduct/g0/27150/s400x400/0c95078d-10cb-44c4-bd99-a4a10853f071.jpeg',
    name: 'Thịt Cừu Úc Nhập Khẩu',
    description: 'Không mùi, ngọt thịt, thái lát vừa ăn',
    price: '199.000đ',
  },
  {
    id: 5,
    image: 'https://image.cooky.vn/posproduct/g0/27150/s400x400/0c95078d-10cb-44c4-bd99-a4a10853f071.jpeg',
    name: 'Đậu Hũ Non Chiên Giòn',
    description: 'Bên ngoài giòn, bên trong mềm mịn',
    price: '49.000đ',
  },
  {
    id: 6,
    image: 'https://image.cooky.vn/posproduct/g0/27150/s400x400/0c95078d-10cb-44c4-bd99-a4a10853f071.jpeg',
    name: 'Nước Lẩu Thái Chua Cay',
    description: 'Chua cay đậm đà, hương vị đặc trưng',
    price: '89.000đ',
  },
];

const MenuInterface = () => {
  const [activeTab, setActiveTab] = useState(0);
  const mobilTabRefs = useRef([]);

  const handleMobileTabChange = (index) => {
    setActiveTab(index);
    mobilTabRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <>
      {/* ── Mobile: sticky horizontal tab bar (< md) ── */}
      <nav className="md:hidden sticky top-0 z-10 flex overflow-x-auto scrollbar-hide bg-white border-b border-gray-100 shrink-0">
        {CATEGORIES.map((item, index) => (
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
      <div className="max-w-[1280px] mx-auto w-full px-3 py-3 md:px-6 md:py-6 lg:px-8 lg:py-8">

        {/* Banner */}
        <div className="mb-4 md:mb-6">
          <img
            src="https://media.timeout.com/images/105938459/750/422/image.jpg"
            alt={`Banner ${CATEGORIES[activeTab]}`}
            className="w-full h-28 md:h-44 lg:h-56 object-cover rounded-2xl"
            loading="lazy"
          />
        </div>

        {/* ── Tablet / Desktop: horizontal category pill bar (≥ md) ── */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
          {CATEGORIES.map((item, index) => (
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
            {CATEGORIES[activeTab]}
          </h2>
          <span className="text-xs text-gray-400 tabular-nums">{MOCK_DISHES.length} món</span>
        </div>

        {/* ── Dish grid: 1 col → 2 col tablet → 3 col desktop → 4 col wide ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          {MOCK_DISHES.map((dish) => (
            <FoodCard
              key={dish.id}
              image={dish.image}
              name={dish.name}
              description={dish.description}
              price={dish.price}
              onAdd={() => {}}
            />
          ))}
        </div>

      </div>
    </>
  );
};

export default MenuInterface;


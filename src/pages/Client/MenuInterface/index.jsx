import FoodCard from '@/layouts/ClientLayout/components/FoodCard';
import React, { useState } from 'react';

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
];

const MenuInterface = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full">
      {/* Category sidebar */}
      <aside className="w-[88px] bg-gray-50 overflow-y-auto scrollbar-hide shrink-0 border-r border-gray-100">
        {CATEGORIES.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveTab(index)}
            className={`py-5 px-2 text-center text-xs font-medium cursor-pointer transition-all select-none
              ${activeTab === index
                ? 'bg-white text-red-600 border-l-2 border-red-600 font-semibold'
                : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* Dish list */}
      <section className="flex-1 overflow-y-auto p-3 bg-white">
        <div className="mb-4">
          <img
            src="https://media.timeout.com/images/105938459/750/422/image.jpg"
            alt={`Banner ${CATEGORIES[activeTab]}`}
            className="w-full h-28 object-cover rounded-2xl"
            loading="lazy"
          />
        </div>

        <h2 className="font-semibold text-gray-800 mb-3 text-sm">{CATEGORIES[activeTab]}</h2>

        <div className="flex flex-col gap-4">
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
      </section>
    </div>
  );
};

export default MenuInterface;
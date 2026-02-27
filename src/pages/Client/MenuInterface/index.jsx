import FoodCard from '@/layouts/ClientLayout/components/FoodCard';
import React, { useState } from 'react';

const categories = ["Món đặc sắc", "Nước lẩu", "Thịt bò & Cừu", "Hải sản", "Rau củ", "Đồ uống"];

const MenuInterface = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex h-full">
      {/* Sidebar danh mục bên trái (giống Hadilao) */}
      <aside className="w-24 bg-gray-100 overflow-y-auto scrollbar-hide shrink-0 border-r">
        {categories.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveTab(index)}
            className={`py-6 px-2 text-center text-xs font-medium cursor-pointer transition-all
              ${activeTab === index ? 'bg-white text-red-600 border-l-4 border-red-600' : 'text-gray-500'}`}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* Danh sách món ăn bên phải */}
      <section className="flex-1 overflow-y-auto p-3 bg-white">
        <div className="mb-4">
          <img
            src="https://media.timeout.com/images/105938459/750/422/image.jpg"
            alt="Banner"
            className="w-full h-32 object-cover rounded-xl shadow-sm"
          />
        </div>

        <h2 className="font-bold text-gray-800 mb-4">{categories[activeTab]}</h2>

        {/* Render danh sách món */}
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <FoodCard key={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default MenuInterface;
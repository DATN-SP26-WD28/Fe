import React from 'react';
import { PlusCircleFilled } from '@ant-design/icons';

const FoodCard = () => {
  return (
    <div className="flex gap-3 p-1 rounded-lg border-b border-gray-50 pb-4">
      <img 
        src="https://images.immediate.co.uk/production/volatile/sites/30/2020/08/hot-pot-7c4826b.jpg" 
        className="w-24 h-24 object-cover rounded-lg shrink-0"
        alt="Food"
      />
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-bold text-sm text-gray-800 line-clamp-1">Thịt Bò Mỹ Thượng Hạng</h3>
          <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 italic">Mềm, ngọt, thái lát mỏng phù hợp nhúng lẩu</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-red-600 font-bold text-sm">159.000đ</span>
          <button className="text-red-600 text-2xl hover:scale-110 transition-transform">
            <PlusCircleFilled />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
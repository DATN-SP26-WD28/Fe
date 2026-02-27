import React from 'react';
import { PlusCircleFilled } from '@ant-design/icons';

const FoodCard = ({ image, name, description, price, onAdd }) => {
  return (
    <div className="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0">
      <img
        src={image}
        className="w-24 h-24 object-cover rounded-xl shrink-0"
        alt={name}
        loading="lazy"
      />
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{name}</h3>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{description}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-red-600 font-bold text-sm">{price}</span>
          <button
            onClick={onAdd}
            aria-label={`Thêm ${name} vào giỏ hàng`}
            className="text-red-600 text-2xl hover:scale-110 active:scale-95 transition-transform"
          >
            <PlusCircleFilled />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
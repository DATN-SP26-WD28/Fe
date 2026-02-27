import React from 'react';
import { PlusCircleFilled } from '@ant-design/icons';

const FoodCard = ({ image, name, description, price, onAdd }) => {
  return (
    <div className={[
      // Mobile: horizontal row with bottom border divider
      'flex gap-3 pb-4 border-b border-gray-100 last:border-b-0',
      // Tablet+: vertical card
      'md:flex-col md:gap-0 md:pb-0 md:border-0',
      'md:rounded-2xl md:overflow-hidden md:bg-white',
      'md:ring-1 md:ring-gray-100',
      'md:shadow-sm md:hover:shadow-md md:transition-shadow md:cursor-pointer',
    ].join(' ')}>
      <img
        src={image}
        className="w-24 h-24 object-cover rounded-xl shrink-0 md:w-full md:h-40 lg:h-44 md:rounded-none"
        alt={name}
        loading="lazy"
      />
      <div className="flex flex-col justify-between flex-1 min-w-0 md:p-3 lg:p-4">
        <div>
          <h3 className="font-semibold text-sm text-gray-800 line-clamp-1 md:text-[15px]">{name}</h3>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{description}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 md:mt-3">
          <span className="text-brand font-bold text-sm md:text-base">{price}</span>
          <button
            onClick={onAdd}
            aria-label={`Thêm ${name} vào giỏ hàng`}
            className="text-brand text-2xl hover:scale-110 active:scale-95 transition-transform"
          >
            <PlusCircleFilled />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;

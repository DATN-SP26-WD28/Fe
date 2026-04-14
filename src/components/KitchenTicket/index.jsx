import { X } from 'lucide-react';
import React from 'react';

const KitchenTicket = ({ tableNumber, orderId, orderTime, items, guestName = '-' }) => {
  const totalAmount = (items || []).reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  return (
    <div id="kitchen-ticket-content" className="p-2 bg-white text-black font-mono leading-relaxed max-w-[400px] mx-auto shadow-sm sm:shadow-none">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black uppercase tracking-[0.1em] mb-1">
          Bàn {tableNumber} - <span className="uppercase font-normal">#{orderId?.slice(-8).toUpperCase()}</span>
        </h2>
      </div>

      {/* Perforation Line */}
      <div className="border-t border-dashed border-black my-4 w-full h-0"></div>

      {/* Info Section */}
      <div className="text-sm space-y-1 mb-6 divide-dashed">
        <div className="flex gap-2">
          <span className="text-gray-500 uppercase">Khách hàng:</span>
          <span className="font-bold">{guestName}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500 uppercase">Ngày:</span>
          <span>{orderTime}</span>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full">
        <thead>
          <tr className="border-y-2 border-black">
            <h1 className="text-2xl font-black uppercase tracking-[0.1em] my-2 text-center">
              Phiếu gọi món
            </h1>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item, index) => (
            <tr key={index} className=" align-top">
              <td className="py-1 pr-2">
                <div className="flex items-baseline gap-1.5 font-bold text-base leading-tight capitalize">{item.quantity} <X size={10} /> {item.dish_id?.dish_name || 'Món không tên'}</div>
                {item.note && <div className="text-base italic text-gray-400 mt-1 pl-2 border-l border-gray-200">- {item.note}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Section */}
      <div className="flex justify-between items-baseline mt-6 pt-3 border-t-2 border-dashed border-black">
        <span className="text-xl font-black uppercase">Tổng cộng:</span>
        <span className="text-xl font-black">{totalAmount.toLocaleString()} <sup className="text-sm font-normal">VNĐ</sup></span>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="mt-6 flex justify-center opacity-10">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="w-4 h-2 bg-gray-300" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitchenTicket;

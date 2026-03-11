import React from 'react'

const CartPage = () => {
  return (
    <div className="p-4 flex flex-col min-h-[calc(100vh-100px)]">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>
      
      <div className="flex-grow italic text-gray-500 text-center py-20">
        Giỏ hàng của bạn đang trống. Hãy quay lại thực đơn để chọn món nhé!
      </div>
      
      <div className="border-t pt-4 mt-auto">
        <div className="flex justify-between items-center mb-4 text-lg">
          <span className="font-medium">Tổng cộng</span>
          <span className="font-bold text-blue-600">0đ</span>
        </div>
        <button 
          disabled
          className="w-full bg-gray-300 text-white py-3 rounded-xl font-bold cursor-not-allowed"
        >
          Đặt món ngay
        </button>
      </div>
    </div>
  )
}

export default CartPage

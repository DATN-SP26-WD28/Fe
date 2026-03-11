import React from 'react'

const OrdersPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đặt món</h1>
      
      <div className="space-y-4">
        {/* Placeholder order item */}
        <div className="border rounded-xl p-4 bg-white shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 transition">
          <div>
            <p className="text-sm text-gray-500">Mã đơn: #ORD12345</p>
            <p className="font-semibold">3 món - 450,000đ</p>
            <p className="text-xs text-blue-500 font-medium">Đang chế biến...</p>
          </div>
          <div className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-sm">
        Chưa có đơn hàng nào được thực hiện tại bàn này.
      </div>
    </div>
  )
}

export default OrdersPage

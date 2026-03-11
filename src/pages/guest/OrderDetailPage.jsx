import React from 'react'
import { useParams } from 'react-router-dom'

const OrderDetailPage = () => {
  const { orderId } = useParams()
  
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-6">
        <button className="p-2 -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Chi tiết đơn hàng #{orderId}</h1>
      </div>

      <div className="bg-white rounded-xl border p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <span className="text-gray-500">Trạng thái</span>
          <span className="font-semibold text-blue-600 uppercase text-sm">Đang chờ xác nhận</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Pizza Phô Mai x1</span>
            <span className="font-medium">150,000đ</span>
          </div>
          <div className="flex justify-between">
            <span>Coca-Cola x2</span>
            <span className="font-medium">40,000đ</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t flex justify-between items-center text-lg">
          <span className="font-bold">Tổng tiền</span>
          <span className="font-bold text-blue-600">190,000đ</span>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm">
        <strong>Lưu ý:</strong> Vui lòng liên hệ nhân viên nếu bạn muốn thay đổi đơn hàng này.
      </div>
    </div>
  )
}

export default OrderDetailPage

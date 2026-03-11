import React from 'react'

const PaymentPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>
      
      <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm">
        <h2 className="font-semibold mb-4 text-gray-700">Tổng kết đơn hàng</h2>
        <div className="flex justify-between mb-2">
          <span>Tổng tiền món</span>
          <span>450,000đ</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Phí phục vụ</span>
          <span>0đ</span>
        </div>
        <div className="flex justify-between pt-2 border-t font-bold text-lg">
          <span>Cần thanh toán</span>
          <span className="text-blue-600">450,000đ</span>
        </div>
      </div>
      
      <h2 className="font-semibold mb-3 text-gray-700">Phương thức thanh toán</h2>
      <div className="space-y-3 mb-8">
        <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-blue-500 transition">
          <input type="radio" name="payment" className="w-4 h-4 text-blue-600" defaultChecked />
          <span className="font-medium">Tiền mặt tại quầy</span>
        </label>
        <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-blue-500 transition">
          <input type="radio" name="payment" className="w-4 h-4 text-blue-600" />
          <span className="font-medium">Chuyển khoản / Ví điện tử</span>
        </label>
      </div>
      
      <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
        Xác nhận thanh toán
      </button>
    </div>
  )
}

export default PaymentPage

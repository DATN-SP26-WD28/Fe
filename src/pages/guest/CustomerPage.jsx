import React from 'react'

const CustomerPage = () => {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Thông tin khách hàng</h1>
      <p className="text-gray-600 mb-6">Vui lòng nhập tên của bạn để bắt đầu đặt món.</p>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên của bạn</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ví dụ: Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Số điện thoại (tùy chọn)</label>
          <input 
            type="tel" 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="0123 456 789"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Tiếp tục
        </button>
      </form>
    </div>
  )
}

export default CustomerPage

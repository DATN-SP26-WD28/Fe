import React from 'react'

const MenuPage = () => {
  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Thực đơn</h1>
        <p className="text-gray-500 text-sm">Chào mừng bạn đến với nhà hàng chúng tôi!</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Placeholder for menu items */}
        <div className="border rounded-xl p-4 flex gap-4 bg-white shadow-sm">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div className="flex-grow">
            <h3 className="font-semibold text-lg">Món ăn mẫu</h3>
            <p className="text-sm text-gray-500 line-clamp-2">Mô tả ngắn gọn về món ăn hấp dẫn này.</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-blue-600 font-bold">150,000đ</span>
              <button className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">+</button>
            </div>
          </div>
        </div>
        <div className="border rounded-xl p-4 flex gap-4 bg-white shadow-sm">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div className="flex-grow">
            <h3 className="font-semibold text-lg">Món ăn mẫu 2</h3>
            <p className="text-sm text-gray-500 line-clamp-2">Mô tả ngắn gọn về món ăn hấp dẫn này.</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-blue-600 font-bold">120,000đ</span>
              <button className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuPage

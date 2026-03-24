import React from 'react'

const CallStaffPage = () => {
  return (
    <div className="p-6 text-center h-[calc(100vh-150px)] flex flex-col justify-center items-center">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">Gọi nhân viên</h1>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">
        Bấm nút bên dưới để thông báo cho nhân viên. Chúng tôi sẽ có mặt ngay lập tức để hỗ trợ bạn!
      </p>
      
      <button className="w-full max-w-sm bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition">
        Gọi ngay hỗ trợ
      </button>
      
      <button className="mt-4 text-gray-500 font-medium">
        Hủy bỏ
      </button>
    </div>
  )
}

export default CallStaffPage

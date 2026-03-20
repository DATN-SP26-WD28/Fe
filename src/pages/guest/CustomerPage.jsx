import React from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
// 1. Thêm useParams để lấy ID bàn từ URL
import { useNavigate, useParams } from 'react-router-dom'

const CustomerPage = () => {
  const navigate = useNavigate()
  // 2. Lấy tableId từ route /table/:tableId
  const { tableId } = useParams()

  const onFinish = (values) => {
    // 3. Lưu thông tin khách vào sessionStorage (dùng trong phiên đặt món này thôi)
    sessionStorage.setItem('guestName', values.name)

    message.success(`Chào mừng ${values.name} đến với Roosta!`)

    // 4. Điều hướng sang trang Menu theo đúng cấu trúc Route GuestLayout bạn đã khai báo
    // Cấu trúc: /table-order/:tableId/menu
    navigate(`/table-order/${tableId}/menu`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-orange-500">
      {/* Background & Overlay */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      <div className="min-h-screen px-4 py-8 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md bg-white rounded-[30px] p-8 shadow-2xl">

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-3xl mx-auto flex items-center justify-center mb-4">
              <img src="/logo-roosta.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Xin chào!</h2>
            <p className="text-gray-500 text-sm mt-1">
              Bạn đang ngồi tại bàn ID: <span className="font-bold text-orange-600">{tableId?.slice(-4)}</span>
            </p>
          </div>

          <Form
            name="customer_form"
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Nhà hàng cần biết tên bạn để phục vụ tốt hơn!' }]}
            >
              <Input
                prefix={<UserOutlined className="text-orange-400" />}
                placeholder="Nhập tên của bạn (Vd: Anh Tuấn)"
                className="rounded-2xl h-14 border-gray-100"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-14 bg-orange-500 hover:bg-orange-600 rounded-2xl border-none font-bold shadow-lg shadow-orange-200 mt-2 uppercase tracking-widest"
            >
              Bắt đầu đặt món
            </Button>
          </Form>

          <p className="text-center text-[10px] text-gray-400 mt-8 uppercase tracking-widest">
            Trải nghiệm ẩm thực thượng hạng tại Roosta
          </p>
        </div>
      </div>
    </div>
  )
}

export default CustomerPage
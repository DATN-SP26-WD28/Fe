import React from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const CustomerPage = () => {
  const navigate = useNavigate()

  const onFinish = (values) => {
    console.log('Customer info:', values)
    try {
      localStorage.setItem('guestName', values.name || '')
      if (values.phone) localStorage.setItem('guestPhone', values.phone)
    } catch (e) {
      console.log(e)
    }
    message.success('Thông tin đã được lưu')
    navigate('/')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: "url('/bg-form-login.jpg')", opacity: 1 }}
        aria-hidden={true}
      />
      <div className="absolute inset-0 bg-black/50" aria-hidden={true} />

      <div className="min-h-screen px-4 py-8 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-lg" style={{ background: 'rgba(255,255,255,0.94)' }}>

        <div className="text-center mb-6">
          <a href="/" className=" rounded-xl mx-auto overflow-hidden flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
            <img src="/logo-roosta.png" alt="Roosta Logo" className="object-contain w-12 h-12 sm:w-16 sm:h-16" />
          </a>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Thông tin khách hàng</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Vui lòng nhập tên để tiếp tục đặt món</p>
        </div>

        <Form
          name="customer_form"
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-300" />}
              placeholder="Tên của bạn"
              className="rounded-xl"
              aria-label="Tên của bạn"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-12 bg-brand hover:bg-brand-dark rounded-xl border-none font-bold shadow-md mt-2"
            >
              Tiếp tục
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  </div>
  )
}

export default CustomerPage

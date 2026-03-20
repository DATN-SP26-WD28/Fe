import React, { useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const CustomerPage = () => {
  const navigate = useNavigate()
  const { tableId } = useParams()
  // Sử dụng hook useForm để điều khiển dữ liệu form từ code
  const [form] = Form.useForm()

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Sửa từ user.name thành user.username cho đúng với ảnh tab Application của bạn
        if (user && user.username) {
          form.setFieldsValue({ name: user.username });
        }
      } catch (error) {
        console.error("Lỗi parse dữ liệu người dùng", error);
      }
    }
  }, [form]);

  const onFinish = (values) => {
    sessionStorage.setItem('guestName', values.name)
    message.success(`Chào mừng ${values.name} đến với Roosta!`)
    navigate(`/table-order/${tableId}/menu`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-orange-500">
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
            form={form} // Kết nối form instance vào đây
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
              Tiếp tục đặt món
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
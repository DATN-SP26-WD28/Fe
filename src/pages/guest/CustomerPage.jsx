import React, { useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const CustomerPage = () => {
  const navigate = useNavigate()
  const { tableId } = useParams()
  const [form] = Form.useForm()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        if (user && (user.username || user.name)) {
          form.setFieldsValue({ name: user.username || user.name })
        }
      } catch (error) {
        console.error('Lỗi parse dữ liệu người dùng', error)
      }
    }
  }, [form])

  const onFinish = (values) => {
    const guestName = values.name.trim()
    sessionStorage.setItem('guestName', guestName)
    message.success(`Chào mừng ${guestName} đến với Roosta!`)
    navigate(`/table-order/${tableId}/menu`)
  }

  const onFinishFailed = () => {
    message.warning('Vui lòng nhập tên hợp lệ để tiếp tục.')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff7ef]">
      <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#ffd9b5] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#ffc489] blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_60px_rgba(118,52,0,0.12)] sm:p-7">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff3e6] ring-1 ring-[#ffe2c4]">
              <img src="/logo-roosta.png" alt="Roosta Logo" className="h-14 w-14 object-contain" />
            </div>
            <h2 className="text-2xl font-extrabold leading-tight text-[#2b1a0f]">
              Chào mừng bạn đến với Roosta
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#7b5b46]">
              Cho chúng tôi biết tên của bạn để nhà hàng phục vụ nhanh hơn và chính xác hơn.
            </p>
          </div>

          <Form
            form={form}
            name="customer_form"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            requiredMark={false}
          >
            <Form.Item
              name="name"
              label={<span className="text-sm font-semibold text-[#5f4331]">Tên khách hàng</span>}
              rules={[
                { required: true, message: 'Nhà hàng cần tên của bạn để phục vụ tốt hơn.' },
                { min: 2, message: 'Tên cần ít nhất 2 ký tự.' },
                {
                  validator: (_, value) => {
                    if (!value || value.trim().length > 0) return Promise.resolve()
                    return Promise.reject(new Error('Tên không được chỉ gồm khoảng trắng.'))
                  },
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-orange-400" />}
                placeholder="Tên của bạn"
                autoComplete="name"
                allowClear
                className="h-12 rounded-xl border-[#f3dbc0] bg-[#fffdfb]"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="mt-1 h-12! rounded-xl border-none! bg-[#f07f29]! text-sm! font-bold! uppercase tracking-wide shadow-[0_10px_24px_rgba(240,127,41,0.35)] transition-all hover:bg-[#cf6a20]!"
            >
              Bắt đầu gọi món
            </Button>

            <p className="mt-4 text-center text-xs leading-relaxed text-[#95715a]">
              Thông tin chỉ được dùng cho quá trình phục vụ tại nhà hàng.
            </p>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default CustomerPage

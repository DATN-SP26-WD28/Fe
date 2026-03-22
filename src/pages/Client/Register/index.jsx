import React from 'react'
import { Form, Input, Button, message } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { registerUser } from '@/configs/user.api'

const Register = () => {
  const navigate = useNavigate()

  // Thiết lập Mutation
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      message.success(data.message || 'Đăng ký thành viên Roosta thành công!')
      navigate('/auth/login')
    },
    onError: (error) => {
      // Lấy message lỗi từ Server trả về (createResponse của bạn)
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại!'
      message.error(errorMsg)
    },
  })

  const onFinish = (values) => {
    mutation.mutate({
      ...values,
      fullname: values.fullname.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    })
  }

  const onFinishFailed = () => {
    message.warning('Vui lòng kiểm tra lại thông tin đăng ký.')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff7ef]">
      <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#ffd9b5] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#ffc489] blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_60px_rgba(118,52,0,0.12)] sm:p-7">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f4d8bb] text-[#8f5c34] transition-colors hover:bg-[#fff2e3]"
            aria-label="Quay lại"
          >
            <ArrowLeftOutlined className="text-base" />
          </button>

          <h2 className="text-2xl font-extrabold leading-tight text-[#2b1a0f] mb-3 text-center">
            Đăng ký thành viên
          </h2>

          <Form
            name="register_form"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            disabled={mutation.isPending}
            requiredMark={false}
          >
            <Form.Item
              name="fullname"
              label={<span className="text-sm font-semibold text-[#5f4331]">Họ và tên</span>}
              rules={[
                { required: true, message: 'Họ tên không được để trống.' },
                { min: 2, message: 'Họ tên cần ít nhất 2 ký tự.' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-orange-400" />}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                allowClear
                className="h-12 rounded-xl border-[#f3dbc0] bg-[#fffdfb]"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="text-sm font-semibold text-[#5f4331]">Số điện thoại</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại.' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có đúng 10 chữ số.' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-orange-400" />}
                placeholder="09xxxxxxxx"
                autoComplete="tel"
                allowClear
                className="h-12 rounded-xl border-[#f3dbc0] bg-[#fffdfb]"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="text-sm font-semibold text-[#5f4331]">Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email.' },
                { type: 'email', message: 'Email không hợp lệ.' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-orange-400" />}
                placeholder="you@example.com"
                autoComplete="email"
                allowClear
                className="h-12 rounded-xl border-[#f3dbc0] bg-[#fffdfb]"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-sm font-semibold text-[#5f4331]">Mật khẩu</span>}
              rules={[
                { required: true, message: 'Vui lòng thiết lập mật khẩu.' },
                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự.' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-orange-400" />}
                placeholder="Nhập mật khẩu"
                autoComplete="new-password"
                className="h-12 rounded-xl border-[#f3dbc0] bg-[#fffdfb]"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              label={
                <span className="text-sm font-semibold text-[#5f4331]">Xác nhận mật khẩu</span>
              }
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve()
                    return Promise.reject(new Error('Mật khẩu xác nhận chưa khớp.'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-orange-400" />}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                className="h-12 rounded-xl border-[#f3dbc0] bg-[#fffdfb]"
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-1">
              <Button
                type="primary"
                htmlType="submit"
                loading={mutation.isPending}
                className="h-12! w-full rounded-xl border-none! bg-[#f07f29]! text-sm! font-bold! uppercase tracking-wide shadow-[0_10px_24px_rgba(240,127,41,0.35)] transition-all hover:bg-[#cf6a20]!"
              >
                {mutation.isPending ? 'Đang xử lý...' : 'Tạo tài khoản'}
              </Button>
            </Form.Item>
          </Form>

          <p className="mt-5 text-center text-sm text-[#7d6654]">
            Đã có tài khoản?{' '}
            <Link to="/auth/login" className="font-bold text-[#cc6b24] hover:text-[#a8561c]">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

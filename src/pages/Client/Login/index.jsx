import React from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { loginUser } from '@/configs/user.api'

const Login = () => {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      const user = res.data.user;

      if (user.status === 'banned') {
        message.error('Tài khoản của bạn đã bị khóa!');
        return; 
      }
      // 1. Lưu Token vào localStorage để dùng cho các API cần Auth (như /me)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      // 2. Chuyển hướng về trang chủ hoặc trang trước đó
      navigate('/admin')
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại!'
      message.error(errorMsg)
    },
  })

  const onFinish = (values) => {
    mutation.mutate({
      email: values.username.trim(),
      password: values.password,
    })
  }

  const onFinishFailed = () => {
    message.warning('Vui lòng kiểm tra lại thông tin đăng nhập.')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff7ef]">
      <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#ffd9b5] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#ffc489] blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_60px_rgba(118,52,0,0.12)] sm:p-7">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f4d8bb] text-[#8f5c34] transition-colors hover:bg-[#fff2e3]"
            aria-label="Quay lại"
          >
            <ArrowLeftOutlined className="text-base" />
          </button>

          <h2 className="text-2xl font-extrabold text-center leading-tight text-[#2b1a0f] mb-3">
            Quản trị viên
          </h2>

          <Form
            name="login_form"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            disabled={mutation.isPending}
            requiredMark={false}
          >
            <Form.Item
              name="username"
              label={<span className="text-sm font-semibold text-[#5f4331]">Email đăng nhập</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email.' },
                { type: 'email', message: 'Email không hợp lệ.' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-orange-400" />}
                placeholder="you@example.com"
                autoComplete="email"
                allowClear
                className="h-12 rounded-xl border-[#f3dbc0] bg-[#fffdfb]"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-sm font-semibold text-[#5f4331]">Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-orange-400" />}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                className="h-12 rounded-xl border-[#f3dbc0] bg-[#fffdfb]"
              />
            </Form.Item>

            {/* <div className="mb-6 flex items-center justify-between gap-3">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-xs text-[#6d5645]">Ghi nhớ tôi</Checkbox>
              </Form.Item>
              <Link
                to="/forgot"
                className="text-xs font-semibold text-[#cc6b24] hover:text-[#a8561c]"
              >
                Quên mật khẩu?
              </Link>
            </div> */}

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={mutation.isPending}
                className="h-12! w-full rounded-xl border-none! bg-[#f07f29]! text-sm! font-bold! uppercase tracking-wide shadow-[0_10px_24px_rgba(240,127,41,0.35)] transition-all hover:bg-[#cf6a20]!"
              >
                {mutation.isPending ? 'Đang kiểm tra...' : 'Đăng nhập'}
              </Button>
            </Form.Item>
          </Form>

          <p className="mt-5 text-center text-sm text-[#7d6654]">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-[#cc6b24] hover:text-[#a8561c]">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

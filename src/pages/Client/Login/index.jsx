import React from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/configs/user.api';

const Login = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      // 1. Lưu Token vào localStorage để dùng cho các API cần Auth (như /me)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      message.success('Mừng bạn trở lại với Roosta!');

      // 2. Chuyển hướng về trang chủ hoặc trang trước đó
      navigate('/');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại!';
      message.error(errorMsg);
    },
  });

  const onFinish = (values) => {
    // values sẽ chứa { email, password } từ Form
    mutation.mutate({
      email: values.username, // Form của bạn đặt tên field là username
      password: values.password
    });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <button onClick={() => navigate(-1)} className="mb-4 text-gray-400">
          <ArrowLeftOutlined className="text-xl" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-md mb-3">
            R
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Mừng bạn trở lại!</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Đăng nhập để tích điểm và nhận ưu đãi từ Roosta</p>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          disabled={mutation.isPending}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-300" />}
              placeholder="Email đăng nhập"
              className="rounded-xl"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-300" />}
              placeholder="Mật khẩu"
              className="rounded-xl"
            />
          </Form.Item>

          <div className="flex justify-between items-center mb-6">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-xs text-gray-500">Ghi nhớ tôi</Checkbox>
            </Form.Item>
            <Link to="/forgot" className="text-xs text-orange-500 font-medium">Quên mật khẩu?</Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 rounded-xl border-none font-bold shadow-md"
            >
              {mutation.isPending ? 'ĐANG KIỂM TRA...' : 'ĐĂNG NHẬP'}
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-sm text-gray-500 mt-2">
          Chưa có tài khoản? <Link to="/auth/register" className="text-orange-500 font-bold">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
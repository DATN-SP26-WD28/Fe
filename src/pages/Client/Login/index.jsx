import React from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log('Success:', values);
    message.success('Đăng nhập thành công!');
    navigate('/'); // Quay lại trang chủ sau khi đăng nhập
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-400"
          aria-label="Quay lại"
        >
          <ArrowLeftOutlined className="text-xl" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand rounded-2xl mx-auto flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-md mb-3">
            R
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Mừng bạn trở lại!</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Đăng nhập để tích điểm và nhận ưu đãi từ Roosta</p>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-300" />}
              placeholder="Tên đăng nhập hoặc Email"
              className="rounded-xl"
              autoComplete="username"
              aria-label="Tên đăng nhập hoặc Email"
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
              autoComplete="current-password"
              aria-label="Mật khẩu"
            />
          </Form.Item>

          <div className="flex justify-between items-center mb-6">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-xs text-gray-500">Ghi nhớ tôi</Checkbox>
            </Form.Item>
            <Link to="/forgot" className="text-xs text-brand font-medium">Quên mật khẩu?</Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-12 bg-brand hover:bg-brand-dark rounded-xl border-none font-bold shadow-md"
            >
              ĐĂNG NHẬP
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-sm text-gray-500 mt-2">
          Chưa có tài khoản? <Link to="/auth/register" className="text-brand font-bold">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
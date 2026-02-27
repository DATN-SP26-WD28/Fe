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
    <div className="min-h-screen bg-white px-6 py-12 flex flex-col">
      {/* Nút quay lại */}
      <button onClick={() => navigate(-1)} className="mb-8 text-gray-400 self-start">
        <ArrowLeftOutlined className="text-xl" />
      </button>

      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-red-600 rounded-3xl mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-red-200 mb-4">
          R
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Mừng bạn trở lại!</h2>
        <p className="text-gray-400 text-sm">Đăng nhập để tích điểm và nhận ưu đãi từ Roosta</p>
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
          <Input prefix={<UserOutlined className="text-gray-300" />} placeholder="Tên đăng nhập hoặc Email" className="rounded-xl" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password prefix={<LockOutlined className="text-gray-300" />} placeholder="Mật khẩu" className="rounded-xl" />
        </Form.Item>

        <div className="flex justify-between items-center mb-6">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox className="text-xs text-gray-500">Ghi nhớ tôi</Checkbox>
          </Form.Item>
          <a className="text-xs text-red-600 font-medium" href="">Quên mật khẩu?</a>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full h-12 bg-red-600 hover:bg-red-700 rounded-xl border-none font-bold shadow-lg shadow-red-200">
            ĐĂNG NHẬP
          </Button>
        </Form.Item>
      </Form>

      <p className="text-center text-sm text-gray-500 mt-auto">
        Chưa có tài khoản? <Link to="/register" className="text-red-600 font-bold">Đăng ký ngay</Link>
      </p>
    </div>
  );
};

export default Login;
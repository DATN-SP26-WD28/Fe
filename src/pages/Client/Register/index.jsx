import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    message.success('Đăng ký thành viên Roosta thành công!');
    navigate('/login');
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

        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Trở thành thành viên</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Nhận ngay 50,000 điểm thưởng khi đăng ký</p>
        </div>

        <Form name="register_form" layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="fullname"
            rules={[{ required: true, message: 'Họ tên không được để trống' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-300" />}
              placeholder="Họ và tên"
              className="rounded-xl"
              autoComplete="name"
              aria-label="Họ và tên"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-300" />}
              placeholder="Số điện thoại"
              className="rounded-xl"
              autoComplete="tel"
              aria-label="Số điện thoại"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-300" />}
              placeholder="Email (Tùy chọn)"
              className="rounded-xl"
              autoComplete="email"
              aria-label="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng thiết lập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-300" />}
              placeholder="Mật khẩu"
              className="rounded-xl"
              autoComplete="new-password"
              aria-label="Mật khẩu"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-300" />}
              placeholder="Xác nhận mật khẩu"
              className="rounded-xl"
              autoComplete="new-password"
              aria-label="Xác nhận mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full h-12 bg-brand hover:bg-brand-dark rounded-xl border-none font-bold shadow-md mt-4">
              TẠO TÀI KHOẢN
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-sm text-gray-500 pb-2">
          Đã có tài khoản? <Link to="/auth/login" className="text-brand font-bold">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
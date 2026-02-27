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
    <div className="min-h-screen bg-white px-6 py-10 flex flex-col overflow-y-auto">
      <button onClick={() => navigate(-1)} className="mb-6 text-gray-400 self-start">
        <ArrowLeftOutlined className="text-xl" />
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Trở thành thành viên</h2>
        <p className="text-gray-400 text-sm">Nhận ngay 50,000 điểm thưởng khi đăng ký</p>
      </div>

      <Form name="register_form" layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          name="fullname"
          rules={[{ required: true, message: 'Họ tên không được để trống' }]}
        >
          <Input prefix={<UserOutlined className="text-gray-300" />} placeholder="Họ và tên" className="rounded-xl" />
        </Form.Item>

        <Form.Item
          name="phone"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
        >
          <Input prefix={<PhoneOutlined className="text-gray-300" />} placeholder="Số điện thoại" className="rounded-xl" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input prefix={<MailOutlined className="text-gray-300" />} placeholder="Email (Tùy chọn)" className="rounded-xl" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng thiết lập mật khẩu' }]}
        >
          <Input.Password prefix={<LockOutlined className="text-gray-300" />} placeholder="Mật khẩu" className="rounded-xl" />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
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
          <Input.Password prefix={<LockOutlined className="text-gray-300" />} placeholder="Xác nhận mật khẩu" className="rounded-xl" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full !h-12 !bg-brand hover:!bg-brand-dark !rounded-xl !border-none !font-bold !shadow-lg !shadow-brand-light mt-4">
            TẠO TÀI KHOẢN
          </Button>
        </Form.Item>
      </Form>

      <p className="text-center text-sm text-gray-500 pb-6">
        Đã có tài khoản? <Link to="/login" className="text-brand font-bold">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default Register;
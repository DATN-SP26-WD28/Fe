import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/configs/user.api';

const Register = () => {
  const navigate = useNavigate();

  // Thiết lập Mutation
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      message.success(data.message || 'Đăng ký thành viên Roosta thành công!');
      navigate('/auth/login');
    },
    onError: (error) => {
      // Lấy message lỗi từ Server trả về (createResponse của bạn)
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại!';
      message.error(errorMsg);
    },
  });

  const onFinish = (values) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
        {/* Nút quay lại */}
        <button onClick={() => navigate(-1)} className="mb-4 text-gray-400">
          <ArrowLeftOutlined className="text-xl" />
        </button>

        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Trở thành thành viên</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Nhận ngay 50,000 điểm thưởng khi đăng ký</p>
        </div>

        <Form
          name="register_form"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          disabled={mutation.isPending} // Khóa form khi đang gửi yêu cầu
        >
          <Form.Item
            name="fullname"
            rules={[{ required: true, message: 'Họ tên không được để trống' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-300" />} placeholder="Họ và tên" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' }
            ]}
          >
            <Input prefix={<PhoneOutlined className="text-gray-300" />} placeholder="Số điện thoại" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-300" />} placeholder="Email" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng thiết lập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-300" />} placeholder="Mật khẩu" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-300" />} placeholder="Xác nhận mật khẩu" className="rounded-xl" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending} // Hiển thị hiệu ứng loading trên nút
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 rounded-xl border-none font-bold shadow-md mt-4"
            >
              {mutation.isPending ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN'}
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-sm text-gray-500 pb-2">
          Đã có tài khoản? <Link to="/login" className="text-orange-500 font-bold">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
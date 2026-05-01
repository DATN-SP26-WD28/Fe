import { DEFAULT_STAFF_ROLE } from '@/shared/constants/app.constants'
import { Form, Input, Modal } from 'antd'

const StaffForm = ({
  isModalOpen,
  handleCancel,
  onFinish,
  editingStaff,
  form,
  confirmLoading,
}) => {

  // Hàm trung gian xử lý dữ liệu trước khi gửi lên Component cha
  const handleInternalSubmit = (values) => {
    const submitData = { ...values };

    // Nếu đang ở mode "Thêm mới" và người dùng không nhập pass -> Gán mặc định
    if (!editingStaff && !submitData.password) {
      submitData.password = '123456';
    }

    // Gọi hàm onFinish gốc truyền từ cha vào
    onFinish(submitData);
  };

  return (
    <Modal
      title={editingStaff ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
      open={isModalOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      okText={editingStaff ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
      destroyOnClose
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleInternalSubmit} // Sử dụng hàm trung gian ở đây
        initialValues={{ role: DEFAULT_STAFF_ROLE }}
        className="mt-4"
      >
        <Form.Item
          label="Tên nhân viên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}
        >
          <Input placeholder="Nhập tên" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        {/* TRƯỜNG PASSWORD MỚI THÊM VÀO */}
        <Form.Item
          label={editingStaff ? "Mật khẩu mới (Tùy chọn)" : "Mật khẩu"}
          name="password"
          extra={
            editingStaff
              ? "Bỏ trống nếu không muốn thay đổi mật khẩu hiện tại của nhân viên."
              : "Nếu để trống, mật khẩu mặc định sẽ được đặt là 123456."
          }
        >
          <Input.Password
            placeholder={editingStaff ? "Nhập mật khẩu mới (nếu muốn đổi)..." : "Mặc định: 123456"}
          />
        </Form.Item>

      </Form>
    </Modal>
  )
}

export default StaffForm
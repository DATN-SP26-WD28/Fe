import { DEFAULT_STAFF_ROLE } from '@/shared/constants/app.constants'
import { Form, Input, Modal, Select } from 'antd'

const StaffForm = ({
  isModalOpen,
  handleCancel,
  onFinish,
  editingStaff,
  form,
  confirmLoading,
}) => {

  const handleInternalSubmit = (values) => {
    const submitData = { ...values };
    // Nếu tạo mới mà để trống pass thì mới gán mặc định
    if (!editingStaff && !submitData.password) {
      submitData.password = '123456';
    }
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
        onFinish={handleInternalSubmit}
        initialValues={{ role: DEFAULT_STAFF_ROLE }}
        className="mt-4"
      >
        <Form.Item
          label="Tên nhân viên"
          name="username" // ĐỔI TỪ name THÀNH username ĐỂ KHỚP VỚI DATABASE
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

        <Form.Item
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
        >
          <Select placeholder="Chọn vai trò">
            <Select.Option value="staff">Quản lý</Select.Option>
            <Select.Option value="customer">Nhân viên</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={editingStaff ? "Mật khẩu mới (Tùy chọn)" : "Mật khẩu"}
          name="password"
          extra={
            editingStaff
              ? "Bỏ trống nếu không muốn thay đổi mật khẩu hiện tại."
              : "Nếu để trống, mật khẩu mặc định sẽ là 123456."
          }
          // CHỈ BẮT BUỘC KHI TẠO MỚI (editingStaff = null)
          rules={[{ required: !editingStaff, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password
            placeholder={editingStaff ? "Nhập mật khẩu mới..." : "Mặc định: 123456"}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default StaffForm
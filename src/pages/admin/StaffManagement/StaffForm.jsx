import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
import { DEFAULT_STAFF_ROLE, STAFF_ROLE_VALUES, toRoleOptions } from '@/shared/constants/app.constants'

const StaffForm = ({
  isModalOpen,
  handleCancel,
  onFinish,
  editingStaff,
  form,
  confirmLoading,
}) => {
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
        onFinish={onFinish}
        initialValues={{ role: DEFAULT_STAFF_ROLE }}
        className="mt-4"
      >
        <Form.Item
          label="Tên nhân viên"
          name="username"
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
          <Select options={toRoleOptions(STAFF_ROLE_VALUES)} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default StaffForm

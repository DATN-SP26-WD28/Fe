import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
import { DEFAULT_USER_ROLE, USER_ROLE_VALUES, toRoleOptions } from '@/shared/constants/app.constants'

const UserForm = ({
  isModalOpen,
  handleCancel,
  onFinish,
  editingUser,
  form,
  confirmLoading,
}) => {
  return (
    <Modal
      title={editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng'}
      open={isModalOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      okText={editingUser ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
      destroyOnClose
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ role: DEFAULT_USER_ROLE }}
        className="mt-4"
      >
        <Form.Item
          label="Tên người dùng"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
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
          <Select options={toRoleOptions(USER_ROLE_VALUES)} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserForm

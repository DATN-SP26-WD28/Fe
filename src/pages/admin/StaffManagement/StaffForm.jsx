import React from 'react'
import { Modal, Form, Input, Select } from 'antd'

const StaffForm = ({
  isModalOpen,
  handleCancel,
  onFinish,
  editingStaff,
  form,
  confirmLoading,
  existingStaff = [],
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
        initialValues={{ role: 'waiter' }}
        className="mt-4"
      >
        <Form.Item
          label="Tên nhân viên"
          name="username"
          rules={[
            { required: true, message: 'Vui lòng nhập tên nhân viên' },
            { min: 3, message: 'Tên nhân viên phải ít nhất 3 ký tự' },
            { max: 50, message: 'Tên nhân viên không được vượt quá 50 ký tự' },
            { pattern: /^[a-zA-Z\s]+$/, message: 'Tên nhân viên chỉ được chứa chữ cái và khoảng trắng' },
          ]}
        >
          <Input placeholder="Nhập tên nhân viên" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
            {
              validator: async (_, value) => {
                if (!value) return Promise.resolve()
                const normalized = value.trim().toLowerCase()
                const conflict = existingStaff.some((staff) => {
                  const existing = staff.email?.trim().toLowerCase()
                  const currentId = editingStaff?._id || editingStaff?.id || editingStaff?.key
                  const staffId = staff._id || staff.id || staff.key
                  return existing === normalized && staffId !== currentId
                })
                if (conflict) return Promise.reject(new Error('Email đã tồn tại'))
                return Promise.resolve()
              }
            },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' },
            {
              validator: async (_, value) => {
                if (!value) return Promise.resolve()
                const normalized = value.trim()
                const conflict = existingStaff.some((staff) => {
                  const existing = staff.phone?.trim()
                  const currentId = editingStaff?._id || editingStaff?.id || editingStaff?.key
                  const staffId = staff._id || staff.id || staff.key
                  return existing === normalized && staffId !== currentId
                })
                if (conflict) return Promise.reject(new Error('Số điện thoại đã tồn tại'))
                return Promise.resolve()
              }
            },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
        >
          <Select
            options={Object.entries({
              admin: { label: 'Quản trị viên' },
              cashier: { label: 'Thu ngân' },
              waiter: { label: 'Phục vụ' },
              chef: { label: 'Nhân viên bếp' },
            }).map(([value, { label }]) => ({
              value,
              label,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default StaffForm

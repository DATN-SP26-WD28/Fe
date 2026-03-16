import React, { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Breadcrumb,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Space,
} from 'antd'
import { Edit, Trash2, Plus } from 'lucide-react'

import usersPlaceholder from '@/data/users.placeholder.json'

const roleLabelMap = {
  admin: { label: 'Quản trị viên', color: 'geekblue' },
  cashier: { label: 'Thu ngân', color: 'green' },
  waiter: { label: 'Phục vụ', color: 'cyan' },
  chef: { label: 'Nhân viên bếp', color: 'orange' },
  customer: { label: 'Khách hàng', color: 'default' },
}

const UserManagement = () => {
  const [users, setUsers] = useState(() => usersPlaceholder)
  const [visibleModal, setVisibleModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  const openCreateModal = () => {
    setEditingUser(null)
    form.resetFields()
    setVisibleModal(true)
  }

  const onEdit = (record) => {
    setEditingUser(record)
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
    })
    setVisibleModal(true)
  }

  const onDelete = (id) => {
    setUsers((prev) => prev.filter((item) => item.key !== id))
  }

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 70,
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const config = roleLabelMap[role] || { label: role || '-', color: 'default' }
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<Edit size={18} />}
            onClick={() => onEdit(record)}
            title="Sửa"
          />
          <Popconfirm
            title="Xác nhận xóa người dùng này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => onDelete(record.key)}
          >
            <Button type="text" icon={<Trash2 size={18} />} title="Xóa" className="text-red-500" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleOk = async () => {
    const values = await form.validateFields()

    if (editingUser) {
      setUsers((prev) =>
        prev.map((item) => (item.key === editingUser.key ? { ...item, ...values } : item))
      )
    } else {
      setUsers((prev) => [
        ...prev,
        {
          key: `${Date.now()}`,
          ...values,
        },
      ])
    }

    setVisibleModal(false)
    setEditingUser(null)
    form.resetFields()
  }

  const handleCancel = () => {
    setVisibleModal(false)
    setEditingUser(null)
    form.resetFields()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <section>
          <h1 className="font-bold text-3xl mb-2">Quản lý người dùng</h1>
          <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý người dùng' }]} />
        </section>

        <Button type="primary" icon={<Plus size={16} />} onClick={openCreateModal}>
          Thêm người dùng
        </Button>
      </div>

      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Danh sách người dùng">
        <Table
          columns={columns}
          dataSource={users}
          pagination={{ pageSize: 7 }}
          className="rounded-xl"
        />
      </Card>

      <Modal
        title={editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng'}
        open={visibleModal}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ role: 'customer' }}>
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
            <Select options={Object.entries(roleLabelMap).map(([value, { label }]) => ({
              value,
              label,
            }))} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default UserManagement

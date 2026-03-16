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

import staffPlaceholder from '@/data/staff.placeholder.json'

const roleLabelMap = {
  admin: { label: 'Quản trị viên', color: 'geekblue' },
  cashier: { label: 'Thu ngân', color: 'green' },
  waiter: { label: 'Phục vụ', color: 'cyan' },
  chef: { label: 'Nhân viên bếp', color: 'orange' },
}

const StaffManagement = () => {
  const [staffList, setStaffList] = useState(() => staffPlaceholder)
  const [visibleModal, setVisibleModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [form] = Form.useForm()

  const openCreateModal = () => {
    setEditingStaff(null)
    form.resetFields()
    setVisibleModal(true)
  }

  const onEdit = (record) => {
    setEditingStaff(record)
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
    })
    setVisibleModal(true)
  }

  const onDelete = (key) => {
    setStaffList((prev) => prev.filter((item) => item.key !== key))
  }

  const handleOk = async () => {
    const values = await form.validateFields()

    if (editingStaff) {
      setStaffList((prev) =>
        prev.map((item) => (item.key === editingStaff.key ? { ...item, ...values } : item))
      )
    } else {
      setStaffList((prev) => [
        ...prev,
        {
          key: `${Date.now()}`,
          ...values,
        },
      ])
    }

    setVisibleModal(false)
    setEditingStaff(null)
    form.resetFields()
  }

  const handleCancel = () => {
    setVisibleModal(false)
    setEditingStaff(null)
    form.resetFields()
  }

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 70,
    },
    {
      title: 'Tên nhân viên',
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
            title="Xác nhận xóa nhân viên này?"
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

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <section>
          <h1 className="font-bold text-3xl mb-2">Quản lý nhân viên</h1>
          <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý nhân viên' }]} />
        </section>

        <Button type="primary" icon={<Plus size={16} />} onClick={openCreateModal}>
          Thêm nhân viên
        </Button>
      </div>

      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Danh sách nhân viên">
        <Table
          columns={columns}
          dataSource={staffList}
          pagination={{ pageSize: 7 }}
          className="rounded-xl"
        />
      </Card>

      <Modal
        title={editingStaff ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
        open={visibleModal}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ role: 'waiter' }}>
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

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              options={Object.entries(roleLabelMap).map(([value, { label }]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default StaffManagement

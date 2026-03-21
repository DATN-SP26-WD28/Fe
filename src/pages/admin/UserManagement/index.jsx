import React, { useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, Form, Popconfirm, Space, message } from 'antd'
import { Edit, Trash2, Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUsers, deleteUser, createUser, updateUser } from '@/configs/user.api'
import UserForm from './UserForm'

const roleLabelMap = {
  admin: { label: 'Quản trị viên', color: 'geekblue' },
  cashier: { label: 'Thu ngân', color: 'green' },
  waiter: { label: 'Phục vụ', color: 'cyan' },
  chef: { label: 'Nhân viên bếp', color: 'orange' },
  customer: { label: 'Khách hàng', color: 'default' },
}

const UserManagement = () => {
  const queryClient = useQueryClient()
  const [visibleModal, setVisibleModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      message.success('Thêm người dùng thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err) => {
      const errorMsg = err?.response?.data?.message || err?.message || 'Tạo người dùng thất bại'
      message.error(errorMsg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      message.success('Cập nhật người dùng thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err) => {
      const errorMsg = err?.response?.data?.message || err?.message || 'Cập nhật thất bại'
      message.error(errorMsg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      message.success('Xóa người dùng thành công')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err) => {
      const errorMsg = err?.response?.data?.message || err?.message || 'Xóa thất bại'
      message.error(errorMsg)
    },
  })

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

  const onDelete = (record) => {
    deleteMutation.mutate(record.id)
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
            onConfirm={() => onDelete(record)}
          >
            <Button type="text" icon={<Trash2 size={18} />} title="Xóa" className="text-red-500" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const onFinish = (values) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: values })
    } else {
      createMutation.mutate(values)
    }
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
          rowKey={(record) => record.key ?? record.id}
          loading={isLoading}
          pagination={{ pageSize: 7 }}
          className="rounded-xl"
        />
      </Card>

      <UserForm
        isModalOpen={visibleModal}
        handleCancel={handleCancel}
        onFinish={onFinish}
        editingUser={editingUser}
        form={form}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  )
}

export default UserManagement

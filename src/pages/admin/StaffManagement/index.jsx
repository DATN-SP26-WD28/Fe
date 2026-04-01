import React, { useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, Form, Popconfirm, Space, message } from 'antd'
import { Edit, Trash2, Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchStaff, deleteStaff, createStaff, updateStaff } from '@/configs/staff.api'
import { ROLE_LABEL_MAP } from '@/shared/constants/app.constants'
import StaffForm from './StaffForm'

const StaffManagement = () => {
  const queryClient = useQueryClient()
  const [visibleModal, setVisibleModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [form] = Form.useForm()

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  })

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      message.success('Thêm nhân viên thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Tạo nhân viên thất bại')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateStaff(id, data),
    onSuccess: () => {
      message.success('Cập nhật nhân viên thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Cập nhật thất bại')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      message.success('Xóa nhân viên thành công')
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Xóa nhân viên thất bại')
    },
  })

  const openCreateModal = () => {
    setEditingStaff(null)
    form.resetFields()
    setVisibleModal(true)
  }

  const onEdit = (record) => {
    setEditingStaff(record)
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phone: record.phone,
      role: record.role,
    })
    setVisibleModal(true)
  }

  const onDelete = (key) => {
    deleteMutation.mutate(key)
  }

  const onFinish = async (values) => {
    if (editingStaff) {
      updateMutation.mutate({ id: editingStaff._id || editingStaff.id || editingStaff.key, data: values })
    } else {
      createMutation.mutate(values)
    }
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
      dataIndex: 'username',
      key: 'username',
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
        const config = ROLE_LABEL_MAP[role] || { label: role || '-', color: 'default' }
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
            onConfirm={() => onDelete(record._id ?? record.id ?? record.key)}
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
          dataSource={staff}
          rowKey={(record) => record._id ?? record.id ?? record.key}
          loading={isLoading}
          pagination={{ pageSize: 7 }}
          className="rounded-xl"
        />
      </Card>

      <StaffForm
        isModalOpen={visibleModal}
        handleCancel={handleCancel}
        onFinish={onFinish}
        editingStaff={editingStaff}
        form={form}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  )
}

export default StaffManagement

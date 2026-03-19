import React, { useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, message, Popconfirm, Form, Avatar } from 'antd'
import { Edit, Trash2, Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import categoryAPI from '@/configs/category.api'
import CategoryForm from './CategoryForm'

const CategoryManagement = () => {
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (payload) => categoryAPI.create(payload),
    onSuccess: () => {
      message.success('Thêm danh mục thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => message.error(err?.response?.data?.message || 'Thêm thất bại'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryAPI.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật danh mục thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => message.error(err?.response?.data?.message || 'Cập nhật thất bại'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryAPI.delete(id),
    onSuccess: () => {
      message.success('Xóa danh mục thành công')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => message.error(err?.response?.data?.message || 'Xóa thất bại'),
  })

  const showModal = (record = null) => {
    setEditingCategory(record)
    if (record) form.setFieldsValue(record)
    else form.resetFields()
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    form.resetFields()
  }

  const onFinish = (values) => {
    if (editingCategory) {
      const id = editingCategory._id || editingCategory.key || editingCategory.id
      updateMutation.mutate({ id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 200,
      render: (src) => <Avatar src={src} shape="square" size={150} />,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (v) => <span>{v || '-'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map = {
          Active: { color: 'green', text: 'Hoạt động' },
          Inactive: { color: 'default', text: 'Không hoạt động' },
        }
        const cfg = map[status] || { color: 'default', text: status }
        return <Tag color={cfg.color}>{cfg.text}</Tag>
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <span className="flex gap-2">
          <Button type="text" icon={<Edit size={18} />} title="Sửa" className="text-blue-500" onClick={() => showModal(record)} />
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => deleteMutation.mutate(record._id || record.key || record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" icon={<Trash2 size={18} />} title="Xóa" className="text-red-500" loading={deleteMutation.isPending && deleteMutation.variables === (record._id || record.key || record.id)} />
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <>
      <section className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-3xl mb-2">Quản lý danh mục</h1>
            <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý danh mục' }]} />
          </div>
          <Button type="primary" className="rounded-xl flex items-center gap-2" icon={<Plus size={18} />} onClick={() => showModal()}>
            Thêm danh mục
          </Button>
        </div>
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Danh sách danh mục">
        <Table columns={columns} dataSource={categories} loading={isLoading} rowKey={(r) => r._id || r.key || r.id} pagination={{ pageSize: 8 }} className="rounded-xl" />
      </Card>

      <CategoryForm
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        onFinish={onFinish}
        editingCategory={editingCategory}
        form={form}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  )
}

export default CategoryManagement


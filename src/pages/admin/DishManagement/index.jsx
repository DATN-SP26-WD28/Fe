import React, { useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, Popconfirm, message } from 'antd'
import { Edit, Trash2, Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dishAPI from '@/configs/dish.api'
import categoryAPI from '@/configs/category.api'
import { truncateText } from '@/shared/utils/truncateText'
import { formatCurrency } from '@/shared/utils/currency'
import { CATEGORY_PLACEHOLDER_IMG } from '@/assets/images'
import DishForm from './DishForm'

const DishManagement = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState(null)

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryAPI.getAll() })

  const { data: dishes = [], isLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => dishAPI.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (payload) => dishAPI.create(payload),
    onSuccess: () => {
      message.success('Thêm món mới thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['dishes'] })
    },
    onError: (err) => message.error(err?.response?.data?.message || 'Thêm thất bại'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dishAPI.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật món thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['dishes'] })
    },
    onError: (err) => message.error(err?.response?.data?.message || 'Cập nhật thất bại'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => dishAPI.delete(id),
    onSuccess: () => {
      message.success('Xóa món ăn thành công')
      queryClient.invalidateQueries({ queryKey: ['dishes'] })
    },
    onError: (err) => message.error(err?.response?.data?.message || 'Xóa thất bại'),
  })

  const showModal = (record = null) => {
    setEditingDish(record)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setEditingDish(null)
  }

  const onFinish = (values) => {
    if (editingDish) {
      const id = editingDish._id || editingDish.id
      updateMutation.mutate({ id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const columns = [
  {
    title: 'Hình ảnh',
    dataIndex: 'image',
    key: 'image',
    render: (src) => (
      <img
        src={src}
        alt="dish"
        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
      />
    ),
    width: 150,
  },
  {
    title: 'Tên món',
    dataIndex: 'name',
    key: 'name',
    render: (v) => <span className="font-medium">{truncateText(v, 20)}</span>,
  },
  {
    title: 'Giá',
    dataIndex: 'price',
    key: 'price',
    render: (v) => <span>{formatCurrency(v)}</span>,
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
    key: 'description',
    render: (v) => <span className="line-clamp-2">{truncateText(v, 40)}</span>,
  },
  {
    title: 'Tên danh mục',
    dataIndex: 'category',
    key: 'category_name',
    render: (_, record) => <span>{record.category?.name || '-'}</span>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const map = {
        available: 'green',
        unavailable: 'red',
      }
      return <Tag color={map[status] || 'default'}>{status}</Tag>
    },
  },
  {
    title: 'Hành động',
    key: 'action',
    render: (_, record) => (
      <span className="flex gap-2">
        <Button type="text" icon={<Edit size={18} />} title="Sửa" className="text-blue-500" onClick={() => showModal(record)} />
        <Popconfirm
          title="Xóa món"
          description="Bạn có chắc chắn muốn xóa món này?"
          onConfirm={() => deleteMutation.mutate(record._id || record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" icon={<Trash2 size={18} />} title="Xóa" className="text-red-500" loading={deleteMutation.isLoading} />
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
            <h1 className="font-bold text-3xl mb-2">Quản lý món ăn</h1>
            <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý món ăn' }]} />
          </div>
          <Button type="primary" className="rounded-xl flex items-center gap-2" icon={<Plus size={18} />} onClick={() => showModal()}>
            Thêm món mới
          </Button>
        </div>
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Danh sách món ăn">
        <Table
          columns={columns}
          dataSource={dishes}
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          rowKey="_id"
          className="rounded-xl"
        />
      </Card>

      <DishForm
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        onFinish={onFinish}
        editingDish={editingDish}
        categories={categories}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  )
}

export default DishManagement

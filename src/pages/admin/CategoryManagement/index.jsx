import React from 'react'
import { Card, Table, Tag, Breadcrumb, Button } from 'antd'
import { Edit, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategoryList } from '@/services/category.service'
import { truncateText } from '@/shared/utils/truncateText'
import { CATEGORY_PLACEHOLDER_IMG } from '@/assets/images'

const columns = [
  {
    title: 'Hình ảnh',
    dataIndex: 'image',
    key: 'image',
    render: (src) => (
      <img
        src={src || CATEGORY_PLACEHOLDER_IMG}
        alt="category"
        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
        onError={e => { e.target.onerror = null; e.target.src = CATEGORY_PLACEHOLDER_IMG; }}
      />
    ),
    width: 150,
  },
  {
    title: 'Tên danh mục',
    dataIndex: 'name',
    key: 'name',
    render: (v) => <span className="font-medium">{truncateText(v, 20)}</span>,
  },
  {
    title: 'Mô tả sản phẩm',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const map = {
        Active: 'green',
        Inactive: 'red',
      }
      return <Tag color={map[status] || 'default'}>{status}</Tag>
    },
  },
  {
    title: 'Hành động',
    key: 'action',
    render: (_, record) => (
      <span className="flex gap-2">
        <Button type="text" icon={<Edit size={18} />} title="Sửa" className="text-blue-500" />
        <Button type="text" icon={<Trash2 size={18} />} title="Xóa" className="text-red-500" />
      </span>
    ),
  },
]

const CategoryManagement = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoryList,
  })

  return (
    <>
      <section className="mb-3">
        <h1 className="font-bold text-3xl mb-2">Quản lý danh mục</h1>
        <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý danh mục' }]} />
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Danh mục sản phẩm">
        <Table
          columns={columns}
          dataSource={categories}
          loading={isLoading}
          pagination={{ pageSize: 5 }}
          className="rounded-xl"
        />
      </Card>
    </>
  )
}

export default CategoryManagement

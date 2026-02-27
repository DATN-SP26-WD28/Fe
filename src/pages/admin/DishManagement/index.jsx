import React from 'react'
import { Card, Table, Tag, Breadcrumb, Button } from 'antd'
import { Edit, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchDishList } from '@/services/dish.service'
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
        alt="dish"
        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
        onError={e => { e.target.onerror = null; e.target.src = CATEGORY_PLACEHOLDER_IMG; }}
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
    render: (v) => <span>{v?.toLocaleString()}₫</span>,
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
    key: 'description',
    render: (v) => <span className="line-clamp-2">{truncateText(v, 40)}</span>,
  },
  {
    title: 'Tên danh mục',
    dataIndex: ['category_id', 'category_name'],
    key: 'category_name',
    render: (_, record) => <span>{record.category_id?.category_name}</span>,
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
        <Button type="text" icon={<Edit size={18} />} title="Sửa" className="text-blue-500" />
        <Button type="text" icon={<Trash2 size={18} />} title="Xóa" className="text-red-500" />
      </span>
    ),
  },
]

const DishManagement = () => {
  const { data: dishes = [], isLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: fetchDishList,
  })

  return (
    <>
      <section className="mb-3">
        <h1 className="font-bold text-3xl mb-2">Quản lý món ăn</h1>
        <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý món ăn' }]} />
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Danh sách món ăn">
        <Table
          columns={columns}
          dataSource={dishes}
          loading={isLoading}
          pagination={{ pageSize: 5 }}
          rowKey="_id"
          className="rounded-xl"
        />
      </Card>
    </>
  )
}

export default DishManagement

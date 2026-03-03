import React from 'react'
import { Card, Table, Tag, Breadcrumb, Button, QRCode } from 'antd'
import { Edit, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategoryList } from '@/services/category.service'
import { truncateText } from '@/shared/utils/truncateText'

const columns = [
  {
    title: 'Tên bàn ăn',
    dataIndex: 'name',
    key: 'name',
    render: (v) => <span className="font-medium">{truncateText(v, 20)}</span>,
  },
  {
    title: 'QR Code',
    dataIndex: 'image',
    key: 'image',
    render: (value) => (
      <QRCode
        errorLevel="H"
        value={value}
        icon="/logo-roosta.png"
      />
    ),
  },
  {
    title: 'Sức chứa',
    dataIndex: 'description',
    key: 'description',
    width: 150,
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

const TableManagement = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoryList,
  })

  return (
    <>
      <section className="mb-3">
        <h1 className="font-bold text-3xl mb-2">Quản lý bàn ăn</h1>
        <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý bàn ăn' }]} />
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Danh sách bàn ăn">
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

export default TableManagement

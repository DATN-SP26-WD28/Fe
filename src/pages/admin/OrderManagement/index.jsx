import React from 'react'
import { Card, Table, Tag, Breadcrumb } from 'antd'
import TableOrderManager from '@/components/TableOrderManager'
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, CreditCardOutlined, SyncOutlined } from '@ant-design/icons'

const columns = [
  {
    title: 'Bàn số',
    dataIndex: 'table_number',
    key: 'table_number',
    render: (v) => <span className="font-medium">{v}</span>,
  },
  {
    title: 'Khách hàng',
    dataIndex: 'customer',
    key: 'customer',
  },
  {
    title: 'Món ăn',
    dataIndex: 'dishes',
    key: 'dishes',
  },
  {
    title: 'Người phục vụ',
    dataIndex: 'server',
    key: 'server',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const map = {
        Shipped: 'green',
        Processing: 'blue',
        Pending: 'gold',
        Cancelled: 'red',
      }
      return <Tag color={map[status] || 'default'}>{status}</Tag>
    },
  },
]

const orders = [
  {
    key: 'a1',
    orderId: '#INV-1042',
    customer: 'Nguyen Van A',
    status: 'Shipped',
    total: 2450000,
  },
  {
    key: 'a2',
    orderId: '#INV-1043',
    customer: 'Tran Thi B',
    status: 'Pending',
    total: 990000,
  },
  {
    key: 'a3',
    orderId: '#INV-1044',
    customer: 'Le Van C',
    status: 'Cancelled',
    total: 0,
  },
  {
    key: 'a5',
    orderId: '#INV-1045',
    customer: 'Pham D',
    status: 'Processing',
    total: 1200000,
  },
]

const OrderManagement = () => {
  const STATUS_TAGS = [
    { key: 'processing', color: 'default', icon: <ClockCircleOutlined />, label: 'Chờ xử lý', count: 1 },
    { key: 'cooking', color: 'processing', icon: <SyncOutlined spin />, label: 'Đang nấu', count: 5 },
    { key: 'rejected', color: 'error', icon: <CloseCircleOutlined />, label: 'Từ chối', count: 0 },
    { key: 'served', color: 'success', icon: <CheckCircleOutlined />, label: 'Đã phục vụ', count: 0 },
    { key: 'paid', color: 'cyan', icon: <CreditCardOutlined />, label: 'Đã thanh toán', count: 6 },
  ]

  return (
    <>
      <section className="mb-3">
        <h1 className="font-bold text-3xl mb-2">Quản lý đơn hàng</h1>
        <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý đơn hàng' }]} />
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2">
        <section className="flex justify-start items-stretch gap-4 flex-wrap py-4">
          <TableOrderManager />
        </section>
        <section className='gap-2 flex items-center mb-4'>
          {STATUS_TAGS.map((t) => (
            <Tag variant="solid" key={t.key} color={t.color} icon={t.icon}>
              {t.label}: {t.count}
            </Tag>
          ))}
        </section>
        <Table
          columns={columns}
          dataSource={orders}
          pagination={{ pageSize: 5 }}
          className="rounded-xl"
        />
      </Card>
    </>
  )
}

export default OrderManagement

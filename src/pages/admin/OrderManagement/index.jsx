import React from 'react'
import { Card, Table, Tag, Breadcrumb } from 'antd'

const columns = [
  {
    title: 'Mã đơn',
    dataIndex: 'orderId',
    key: 'orderId',
    render: (v) => <span className="font-medium">{v}</span>,
  },
  {
    title: 'Khách hàng',
    dataIndex: 'customer',
    key: 'customer',
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
  return (
    <>
      <section className="mb-3">
        <h1 className="font-bold text-3xl mb-2">Quản lý đơn hàng</h1>
        <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý đơn hàng' }]} />
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Đơn hàng gần đây">
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

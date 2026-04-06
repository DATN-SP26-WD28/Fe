import React from 'react'
import { Breadcrumb, Card, Col, Row, Statistic, Table, Tag } from 'antd'

const STATUS_MAP = {
  Shipped: { label: 'Đã thanh toán', color: 'success' },
  Processing: { label: 'Đang xử lý', color: 'processing' },
  Pending: { label: 'Chờ thanh toán', color: 'warning' },
  Cancelled: { label: 'Đã hủy', color: 'error' },
}

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

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)

const summary = {
  totalInvoices: orders.length,
  totalRevenue: orders.reduce((sum, item) => sum + item.total, 0),
  paidInvoices: orders.filter((item) => item.status === 'Shipped').length,
  unpaidInvoices: orders.filter((item) => item.status === 'Pending').length,
}

const columns = [
  {
    title: 'Mã đơn',
    dataIndex: 'orderId',
    key: 'orderId',
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    title: 'Khách hàng',
    dataIndex: 'customer',
    key: 'customer',
  },
  {
    title: 'Tổng tiền',
    dataIndex: 'total',
    key: 'total',
    render: (value) => <span className="font-semibold">{formatCurrency(value)}</span>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const statusInfo = STATUS_MAP[status] || { label: status, color: 'default' }
      return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
    },
  },
]

const PaymentAndBill = () => {
  return (
    <>
      <section className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-bold text-3xl mb-2">Quản lý thanh toán và hóa đơn</h1>
            <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý thanh toán và hóa đơn' }]} />
          </div>
        </div>
      </section>

      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <Statistic title="Tổng hóa đơn" value={summary.totalInvoices} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <Statistic
              title="Doanh thu" 
              value={summary.totalRevenue}
              precision={0}
              valueStyle={{ fontWeight: 700, fontSize: '24px' }}
              prefix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <Statistic title="Đã thanh toán" value={summary.paidInvoices} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <Statistic title="Chờ thanh toán" value={summary.unpaidInvoices} />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm rounded-2xl" title="Đơn hàng gần đây">
        <Table
          columns={columns}
          dataSource={orders}
          pagination={{ pageSize: 5 }}
          className="rounded-xl"
          rowClassName="hover:bg-slate-50"
        />
      </Card>
    </>
  )
}

export default PaymentAndBill

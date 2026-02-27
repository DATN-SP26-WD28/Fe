import React, { useMemo } from 'react'
import { Card, Statistic, Table, Tag, Progress, Avatar, List, Breadcrumb } from 'antd'

const BRAND_COLOR = '#f07f29'

const revenueData = [
  { key: '1', month: 'Jan', revenue: 12000, growth: 12 },
  { key: '2', month: 'Feb', revenue: 14500, growth: 8 },
  { key: '3', month: 'Mar', revenue: 15800, growth: 5 },
  { key: '4', month: 'Apr', revenue: 17600, growth: 9 },
  { key: '5', month: 'May', revenue: 16900, growth: -4 },
  { key: '6', month: 'Jun', revenue: 19400, growth: 13 },
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

const activities = [
  { id: 1, user: 'Minh', action: 'created a new order', time: '2m' },
  { id: 2, user: 'Linh', action: 'updated product price', time: '10m' },
  { id: 3, user: 'Kien', action: 'published a campaign', time: '1h' },
  { id: 4, user: 'Trung', action: 'added 3 new users', time: '2h' },
]

function formatVND(v) {
  return new Intl.NumberFormat('vi-VN').format(v)
}

function Sparkline({ values }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100
      const y = 40 - ((v - min) / (max - min || 1)) * 40 // 0..40 px
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 40" className="w-full h-10 text-brand">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function Dashboard() {
  const revenue = useMemo(() => revenueData.reduce((acc, r) => acc + r.revenue, 0), [])
  const growth = useMemo(
    () => revenueData.reduce((acc, r) => acc + r.growth, 0) / revenueData.length,
    []
  )

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
    {
      title: 'Tổng tiền (₫)',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (v) => formatVND(v),
      sorter: (a, b) => a.total - b.total,
    },
  ]

  return (
    <div className="h-full overflow-auto">
      <section className="mb-6">
        <Breadcrumb
          className="mb-2"
          items={[{ title: 'Trang chủ' }, { title: 'Trang tổng quan' }]}
        />
        <h1 className="font-bold text-2xl text-gray-800">Trang tổng quan</h1>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm rounded-2xl">
          <div className="flex items-start justify-between">
            <Statistic title="Tổng doanh thu" value={formatVND(revenue)} />
            <div className="w-24">
              <Sparkline values={revenueData.map((d) => d.revenue)} />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">6 tháng gần nhất</div>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <div className="flex items-start justify-between">
            <Statistic title="Tăng trưởng trung bình" value={growth.toFixed(1)} suffix="%" />
            <div className="w-24">
              <Sparkline values={revenueData.map((d) => d.growth)} />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">MoM</div>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <Statistic title="Tỷ lệ hoàn thành KPI" value={86} suffix="%" />
          <div className="mt-4">
            <Progress percent={86} showInfo={false} strokeColor={BRAND_COLOR} />
          </div>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <Statistic title="Khách hàng mới" value={324} />
          <div className="mt-2 text-xs text-gray-400">trong 30 ngày</div>
        </Card>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Đơn hàng gần đây">
          <Table
            columns={columns}
            dataSource={orders}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="shadow-sm rounded-2xl" title="Hoạt động gần đây">
            <List
              itemLayout="horizontal"
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar className="!bg-brand">{item.user[0]}</Avatar>}
                    title={
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm">
                          <span className="font-medium">{item.user}</span>{' '}
                          <span className="text-gray-500">{item.action}</span>
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card className="shadow-sm rounded-2xl" title="Tiến độ dự án">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Website Revamp</span>
                  <span className="text-gray-500">72%</span>
                </div>
                <Progress percent={72} showInfo={false} strokeColor={BRAND_COLOR} />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Mobile App</span>
                  <span className="text-gray-500">43%</span>
                </div>
                <Progress percent={43} showInfo={false} strokeColor={BRAND_COLOR} />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Data Pipeline</span>
                  <span className="text-gray-500">90%</span>
                </div>
                <Progress percent={90} showInfo={false} strokeColor={BRAND_COLOR} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

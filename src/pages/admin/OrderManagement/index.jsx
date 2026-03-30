import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, message } from 'antd'
import TableOrderManager from '@/components/TableOrderManager'
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, CreditCardOutlined, SyncOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'
import OrderCreateModal from '@/components/OrderCreateModal'

const OrderManagement = () => {
  // --- LOGIC DATA ---
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await orderAPI.getAll()
      // Lưu ý: res ở đây là response đã qua axiosClient interceptor (trả về data)
      if (res && res.data) {
        const formattedData = res.data.map((item) => ({
          ...item,
          key: item._id, // Ant Design Table cần key duy nhất
        }))
        setDataSource(formattedData)
      }
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Hàm đếm số lượng theo trạng thái để hiển thị lên Tag
  const countStatus = (status) => dataSource.filter((item) => item.status === status).length

  // --- LOGIC COLUMNS (Sửa dataIndex để khớp với Backend populate) ---
  const columns = [
    {
      title: 'Bàn số',
      // Vì backend populate table_id nên lấy table_id.table_number
      dataIndex: ['table_id', 'table_number'],
      key: 'table_number',
      render: (v) => <span className="font-medium text-blue-600">Bàn {v || 'N/A'}</span>,
    },
    {
      title: 'Khách hàng',
      // Backend populate guest_id nên lấy guest_id.username
      dataIndex: ['guest_id', 'username'],
      key: 'customer',
      render: (v) => v || 'Khách vãng lai',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (v) => <b className="text-orange-600">{v?.toLocaleString()}đ</b>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        // Khớp với các enum status từ Backend của bạn
        const map = {
          pending: { color: 'gold', label: 'Chờ xử lý' },
          preparing: { color: 'blue', label: 'Đang nấu' },
          served: { color: 'green', label: 'Đã phục vụ' },
          paid: { color: 'cyan', label: 'Đã thanh toán' },
          cancelled: { color: 'red', label: 'Đã hủy' },
        }
        const config = map[status] || { color: 'default', label: status }
        return <Tag color={config.color}>{config.label.toUpperCase()}</Tag>
      },
    },
  ]

  const STATUS_TAGS = [
    { key: 'pending', color: 'default', icon: <ClockCircleOutlined />, label: 'Chờ xử lý', count: countStatus('pending') },
    { key: 'preparing', color: 'processing', icon: <SyncOutlined spin />, label: 'Đang nấu', count: countStatus('preparing') },
    { key: 'cancelled', color: 'error', icon: <CloseCircleOutlined />, label: 'Từ chối', count: countStatus('cancelled') },
    { key: 'served', color: 'success', icon: <CheckCircleOutlined />, label: 'Đã phục vụ', count: countStatus('served') },
    { key: 'paid', color: 'cyan', icon: <CreditCardOutlined />, label: 'Đã thanh toán', count: countStatus('paid') },
  ]

  return (
    <>
      <section className="mb-3">
        <h1 className="font-bold text-3xl mb-2">Quản lý đơn hàng</h1>
        <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý đơn hàng' }]} />
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2">
        <section className="flex justify-end mb-2">
          <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
            Thêm mới đơn hàng
          </Button>
        </section>

        <section className="flex justify-start items-stretch gap-4 flex-wrap py-4">
          <TableOrderManager orders={dataSource} />
        </section>
        <section className="gap-2 flex items-center mb-4">
          {STATUS_TAGS.map((t) => (
            <Tag variant="solid" key={t.key} color={t.color} icon={t.icon}>
              {t.label}: {t.count}
            </Tag>
          ))}
        </section>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{ pageSize: 8 }}
          className="rounded-xl"
        />
      </Card>

      <OrderCreateModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          fetchOrders()
        }}
      />
    </>
  )
}

export default OrderManagement
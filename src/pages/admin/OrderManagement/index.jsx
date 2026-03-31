import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, Select, message } from 'antd'
import TableOrderManager from '@/components/TableOrderManager'
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, CreditCardOutlined, SyncOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'
import OrderCreateModal from '@/components/OrderCreateModal'

const OrderManagement = () => {
  // --- LOGIC DATA ---
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const STATUS_MAP = {
    pending: { color: 'gold', label: 'Chờ xử lý' },
    preparing: { color: 'blue', label: 'Đang nấu' },
    ready: { color: 'geekblue', label: 'Sẵn sàng' },
    served: { color: 'green', label: 'Đã phục vụ' },
    canceled: { color: 'red', label: 'Đã hủy' },
  }

  const STATUS_OPTIONS = [
    { value: 'pending', label: STATUS_MAP.pending.label },
    { value: 'preparing', label: STATUS_MAP.preparing.label },
    { value: 'ready', label: STATUS_MAP.ready.label },
    { value: 'served', label: STATUS_MAP.served.label },
    { value: 'canceled', label: STATUS_MAP.canceled.label },
  ]

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
  const countStatus = (statuses) => {
    const targetStatuses = Array.isArray(statuses) ? statuses : [statuses]
    return dataSource.filter((item) => targetStatuses.includes(item.status)).length
  }

  const handleUpdateStatus = async (orderId, nextStatus, currentStatus) => {
    if (!orderId || nextStatus === currentStatus) return

    setUpdatingOrderId(orderId)
    try {
      await orderAPI.updateStatus(orderId, nextStatus)
      setDataSource((prev) => prev.map((item) => (item._id === orderId ? { ...item, status: nextStatus } : item)))
      message.success('Cập nhật trạng thái thành công!')
    } catch (error) {
      message.error('Không thể cập nhật trạng thái đơn hàng!')
      console.error(error)
    } finally {
      setUpdatingOrderId(null)
    }
  }

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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const normalizedStatus =
          status === 'cancelled' ? 'canceled' : status === 'preparing' ? 'preparing' : status
        return (
          <Select
            value={normalizedStatus}
            options={STATUS_OPTIONS}
            loading={updatingOrderId === record._id}
            onChange={(value) => handleUpdateStatus(record._id, value, normalizedStatus)}
            style={{ minWidth: 150 }}
          />
        )
      },
    },
        {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
  ]

  const STATUS_TAGS = [
    { key: 'pending', color: 'default', icon: <ClockCircleOutlined />, label: 'Chờ xử lý', count: countStatus('pending') },
    { key: 'preparing', color: 'warning', icon: <SyncOutlined spin />, label: 'Đang nấu', count: countStatus('preparing') },
    { key: 'ready', color: 'processing', icon: <SyncOutlined />, label: 'Sẵn sàng', count: countStatus('ready') },
    { key: 'served', color: 'success', icon: <CheckCircleOutlined />, label: 'Đã phục vụ', count: countStatus('served') },
    { key: 'canceled', color: 'error', icon: <CloseCircleOutlined />, label: 'Đã hủy', count: countStatus(['canceled', 'cancelled']) },
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
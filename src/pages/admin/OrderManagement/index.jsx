import OrderCreateModal from '@/components/OrderCreateModal'
import TableOrderManager from '@/components/TableOrderManager'
import orderAPI from '@/configs/order.api'
import orderItemAPI from '@/configs/orderItem.api'
import { useSocket } from '@/contexts/SocketContext'
import { OrderStatusProvider, useOrderStatus } from '@/contexts/OrderStatusContext'
import { SOCKET_EVENTS } from '@/shared/constants/socket.constants'
import {
  ORDER_ITEM_STATUS,
  ORDER_ITEM_STATUS_MAP,
  ORDER_ITEM_STATUS_OPTIONS,
  normalizeOrderStatus,
} from '@/shared/constants/app.constants'
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons'
import { App, Breadcrumb, Button, Card, Select, Table, Tag, message, notification, Input } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'

// --- CÁC HÀM HELPER GIỮ NGUYÊN ---
// const getTableIdFromOrder = (order) => {
//   const tableRef = order?.table_id
//   if (!tableRef) return null
//   if (typeof tableRef === 'string') return tableRef
//   return tableRef?._id || null
// }

const BACKEND_BASE_URL = (import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:8888').replace(/\/$/, '')

const resolveImageUrl = (value) => {
  if (!value || typeof value !== 'string') return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${BACKEND_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`
}

const normalizeOrder = (order) => ({
  ...order,
  items: Array.isArray(order?.items) ? order.items : [],
  key: order?._id,
})

const flattenOrdersToItemRows = (orders = [], itemStatusById = {}) => {
  if (!Array.isArray(orders)) return [];
  return orders.flatMap((order) => {
    const tableNumber = order?.table_id?.table_number || 'N/A'
    const customerName = order?.guest_id?.username || 'Khách vãng lai'
    const items = order?.items || []

    return items.map((item) => ({
      key: item?._id || Math.random(),
      orderId: order?._id,
      itemId: item?._id,
      tableNumber,
      customerName,
      dishName: item?.dish_id?.dish_name || 'Món không xác định',
      dishImage: resolveImageUrl(item?.dish_id?.image_url || ''),
      quantity: Number(item?.quantity) || 0,
      price: Number(item?.price) || 0,
      itemStatus: normalizeOrderStatus(itemStatusById[item?._id] || item?.status),
      note: order?.note || '',
      createdAt: order?.createdAt,
    }))
  })
}

const OrderManagementContent = () => {
  const { orders, itemStatusById, hydrateOrders, applyItemStatusUpdate } = useOrderStatus()
  const { socket, isConnected } = useSocket()
  const [notificationApi, notificationContextHolder] = notification.useNotification()
  const [loading, setLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState(null)
  const [filterStatus, setFilterStatus] = useState(null);
  const [searchText, setSearchText] = useState('');
  const { Search } = Input

  const dataSource = useMemo(() => {
    const allRows = flattenOrdersToItemRows(orders, itemStatusById);
    let rows = allRows

    if (filterStatus) rows = rows.filter((row) => row.itemStatus === filterStatus)

    const q = (searchText || '').trim().toLowerCase()
    if (q) {
      rows = rows.filter((row) => {
        const dish = (row.dishName || '').toLowerCase()
        const customer = (row.customerName || '').toLowerCase()
        const orderCode = row.orderId ? `#${String(row.orderId).slice(-6).toUpperCase()}`.toLowerCase() : ''
        return dish.includes(q) || customer.includes(q) || orderCode.includes(q)
      })
    }

    return rows
  }, [orders, itemStatusById, filterStatus, searchText])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderAPI.getAll()
      const actualOrders = res?.data?.data || res?.data || []
      if (Array.isArray(actualOrders)) {
        const normalizedOrders = actualOrders.map((item) => normalizeOrder(item))
        hydrateOrders(normalizedOrders)
      }
    } catch (error) {
      console.error("Lỗi fetch:", error)
    } finally {
      setLoading(false)
    }
  }, [hydrateOrders])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (!socket || !isConnected) return
    socket.emit(SOCKET_EVENTS.JOIN_ADMIN_ORDERS)
  }, [socket, isConnected])

  useEffect(() => {
    if (!socket) return

    const onOrderCreated = () => {
      fetchOrders()
    }

    const onItemStatusUpdated = (payload) => {
      if (!payload?.itemId || !payload?.newStatus) return

      const oldStatus = normalizeOrderStatus(payload.oldStatus)
      const newStatus = normalizeOrderStatus(payload.newStatus)
      const oldLabel = ORDER_ITEM_STATUS_MAP[oldStatus]?.label || oldStatus
      const newLabel = ORDER_ITEM_STATUS_MAP[newStatus]?.label || newStatus

      notificationApi.success({
        message: 'Cập nhật trạng thái món thành công',
        description: `${oldLabel} -> ${newLabel}`,
        placement: 'topRight',
      })

      applyItemStatusUpdate(payload.itemId, payload.newStatus)
    }

    socket.on(SOCKET_EVENTS.ORDER_CREATED, onOrderCreated)
    socket.on(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED, onItemStatusUpdated)

    return () => {
      socket.off(SOCKET_EVENTS.ORDER_CREATED, onOrderCreated)
      socket.off(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED, onItemStatusUpdated)
    }
  }, [socket, fetchOrders, applyItemStatusUpdate, notificationApi])

  useEffect(() => {
    if (isConnected) return
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [isConnected, fetchOrders])

  const countStatus = (statusKey) => {
    const allRows = flattenOrdersToItemRows(orders, itemStatusById);
    return allRows.filter((item) => item.itemStatus === statusKey).length
  }

  const handleUpdateStatus = async (itemId, nextStatus, currentStatus) => {
    if (!itemId || nextStatus === currentStatus) return

    // LOGIC CHẶN PHÍA FRONTEND ĐỂ ĐẢM BẢO AN TOÀN DỮ LIỆU
    if (currentStatus === ORDER_ITEM_STATUS.served || currentStatus === ORDER_ITEM_STATUS.canceled) {
      return message.error('Món ăn đã kết thúc quy trình, không thể thay đổi!');
    }

    if (currentStatus === ORDER_ITEM_STATUS.confirmed && nextStatus === ORDER_ITEM_STATUS.pending) {
      return message.warning('Món đã xác nhận không thể quay lại trạng thái chờ!');
    }

    setUpdatingItemId(itemId)
    try {
      await orderItemAPI.updateStatus(itemId, nextStatus)
      applyItemStatusUpdate(itemId, nextStatus)
    } catch {
      message.error('Lỗi khi cập nhật trạng thái món!')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const columns = [
    {
      title: 'Bàn số',
      dataIndex: 'tableNumber',
      key: 'table_number',
      render: (v, record) => {
        const tableLabel = v || 'N/A'
        const orderCode = record?.orderId ? `#${String(record.orderId).slice(-6).toUpperCase()}` : 'N/A'
        return <span className="font-medium text-blue-600">{`${tableLabel} (${orderCode})`}</span>
      },
      width: 150,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customer',
      render: (v) => v || 'Khách vãng lai',
    },
    {
      title: 'Món ăn',
      dataIndex: 'dishName',
      key: 'menu_item',
      render: (_, record) => (
        <div className="flex items-center gap-3 min-w-55">
          {record?.dishImage ? (
            <img src={record.dishImage} alt={record.dishName} className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 truncate">{record.dishName}</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">x{record.quantity}</span>
            </div>
            <div className="text-orange-600 italic font-semibold">{record.price.toLocaleString()} đ</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'itemStatus',
      key: 'status',
      render: (status, record) => {
        const normalizedStatus = normalizeOrderStatus(status);

        // LOGIC KHÓA SELECT: Nếu đã bưng ra (served) hoặc đã hủy (canceled) thì không cho sửa nữa
        const isLocked = normalizedStatus === ORDER_ITEM_STATUS.served || normalizedStatus === ORDER_ITEM_STATUS.canceled;

        return (
          <Select
            value={normalizedStatus}
            options={ORDER_ITEM_STATUS_OPTIONS}
            loading={updatingItemId === record.itemId}
            onChange={(value) => handleUpdateStatus(record.itemId, value, normalizedStatus)}
            style={{ minWidth: 150 }}
            disabled={isLocked} // KHÓA TẠI ĐÂY
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
    {
      key: ORDER_ITEM_STATUS.pending,
      color: 'orange',
      icon: <ClockCircleOutlined />,
      label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.pending]?.label || 'Chờ xử lý',
      count: countStatus(ORDER_ITEM_STATUS.pending),
    },
    {
      key: ORDER_ITEM_STATUS.confirmed,
      color: 'blue',
      icon: <SyncOutlined />,
      label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.confirmed]?.label || 'Đã xác nhận',
      count: countStatus(ORDER_ITEM_STATUS.confirmed),
    },
    {
      key: ORDER_ITEM_STATUS.served,
      color: 'green',
      icon: <CheckCircleOutlined />,
      label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.served]?.label || 'Đã phục vụ',
      count: countStatus(ORDER_ITEM_STATUS.served),
    },
    {
      key: ORDER_ITEM_STATUS.canceled,
      color: 'red',
      icon: <CloseCircleOutlined />,
      label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.canceled]?.label || 'Đã hủy',
      count: countStatus(ORDER_ITEM_STATUS.canceled),
    },
  ]

  return (
    <>
      {notificationContextHolder}
      <section className="flex justify-between items-end mb-2">
        <section className="mb-3">
          <h1 className="font-bold text-3xl mb-2">Quản lý đơn hàng</h1>
          <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý đơn hàng' }]} />
        </section>
        <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
          Tạo đơn hàng
        </Button>
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2">
        <section className="flex justify-start items-stretch gap-4 flex-wrap py-4">
          <TableOrderManager />
        </section>

        <section className="gap-2 flex items-center mb-4 flex-wrap">
          <Tag
            color={"default"}
            style={{ fontSize: '14px'}}
            variant='solid'
          >
            Tất cả: <span className='font-semibold'>{flattenOrdersToItemRows(orders, itemStatusById).length}</span>
          </Tag>

          {STATUS_TAGS.map((t) => {
            return (
              <Tag
                key={t.key}
                color={t.color}
                icon={t.icon}
                variant='solid'
                className={`py-1 px-3`}
                style={{ fontSize: '14px' }}
              >
                {t.label}: <span className='font-semibold'>{t.count}</span>
              </Tag>
            )
          })}
        </section>

        <section className="flex items-center gap-4">
          <div style={{ marginBottom: 12 }} className="flex items-center gap-2">
            <div className='font-semibold w-22'>Tìm kiếm:</div>
            <Search
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 300 }}
            />
          </div>
          <div style={{ marginBottom: 12 }} className="flex items-center gap-2">
            <div className='font-semibold'>Trạng thái:</div>
            <Select
              placeholder="Lọc theo trạng thái"
              value={filterStatus}
              options={ORDER_ITEM_STATUS_OPTIONS}
              allowClear
              onChange={(value) => setFilterStatus(value ?? null)}
              style={{ minWidth: 220 }}
            />
          </div>
        </section>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{ pageSize: 8 }}
          className="rounded-xl border border-slate-100"
          rowClassName={(record) => record.itemStatus === ORDER_ITEM_STATUS.canceled ? 'opacity-50 grayscale' : ''}
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

const OrderManagement = () => (
  <App>
    <OrderStatusProvider>
      <OrderManagementContent />
    </OrderStatusProvider>
  </App>
)

export default OrderManagement
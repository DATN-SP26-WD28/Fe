import OrderCreateModal from '@/components/OrderCreateModal'
import TableOrderManager from '@/components/TableOrderManager'
import orderAPI from '@/configs/order.api'
import orderItemAPI from '@/configs/orderItem.api'
import { OrderStatusProvider, useOrderStatus } from '@/contexts/OrderStatusContext'
import {
  ORDER_CANCELED_STATUSES,
  ORDER_ITEM_STATUS,
  ORDER_ITEM_STATUS_MAP,
  ORDER_ITEM_STATUS_OPTIONS,
  normalizeOrderStatus,
} from '@/shared/constants/app.constants'
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons'
import { App, Breadcrumb, Button, Card, Select, Table, Tag, message } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'

// --- CÁC HÀM HELPER GIỮ NGUYÊN ---
const getTableIdFromOrder = (order) => {
  const tableRef = order?.table_id
  if (!tableRef) return null
  if (typeof tableRef === 'string') return tableRef
  return tableRef?._id || null
}

const getTableIdFromData = (orders = []) => {
  const firstOrderWithTable = orders.find((order) => getTableIdFromOrder(order))
  return firstOrderWithTable ? getTableIdFromOrder(firstOrderWithTable) : null
}

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
  const [loading, setLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState(null)

  // --- MỚI: State lưu trạng thái lọc ---
  const [filterStatus, setFilterStatus] = useState(null);

  // DataSource được tính toán lại khi orders thay đổi HOẶC khi nhấn Filter
  const dataSource = useMemo(() => {
    const allRows = flattenOrdersToItemRows(orders, itemStatusById);

    if (!filterStatus) return allRows;

    // Logic lọc: Nếu chọn "Đang nấu" thì lọc cả 'inProgress' và 'preparing'
    if (filterStatus === ORDER_ITEM_STATUS.inProgress) {
      return allRows.filter(row => [ORDER_ITEM_STATUS.inProgress, 'preparing'].includes(row.itemStatus));
    }
    // Nếu chọn "Đã hủy" thì lọc tất cả các trạng thái hủy
    if (filterStatus === ORDER_ITEM_STATUS.canceled) {
      return allRows.filter(row => ORDER_CANCELED_STATUSES.includes(row.itemStatus));
    }

    return allRows.filter(row => row.itemStatus === filterStatus);
  }, [orders, itemStatusById, filterStatus])

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

  const countStatus = (statuses) => {
    const targetStatuses = Array.isArray(statuses) ? statuses : [statuses]
    // Lưu ý: Đếm trên dữ liệu GỐC (toàn bộ) chứ không đếm trên dữ liệu đã lọc
    const allRows = flattenOrdersToItemRows(orders, itemStatusById);
    return allRows.filter((item) => targetStatuses.includes(item.itemStatus)).length
  }

  const handleUpdateStatus = async (itemId, nextStatus, currentStatus) => {
    if (!itemId || nextStatus === currentStatus) return
    setUpdatingItemId(itemId)
    try {
      await orderItemAPI.updateStatus(itemId, nextStatus)
      applyItemStatusUpdate(itemId, nextStatus)
      message.success('Đã cập nhật trạng thái món ăn!')
    } catch (error) {
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
        const normalizedStatus = normalizeOrderStatus(status)
        return (
          <Select
            value={normalizedStatus}
            options={ORDER_ITEM_STATUS_OPTIONS}
            loading={updatingItemId === record.itemId}
            onChange={(value) => handleUpdateStatus(record.itemId, value, normalizedStatus)}
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
    {
      key: ORDER_ITEM_STATUS.pending,
      color: 'default',
      icon: <ClockCircleOutlined />,
      label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.pending].label,
      count: countStatus(ORDER_ITEM_STATUS.pending),
    },
    {
      key: ORDER_ITEM_STATUS.inProgress,
      color: 'warning',
      icon: <SyncOutlined spin />,
      label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.inProgress].label,
      count: countStatus([ORDER_ITEM_STATUS.inProgress, 'preparing']),
    },
    {
      key: ORDER_ITEM_STATUS.ready,
      color: 'processing',
      icon: <SyncOutlined />,
      label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.ready].label,
      count: countStatus(ORDER_ITEM_STATUS.ready),
    },
    {
      key: ORDER_ITEM_STATUS.served,
      color: 'success',
      icon: <CheckCircleOutlined />,
      label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.served].label,
      count: countStatus(ORDER_ITEM_STATUS.served),
    },
    {
      key: ORDER_ITEM_STATUS.canceled,
      color: 'error',
      icon: <CloseCircleOutlined />,
      label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.canceled].label,
      count: countStatus(ORDER_CANCELED_STATUSES),
    },
  ]

  return (
    <>
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

        {/* --- UI TAGS: Đã thêm sự kiện Click để Filter --- */}
        <section className="gap-2 flex items-center mb-4 flex-wrap">
          <Tag
            color={!filterStatus ? "blue" : "default"}
            className="cursor-pointer py-1 px-3 rounded-md border-none"
            style={{ fontSize: '14px', fontWeight: !filterStatus ? 'bold' : 'normal' }}
            onClick={() => setFilterStatus(null)}
          >
            Tất cả: {flattenOrdersToItemRows(orders, itemStatusById).length}
          </Tag>

          {STATUS_TAGS.map((t) => {
            const isActive = filterStatus === t.key;
            return (
              <Tag
                key={t.key}
                color={isActive ? t.color : "default"}
                icon={t.icon}
                variant={isActive ? "solid" : "outline"}
                className={`cursor-pointer py-1 px-3 rounded-md transition-all ${isActive ? 'scale-105 shadow-sm' : 'opacity-70'}`}
                style={{ fontSize: '14px' }}
                onClick={() => setFilterStatus(isActive ? null : t.key)}
              >
                {t.label}: {t.count}
              </Tag>
            )
          })}
        </section>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{ pageSize: 8 }}
          className="rounded-xl border border-slate-100"
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
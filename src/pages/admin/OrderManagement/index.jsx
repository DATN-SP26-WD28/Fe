import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, Select, message } from 'antd'
import TableOrderManager from '@/components/TableOrderManager'
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'
import orderItemAPI from '@/configs/orderItem.api'
import OrderCreateModal from '@/components/OrderCreateModal'
import { OrderStatusProvider, useOrderStatus } from '@/contexts/OrderStatusContext'
import {
  ORDER_CANCELED_STATUSES,
  ORDER_ITEM_STATUS,
  ORDER_ITEM_STATUS_MAP,
  ORDER_ITEM_STATUS_OPTIONS,
  normalizeOrderStatus,
} from '@/shared/constants/app.constants'

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
  return orders.flatMap((order) => {
    const tableNumber = order?.table_id?.table_number || 'N/A'
    const customerName = order?.guest_id?.username || 'Khách vãng lai'
    const items = Array.isArray(order?.items) ? order.items : []

    return items.map((item) => ({
      key: `${order?._id}-${item?._id || item?.dish_id?._id || Math.random()}`,
      orderId: order?._id,
      itemId: item?._id,
      tableNumber,
      customerName,
      dishName: item?.dish_id?.dish_name || 'Món không xác định',
      dishImage: resolveImageUrl(item?.dish_id?.image || item?.dish_id?.thumbnail || item?.dish_id?.image_url || ''),
      quantity: Number(item?.quantity) || 0,
      price: Number(item?.price) || 0,
      itemStatus: normalizeOrderStatus(itemStatusById[item?._id] || item?.status),
      note: order?.note || '',
      createdAt: order?.createdAt,
    }))
  })
}

const OrderManagementContent = () => {
  // --- LOGIC DATA ---
  const { orders, itemStatusById, hydrateOrders, applyItemStatusUpdate } = useOrderStatus()
  const [loading, setLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState(null)
  const currentTableIdRef = useRef(null)

  const dataSource = useMemo(() => flattenOrdersToItemRows(orders, itemStatusById), [orders, itemStatusById])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      let tableId = currentTableIdRef.current

      // Nếu chưa có dữ liệu cục bộ thì bootstrap từ danh sách đơn hiện có
      if (!tableId) {
        const allOrdersRes = await orderAPI.getAll()
        const allOrders = Array.isArray(allOrdersRes?.data) ? allOrdersRes.data : []
        tableId = getTableIdFromData(allOrders)
      }

      if (!tableId) {
        hydrateOrders([])
        return
      }

      currentTableIdRef.current = tableId

      const res = await orderAPI.getByTable(tableId)
      // Lưu ý: res ở đây là response đã qua axiosClient interceptor (trả về data)
      if (res && res.data) {
        const normalizedOrders = res.data.map((item) => normalizeOrder(item))
        const syncedTableId = getTableIdFromData(normalizedOrders)
        if (syncedTableId) {
          currentTableIdRef.current = syncedTableId
        }
        hydrateOrders(normalizedOrders)
      }
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Hàm đếm số lượng theo trạng thái để hiển thị lên Tag
  const countStatus = (statuses) => {
    const targetStatuses = Array.isArray(statuses) ? statuses : [statuses]
    return dataSource.filter((item) => targetStatuses.includes(item.itemStatus)).length
  }

  const handleUpdateStatus = async (itemId, nextStatus, currentStatus) => {
    if (!itemId || nextStatus === currentStatus) return

    setUpdatingItemId(itemId)
    try {
      await orderItemAPI.updateStatus(itemId, nextStatus)
      applyItemStatusUpdate(itemId, nextStatus)
      message.success('Cập nhật trạng thái thành công!')
    } catch (error) {
      message.error('Không thể cập nhật trạng thái đơn hàng!')
      console.error(error)
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
      render: (_, record) => {
        const dishLabel = record?.dishName || 'Món không xác định'
        const quantity = Number(record?.quantity) || 0
        const price = Number(record?.price) || 0

        return (
          <div className="flex items-center gap-3 min-w-55">
            {record?.dishImage ? (
              <img
                src={record.dishImage}
                alt={dishLabel}
                className="h-12 w-12 rounded-lg object-cover border border-slate-200"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200" />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 truncate">{dishLabel}</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">x{quantity}</span>
              </div>
              <div className="text-orange-600 italic font-semibold">{price.toLocaleString()} đ</div>
            </div>
          </div>
        )
      },
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

  console.log('dataSource', dataSource)
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

const OrderManagement = () => {
  return (
    <OrderStatusProvider>
      <OrderManagementContent />
    </OrderStatusProvider>
  )
}

export default OrderManagement
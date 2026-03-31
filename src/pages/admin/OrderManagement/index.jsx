import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, Select, message } from 'antd'
import TableOrderManager from '@/components/TableOrderManager'
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'
import orderItemAPI from '@/configs/orderItem.api'
import OrderCreateModal from '@/components/OrderCreateModal'
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

const normalizeOrder = (order) => ({
  ...order,
  items: Array.isArray(order?.items) ? order.items : [],
  key: order?._id,
})

const flattenOrdersToItemRows = (orders = []) => {
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
      quantity: Number(item?.quantity) || 0,
      price: Number(item?.price) || 0,
      itemStatus: normalizeOrderStatus(item?.status),
      note: order?.note || '',
      createdAt: order?.createdAt,
    }))
  })
}

const OrderManagement = () => {
  // --- LOGIC DATA ---
  const [orders, setOrders] = useState([])
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState(null)
  const currentTableIdRef = useRef(null)

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
        setDataSource([])
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
        setOrders(normalizedOrders)
        setDataSource(flattenOrdersToItemRows(normalizedOrders))
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
      setDataSource((prev) => prev.map((item) => (item.itemId === itemId ? { ...item, itemStatus: nextStatus } : item)))
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
      render: (v) => <span className="font-medium text-blue-600">{v || 'N/A'}</span>,
      width: 100,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customer',
      render: (v) => v || 'Khách vãng lai',
    },
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'order_id',
      render: (v) => (v ? `#${String(v).slice(-6).toUpperCase()}` : 'N/A'),
      width: 120,
    },
    {
      title: 'Món ăn',
      dataIndex: 'dishName',
      key: 'menu_item',
      render: (v) => v || 'Món không xác định',
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (v) => <b className="text-orange-600">{Number(v || 0).toLocaleString()}đ</b>,
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
      <section className="mb-3">
        <h1 className="font-bold text-3xl mb-2">Quản lý đơn hàng</h1>
        <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý đơn hàng' }]} />
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2">
        <section className="flex justify-end mb-2">
          <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
            Tạo đơn hàng
          </Button>
        </section>

        <section className="flex justify-start items-stretch gap-4 flex-wrap py-4">
          <TableOrderManager orders={orders} />
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
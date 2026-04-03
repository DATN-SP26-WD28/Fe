import { AlarmClockCheck, CheckCheck, ClipboardCheck, CookingPot, Users, DollarSign } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Empty, Modal, Spin, Tag, Button, Divider, message, Popconfirm } from 'antd'
import { fetchTables } from '@/configs/table.api'
import orderAPI from '@/configs/order.api'
// KIỂM TRA: Đảm bảo tên file và đường dẫn này đúng trong project của Khanh
import paymentAPI from '@/configs/payment.api'
import { useOrderStatus } from '@/contexts/OrderStatusContext'
import {
  ORDER_ITEM_STATUS,
  ORDER_ITEM_STATUS_MAP,
  ORDER_PREPARING_STATUSES,
  ORDER_SERVED_STATUSES,
  normalizeOrderStatus,
} from '@/shared/constants/app.constants'

// Các hàm Helper giữ nguyên như cũ của Khanh
const getTableIdFromOrder = (order) => {
  const tableRef = order?.table_id
  if (!tableRef) return null
  if (typeof tableRef === 'string') return tableRef
  return tableRef._id || null
}

const aggregateItemStats = (orders = [], itemStatusById = {}) => {
  return orders.reduce(
    (acc, order) => {
      const orderStatus = normalizeOrderStatus(order?.status)
      const items = Array.isArray(order?.items) ? order.items : []
      if (!items.length) {
        if (orderStatus === ORDER_ITEM_STATUS.pending) acc.pending += 1
        else if (ORDER_PREPARING_STATUSES.includes(orderStatus)) acc.preparing += 1
        else if (ORDER_SERVED_STATUSES.includes(orderStatus)) acc.served += 1
        return acc
      }
      items.forEach((item) => {
        const itemQty = Number(item?.quantity) || 0
        const itemStatus = normalizeOrderStatus(itemStatusById[item?._id] || item?.status)
        if (itemStatus === ORDER_ITEM_STATUS.pending) acc.pending += itemQty
        else if (ORDER_PREPARING_STATUSES.includes(itemStatus)) acc.preparing += itemQty
        else if (ORDER_SERVED_STATUSES.includes(itemStatus)) acc.served += itemQty
      })
      return acc
    },
    { pending: 0, preparing: 0, served: 0 },
  )
}

const TableOrderManager = () => {
  const { orders, itemStatusById } = useOrderStatus()
  const [tables, setTables] = useState([])
  const [tableItemStats, setTableItemStats] = useState({})
  const [open, setOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [modalOrders, setModalOrders] = useState([])
  const [modalLoading, setModalLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Tính tổng hóa đơn cả bàn
  const totalBill = useMemo(() => {
    return modalOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  }, [modalOrders])

  const loadTables = async () => {
    try {
      const res = await fetchTables()
      setTables(Array.isArray(res) ? res : [])
    } catch (error) {
      console.error("Lỗi load bàn:", error)
    }
  }

  useEffect(() => {
    loadTables()
  }, [])

  // useEffect loadTableItemStats giữ nguyên của Khanh...
  useEffect(() => {
    if (!tables.length) { setTableItemStats({}); return; }
    let mounted = true
    const loadTableItemStats = async () => {
      try {
        const results = await Promise.all(
          tables.map(async (table) => {
            const res = await orderAPI.getByTable(table._id)
            const tableOrders = Array.isArray(res?.data) ? res.data : []
            return [String(table._id), aggregateItemStats(tableOrders, itemStatusById)]
          }),
        )
        if (mounted) setTableItemStats(Object.fromEntries(results))
      } catch (error) { console.error(error); if (mounted) setTableItemStats({}) }
    }
    loadTableItemStats()
    return () => { mounted = false }
  }, [tables, orders, itemStatusById])

  const ordersByTable = useMemo(() => {
    return orders.reduce((acc, order) => {
      const tableId = getTableIdFromOrder(order)
      if (!tableId) return acc
      const normalizedTableId = String(tableId)
      if (!acc[normalizedTableId]) acc[normalizedTableId] = []
      acc[normalizedTableId].push(order)
      return acc
    }, {})
  }, [orders])

  const openTableModal = async (table) => {
    setSelectedTable(table)
    setOpen(true)
    setModalLoading(true)
    try {
      const res = await orderAPI.getByTable(table._id)
      setModalOrders(Array.isArray(res?.data) ? res.data : [])
    } catch (error) {
      setModalOrders([])
    } finally {
      setModalLoading(false)
    }
  }

  // LOGIC THANH TOÁN QUAN TRỌNG
  const handleCounterPayment = async () => {
    setSubmitting(true)
    try {
      await paymentAPI.processCounter({
        table_id: selectedTable.table_number,
        method: 'cash',
        amount_paid: totalBill,
        note: "Thanh toán tại quầy"
      })

      message.success(`Thanh toán bàn ${selectedTable.table_number} thành công!`)
      setOpen(false)
      loadTables()
      orderAPI.getAll()
    } catch (error) {
      console.error("LỖI THANH TOÁN:", error)
      message.error(error.response?.data?.message || "Không thể thực hiện thanh toán")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {tables.map((table) => {
          const tableOrders = ordersByTable[String(table._id)] || []
          const isOccupied = tableOrders.length > 0
          const stats = tableItemStats[String(table._id)] || { pending: 0, preparing: 0, served: 0 }

          return (
            <div
              key={table._id}
              className={`text-sm flex items-stretch gap-2 border p-2 rounded-md min-w-24 min-h-24 cursor-pointer transition-all ${isOccupied ? 'border-orange-400 bg-orange-50 shadow-sm' : 'border-gray-300 hover:border-blue-400'}`}
              role='button'
              onClick={() => openTableModal(table)}
            >
              <section className='flex flex-col items-center justify-center gap-2 min-w-[50px]'>
                <div className='font-bold text-center text-lg'>{table.table_number}</div>
                <div className='flex items-center gap-1 text-gray-500'>
                  <Users size={14} />
                  <span>{table.capacity || 0}</span>
                </div>
              </section>
              <div className='shrink-0 w-px grow h-auto bg-gray-200'></div>

              {!isOccupied ? (
                <section className='flex flex-col items-center justify-center gap-1 grow text-gray-400'>
                  <ClipboardCheck size={20} />
                  <span className='text-[10px] uppercase font-bold tracking-tighter'>Trống</span>
                </section>
              ) : (
                <section className='flex flex-col justify-center gap-1 grow'>
                  <div className='flex items-center text-orange-600'><AlarmClockCheck size={14} /><span className='ml-2 font-bold'>{stats.pending}</span></div>
                  <div className='flex items-center text-blue-600'><CookingPot size={14} /><span className='ml-2 font-bold'>{stats.preparing}</span></div>
                  <div className='flex items-center text-green-600'><CheckCheck size={14} /><span className='ml-2 font-bold'>{stats.served}</span></div>
                </section>
              )}
            </div>
          )
        })}
      </div>

      <Modal
        open={open}
        title={selectedTable ? `Chi tiết đơn hàng - Bàn ${selectedTable.table_number}` : 'Chi tiết đơn hàng'}
        width={700}
        onCancel={() => { setOpen(false); setSelectedTable(null); setModalOrders([]); }}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>Đóng</Button>,
          modalOrders.length > 0 && (
            <Popconfirm
              key="pay"
              title="Xác nhận khách đã trả tiền mặt?"
              onConfirm={handleCounterPayment}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ loading: submitting, className: 'bg-orange-500' }}
            >
              <Button type="primary" danger icon={<DollarSign size={16} />} className="bg-orange-600 border-none font-bold ml-2">
                Thanh toán tại quầy
              </Button>
            </Popconfirm>
          )
        ]}
      >
        {modalLoading ? <div className='py-8 flex justify-center'><Spin /></div> : modalOrders.length === 0 ? <Empty description='Chưa có đơn hàng' /> : (
          <>
            <div className='flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1'>
              {modalOrders.map((order) => {
                const codeTail = String(order?._id || '').slice(-6).toUpperCase()
                const statusConfig = ORDER_ITEM_STATUS_MAP[normalizeOrderStatus(order?.status)] || { color: 'default', label: order?.status }
                return (
                  <div key={order._id} className='border border-gray-100 rounded-lg p-3 bg-white'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='font-bold text-xs text-gray-400'>ĐƠN #{codeTail}</div>
                      <Tag color={statusConfig.color} className='text-[10px]'>{statusConfig.label}</Tag>
                    </div>
                    <div className='space-y-2 mb-3'>
                      {(order?.items || []).map((item) => (
                        <div key={item._id} className='text-sm flex justify-between'>
                          <span><b>{item?.dish_id?.dish_name}</b> <Tag color='volcano' className='ml-1'>x{item.quantity}</Tag></span>
                          <span className='font-medium'>{(item.price * item.quantity).toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>
                    <div className='flex justify-between border-t border-dashed pt-2'>
                      <span className='text-gray-400 text-xs uppercase font-bold'>Tạm tính:</span>
                      <span className='text-orange-500 font-bold'>{(order.total_amount || 0).toLocaleString()}đ</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <Divider className="my-4" />
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Tổng hóa đơn cả bàn:</span>
              <span className="text-2xl font-black text-orange-600 italic">{totalBill.toLocaleString()}đ</span>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}

export default TableOrderManager
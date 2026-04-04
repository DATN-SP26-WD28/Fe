import { AlarmClockCheck, CheckCheck, ClipboardCheck, CookingPot, Users, DollarSign, MoveHorizontal } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Empty, Modal, Spin, Tag, Button, Divider, message, Popconfirm, Select } from 'antd'
import { fetchTables } from '@/configs/table.api'
import orderAPI from '@/configs/order.api'
import paymentAPI from '@/configs/payment.api'
import { useOrderStatus } from '@/contexts/OrderStatusContext'
import {
  ORDER_ITEM_STATUS,
  ORDER_ITEM_STATUS_MAP,
  ORDER_PREPARING_STATUSES,
  ORDER_SERVED_STATUSES,
  normalizeOrderStatus,
} from '@/shared/constants/app.constants'

const getTableIdFromOrder = (order) => {
  const tableRef = order?.table_id
  if (!tableRef) return null
  if (typeof tableRef === 'string') return tableRef
  return tableRef._id || null
}

const aggregateItemStats = (orders = [], itemStatusById = {}) => {
  return orders.reduce(
    (acc, order) => {
      const items = Array.isArray(order?.items) ? order.items : []
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

const TableOrderManager = ({ refreshData }) => {
  const { orders, itemStatusById, refreshOrders } = useOrderStatus() // Thêm refreshOrders từ context
  const [tables, setTables] = useState([])
  const [tableItemStats, setTableItemStats] = useState({})
  const [open, setOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [modalOrders, setModalOrders] = useState([])
  const [modalLoading, setModalLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false)
  const [targetTableId, setTargetTableId] = useState(null)

  // LOGIC TÍNH TỔNG TIỀN QUAN TRỌNG: Chỉ tính các món 'served' (Đã phục vụ)
  const totalBill = useMemo(() => {
    return modalOrders.reduce((sum, order) => {
      const payableAmount = (order.items || []).reduce((acc, item) => {
        const status = normalizeOrderStatus(itemStatusById[item?._id] || item?.status);
        if (status === 'served' || status === 'Đã phục vụ') {
          return acc + (item.price * item.quantity);
        }
        return acc;
      }, 0);
      return sum + payableAmount;
    }, 0);
  }, [modalOrders, itemStatusById]);

  const loadTables = async () => {
    try {
      const res = await fetchTables()
      setTables(Array.isArray(res) ? res : [])
    } catch (error) { console.error(error) }
  }

  useEffect(() => { loadTables() }, [])

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
      } catch (error) { if (mounted) setTableItemStats({}) }
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
    } catch (error) { setModalOrders([]) } finally { setModalLoading(false) }
  }

  const handleCounterPayment = async () => {
    if (totalBill === 0) return message.warning("Không có món nào đã phục vụ để thanh toán!");
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
      if (refreshData) refreshData()
      if (refreshOrders) refreshOrders()
    } catch (error) { message.error("Không thể thực hiện thanh toán") } finally { setSubmitting(false) }
  }

  const handleSwitchTable = async () => {
    if (!targetTableId) return message.warning("Vui lòng chọn bàn muốn chuyển đến!")
    setSubmitting(true)
    try {
      await orderAPI.switchTable({ oldTableId: selectedTable._id, newTableId: targetTableId })
      message.success(`Đã chuyển bàn thành công!`)
      setIsSwitchModalOpen(false)
      setOpen(false)
      loadTables()
      if (refreshData) refreshData()
      if (refreshOrders) refreshOrders()
    } catch (error) { message.error("Lỗi khi chuyển bàn") } finally { setSubmitting(false) }
  }

  return (
    <>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {tables.map((table) => {
          const tableOrders = ordersByTable[String(table._id)] || []
          const isOccupied = tableOrders.some(order => order.items?.length > 0)
          const stats = tableItemStats[String(table._id)] || { pending: 0, preparing: 0, served: 0 }
          return (
            <div key={table._id} role='button' onClick={() => openTableModal(table)}
              className={`text-sm flex items-stretch gap-2 border p-2 rounded-md min-w-24 min-h-24 cursor-pointer transition-all ${isOccupied ? 'border-orange-400 bg-orange-50 shadow-sm' : 'border-gray-300 hover:border-blue-400'}`}>
              <section className='flex flex-col items-center justify-center gap-2 min-w-[50px]'>
                <div className='font-bold text-center text-lg'>{table.table_number}</div>
                <div className='flex items-center gap-1 text-gray-500'><Users size={14} /><span>{table.capacity || 0}</span></div>
              </section>
              <div className='shrink-0 w-px grow h-auto bg-gray-200'></div>
              {!isOccupied ? (
                <section className='flex flex-col items-center justify-center gap-1 grow text-gray-400'>
                  <ClipboardCheck size={20} /><span className='text-[10px] uppercase font-bold'>Trống</span>
                </section>
              ) : (
                <section className='flex flex-col justify-center gap-1 grow'>
                  <div className='flex items-center text-orange-600'><AlarmClockCheck size={14} /><span className='ml-2 font-bold text-xs'>{stats.pending}</span></div>
                  <div className='flex items-center text-blue-600'><CookingPot size={14} /><span className='ml-2 font-bold text-xs'>{stats.preparing}</span></div>
                  <div className='flex items-center text-green-600'><CheckCheck size={14} /><span className='ml-2 font-bold text-xs'>{stats.served}</span></div>
                </section>
              )}
            </div>
          )
        })}
      </div>

      <Modal open={open} width={700} onCancel={() => setOpen(false)}
        title={selectedTable ? `Chi tiết đơn hàng - Bàn ${selectedTable.table_number}` : 'Chi tiết'}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>Đóng</Button>,
          modalOrders.length > 0 && (
            <Button key="switch" icon={<MoveHorizontal size={16} />} onClick={() => setIsSwitchModalOpen(true)} className="border-blue-500 text-blue-500">
              Chuyển bàn
            </Button>
          ),
          modalOrders.length > 0 && (
            <Popconfirm key="pay" title={`Thanh toán ${totalBill.toLocaleString()}đ cho món đã phục vụ?`} onConfirm={handleCounterPayment}>
              <Button type="primary" danger icon={<DollarSign size={16} />} className="bg-orange-600">Thanh toán</Button>
            </Popconfirm>
          )
        ]}
      >
        {modalLoading ? <div className='py-8 flex justify-center'><Spin /></div> : modalOrders.length === 0 ? <Empty description='Bàn trống' /> : (
          <div className='flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-1'>
            {modalOrders.map((order) => {
              const codeTail = String(order?._id || '').slice(-6).toUpperCase();
              const payableItems = (order.items || []).filter(i => normalizeOrderStatus(itemStatusById[i._id] || i.status) === 'served' || i.status === 'Đã phục vụ');
              const otherItems = (order.items || []).filter(i => !payableItems.includes(i));

              return (
                <div key={order._id} className='border border-gray-200 rounded-xl p-4 bg-white shadow-sm'>
                  <div className='flex items-center justify-between mb-3'>
                    <Tag color="blue" className="rounded-full px-3 font-bold">ĐƠN #{codeTail}</Tag>
                    <span className="text-[10px] text-gray-400 font-mono">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</span>
                  </div>
                  <div className='space-y-3'>
                    {payableItems.map((item) => (
                      <div key={item._id} className='flex justify-between items-center'>
                        <div className="flex flex-col">
                          <span className='font-bold text-gray-700'>{item?.dish_id?.dish_name}</span>
                          <Tag color="green" className="w-fit text-[10px] mt-1">Đã phục vụ</Tag>
                        </div>
                        <div className="text-right">
                          <div className='text-xs text-gray-400'>x{item.quantity}</div>
                          <div className='font-black text-orange-500'>{(item.price * item.quantity).toLocaleString()}đ</div>
                        </div>
                      </div>
                    ))}
                    {otherItems.map((item) => {
                      const status = normalizeOrderStatus(itemStatusById[item._id] || item.status);
                      const isCancelled = status === 'cancelled' || status === 'Đã hủy';
                      return (
                        <div key={item._id} className='flex justify-between items-center opacity-50 bg-gray-50 p-2 rounded-lg border border-dashed'>
                          <div className="flex flex-col">
                            <span className={`text-xs ${isCancelled ? 'line-through text-red-400' : 'text-gray-500'}`}>{item?.dish_id?.dish_name}</span>
                            <span className={`text-[9px] font-bold uppercase ${isCancelled ? 'text-red-500' : 'text-blue-400'}`}>
                              {isCancelled ? 'Đã hủy (0đ)' : 'Đã huỷ'}
                            </span>
                          </div>
                          <span className='font-bold text-gray-400 text-xs'>0đ</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className='flex justify-between border-t border-gray-100 mt-4 pt-3'>
                    <span className='text-gray-400 text-[10px] uppercase font-black tracking-tighter'>Cộng món đã nhận:</span>
                    <span className='text-gray-800 font-black'>{payableItems.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()}đ</span>
                  </div>
                </div>
              )
            })}
            <Divider className="my-2" />
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-orange-100">
              <span className="text-gray-500 font-black text-xs uppercase tracking-widest">Tổng cộng cả bàn:</span>
              <span className="text-2xl font-black text-orange-600 italic">{totalBill.toLocaleString()}đ</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal title={<b>Chuyển từ bàn {selectedTable?.table_number} sang bàn...</b>} open={isSwitchModalOpen} onOk={handleSwitchTable} onCancel={() => setIsSwitchModalOpen(false)} confirmLoading={submitting} okText="Xác nhận chuyển" destroyOnClose>
        <div className="py-4">
          <p className="text-gray-500 mb-2 italic">Chỉ hiển thị các bàn đang trống hoàn toàn:</p>
          <Select placeholder="Chọn bàn mới" className="w-full" size="large" onChange={(val) => setTargetTableId(val)}
            options={tables.filter(t => t._id !== selectedTable?._id).filter(t => !(ordersByTable[String(t._id)]?.some(o => o.items?.length > 0))).map(t => ({ label: `Bàn số ${t.table_number} (Sức chứa: ${t.capacity})`, value: t._id }))}
          />
        </div>
      </Modal>
    </>
  )
}

export default TableOrderManager
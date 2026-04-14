import { ClipboardCheck, CookingPot, Users, ArrowLeftRight, Wallet, Clock, Check, ChefHat, Printer, ArrowDownUp } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Empty, Modal, Spin, Tag, Button, Divider, message, Popconfirm, Select, Table, Tooltip } from 'antd'
import { fetchTables } from '@/configs/table.api'
import orderAPI from '@/configs/order.api'
import paymentAPI from '@/configs/payment.api'
import { useOrderStatus } from '@/contexts/OrderStatusContext'
import { printElement } from '@/shared/utils/print'
import KitchenTicket from '../KitchenTicket'
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
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [currentPrintOrder, setCurrentPrintOrder] = useState(null)
  const [currentPrintOrderConfirmedItems, setCurrentPrintOrderConfirmedItems] = useState([])

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
      } catch { if (mounted) setTableItemStats({}) }
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
      const { data } = await orderAPI.getByTable(table._id)
      setModalOrders(Array.isArray(data) ? data : [])
    } catch { setModalOrders([]) } finally { setModalLoading(false) }
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
    } catch { message.error("Không thể thực hiện thanh toán") } finally { setSubmitting(false) }
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
    } catch { message.error("Lỗi khi chuyển bàn") } finally { setSubmitting(false) }
  }

  const handleOpenTicketPreview = (order, confirmedItems = []) => {
    setCurrentPrintOrder(order)
    setCurrentPrintOrderConfirmedItems(Array.isArray(confirmedItems) ? confirmedItems : [])
    setIsTicketModalOpen(true)
  }

  const handlePrintTicket = () => {
    printElement('kitchen-ticket-content', `Phieu_Bep_Ban_${selectedTable?.table_number}`)
  }

  const columns = [
    {
      title: 'Món ăn',
      dataIndex: ['dish_id', 'dish_name'],
      key: 'dish_name',
    },
    {
      title: 'Đơn giá',
      dataIndex: ['dish_id', 'price'],
      key: 'dish_price',
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        const status = normalizeOrderStatus(itemStatusById?.[record?._id] || record?.status || text)
        const map = ORDER_ITEM_STATUS_MAP[status] || { color: 'default', label: status }
        return <Tag color={map.color}>{map.label}</Tag>
      }
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
    },
  ];

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
              <section className='flex flex-col items-center justify-center gap-2 min-w-12.5'>
                <div className='font-bold text-center text-2xl'>B{table.table_number}</div>
                <div className='flex items-center gap-1 text-gray-500'><Users size={14} /><span>{table.capacity || 0}</span></div>
              </section>
              <div className='shrink-0 w-px grow h-auto bg-gray-200'></div>
              {!isOccupied ? (
                <section className='flex flex-col items-center justify-center gap-1 grow text-gray-400 min-w-12.5'>
                  <Tooltip title="Trống"><ClipboardCheck size={20} /></Tooltip><span className='text-sm'>Trống</span>
                </section>
              ) : (
                <section className='flex flex-col justify-center gap-1 grow min-w-12.5'>
                  <div className='flex items-center justify-between text-orange-600'><Tooltip title="Đang chờ"><Clock size={18} /></Tooltip><span className='ml-2 font-bold text-lg'>{stats.pending}</span></div>
                  <div className='flex items-center justify-between text-blue-600'><Tooltip title="Đang chuẩn bị"><CookingPot size={18} /></Tooltip><span className='ml-2 font-bold text-lg'>{stats.preparing}</span></div>
                  <div className='flex items-center justify-between text-green-600'><Tooltip title="Đã phục vụ"><Check size={18} /></Tooltip><span className='ml-2 font-bold text-lg'>{stats.served}</span></div>
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
            <Button key="switch" icon={<ArrowLeftRight size={16} />} onClick={() => setIsSwitchModalOpen(true)} className="border-blue-500 text-blue-500">
              Chuyển bàn
            </Button>
          ),
          modalOrders.length > 0 && (
            <Popconfirm key="pay" title={`Thanh toán ${totalBill.toLocaleString()}đ cho món đã phục vụ?`} onConfirm={handleCounterPayment}>
              <Button type="primary"><Wallet size={16} /> Thanh toán</Button>
            </Popconfirm>
          )
        ]}
      >
        {modalLoading ? <div className='py-8 flex justify-center'><Spin /></div> : modalOrders.length === 0 ? <Empty description='Bàn trống' /> : (
          <div className='gap-4 overflow-y-auto pr-1'>
            {modalOrders.map((order) => {
              const codeTail = String(order?._id || '').toUpperCase();
              const payableItems = (order.items || []).filter(i => normalizeOrderStatus(itemStatusById[i._id] || i.status) === 'served' || i.status === 'Đã phục vụ');
              {/* const otherItems = (order.items || []).filter(i => !payableItems.includes(i)); */ }
              const dataSource = order?.items ?? [];

              return (
                <div key={order._id} className='border border-gray-200 rounded-xl p-4 bg-white mb-6'>
                  <section className='flex items-start justify-between'>
                    <div className='flex flex-col gap-1.5 mb-3'>
                      <div className='text-gray-800'>Mã đơn:  <Tag color="blue" className="rounded-full px-3 font-bold">#{codeTail}</Tag></div>
                      <div className='text-gray-800'>Tên khách hàng: <span className='font-semibold'>{order?.guest_id?.username || 'Khách vãng lai'}</span></div>
                      <div className='text-gray-800'>Thời gian đặt: <span className='font-semibold'>{new Date(order.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span></div>
                      <div className='text-gray-800'>Cập nhật: <span className='font-semibold'>{new Date(order.updatedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span></div>
                      <div className='text-gray-800'>Tổng đơn đã phục vụ: <span className='font-bold text-orange-500'>{payableItems.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()}đ</span></div>
                    </div>
                            <div className='space-y-3'>
                              {(() => {
                                const confirmedItems = (order.items || []).filter(i => normalizeOrderStatus(itemStatusById[i._id] || i.status) === ORDER_ITEM_STATUS.confirmed)
                                return (
                                  <Button type="primary" disabled={confirmedItems.length === 0} onClick={() => handleOpenTicketPreview(order, confirmedItems)}><ChefHat size={16} />Phiếu gọi món</Button>
                                )
                              })()}
                            </div>
                  </section>
                  <section>
                    <Divider>Danh sách món ăn đã gọi</Divider>
                    <Table dataSource={dataSource} columns={columns} pagination={false} />
                  </section>
                </div>
              )
            })}
            <Divider className="my-2" />
            <div className="flex justify-between items-center bg-orange-50 p-4 rounded-xl border border-orange-100">
              <span className="text-gray-500 font-black text-xs uppercase">Tổng cộng:</span>
              <span className="text-2xl font-black text-orange-600 ">{totalBill.toLocaleString()}đ</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal title={<b>Chuyển bàn</b>} open={isSwitchModalOpen} onOk={handleSwitchTable} onCancel={() => setIsSwitchModalOpen(false)} confirmLoading={submitting} okText="Xác nhận chuyển" destroyOnClose cancelText="Hủy bỏ" centered>
        <div className="py-4">
          <div className='text-xl font-semibold'>Bàn hiện tại: <b>{selectedTable?.table_number}</b></div>
          <ArrowDownUp className='ml-6 my-4'/>
          <div className='text-xl font-semibold mt-2 mb-1'>Bàn mới:</div>
          <Select placeholder="Chọn bàn mới" className="w-full" size="large" onChange={(val) => setTargetTableId(val)}
            options={tables.filter(t => t._id !== selectedTable?._id).filter(t => !(ordersByTable[String(t._id)]?.some(o => o.items?.length > 0))).map(t => ({ label: `Bàn số ${t.table_number} (Sức chứa: ${t.capacity})`, value: t._id }))}
          />
        </div>
      </Modal>

      <Modal
        title={<b className='text-lg'>Xem trước phiếu gọi món</b>}
        destroyOnHidden
        open={isTicketModalOpen}
        onCancel={() => setIsTicketModalOpen(false)}
        footer={[
          <Button key="submit" type="primary" onClick={handlePrintTicket}><Printer size={16} /> In phiếu gọi món</Button>,
        ]}
        width={450}
        centered
      >
        {currentPrintOrder && (
          <KitchenTicket
            tableNumber={selectedTable?.table_number}
            orderId={currentPrintOrder._id}
            orderTime={new Date(currentPrintOrder.createdAt).toLocaleString('vi-VN', { 
              day: '2-digit', month: '2-digit', year: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            })}
            items={currentPrintOrderConfirmedItems}
            guestName={currentPrintOrder.guest_id?.username || 'Khách vãng lai'}
          />
        )}
      </Modal>
    </>
  )
}

export default TableOrderManager
import { AlarmClockCheck, CheckCheck, ClipboardCheck, CookingPot, Users } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Empty, Modal, Spin, Tag } from 'antd'
import { fetchTables } from '@/configs/table.api'
import orderAPI from '@/configs/order.api'

const statusTagMap = {
  pending: { color: 'gold', label: 'Chờ xử lý' },
  preparing: { color: 'blue', label: 'Đang nấu' },
  ready: { color: 'cyan', label: 'Sẵn sàng' },
  served: { color: 'green', label: 'Đã phục vụ' },
  completed: { color: 'success', label: 'Hoàn tất' },
  canceled: { color: 'red', label: 'Đã hủy' },
}

const getTableIdFromOrder = (order) => {
  const tableRef = order?.table_id
  if (!tableRef) return null
  if (typeof tableRef === 'string') return tableRef
  return tableRef._id || null
}

const normalizeStatus = (status) => String(status || '').trim().toLowerCase()

const aggregateItemStats = (orders = []) => {
  return orders.reduce(
    (acc, order) => {
      const orderStatus = normalizeStatus(order?.status)
      const items = Array.isArray(order?.items) ? order.items : []

      if (!items.length) {
        if (orderStatus === 'pending') acc.pending += 1
        else if (['preparing', 'ready'].includes(orderStatus)) acc.preparing += 1
        else if (['served', 'completed'].includes(orderStatus)) acc.served += 1
        return acc
      }

      items.forEach((item) => {
        const itemQty = Number(item?.quantity) || 0
        const itemStatus = normalizeStatus(item?.status)

        if (itemStatus === 'pending') acc.pending += itemQty
        else if (['in_progress', 'preparing', 'ready'].includes(itemStatus)) acc.preparing += itemQty
        else if (['served', 'completed'].includes(itemStatus)) acc.served += itemQty
      })

      return acc
    },
    { pending: 0, preparing: 0, served: 0 },
  )
}

const TableOrderManager = ({ orders = [] }) => {
  const [tables, setTables] = useState([])
  const [tableItemStats, setTableItemStats] = useState({})
  const [open, setOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [modalOrders, setModalOrders] = useState([])
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadTables = async () => {
      try {
        const res = await fetchTables()
        if (mounted) {
          setTables(Array.isArray(res) ? res : [])
        }
      } catch (error) {
        console.error(error)
        if (mounted) {
          setTables([])
        }
      }
    }

    loadTables()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!tables.length) {
      setTableItemStats({})
      return
    }

    let mounted = true

    const loadTableItemStats = async () => {
      try {
        const results = await Promise.all(
          tables.map(async (table) => {
            const res = await orderAPI.getByTable(table._id)
            const tableOrders = Array.isArray(res?.data) ? res.data : []
            return [String(table._id), aggregateItemStats(tableOrders)]
          }),
        )

        if (!mounted) return
        setTableItemStats(Object.fromEntries(results))
      } catch (error) {
        console.error(error)
        if (mounted) setTableItemStats({})
      }
    }

    loadTableItemStats()

    return () => {
      mounted = false
    }
  }, [tables, orders])

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
      console.error(error)
      setModalOrders([])
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <>
      {tables.map((table) => {
        const tableOrders = ordersByTable[String(table._id)] || []
        const isOccupied = tableOrders.length > 0
        const stats = tableItemStats[String(table._id)] || { pending: 0, preparing: 0, served: 0 }

        const pendingCount = stats.pending
        const preparingCount = stats.preparing
        const servedCount = stats.served

        return (
          <div
            key={table._id}
            className='text-sm flex items-stretch gap-2 border border-gray-300 p-2 rounded-md min-w-24 min-h-24 cursor-pointer'
            role='button'
            tabIndex={0}
            onClick={() => openTableModal(table)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                openTableModal(table)
              }
            }}
          >
            <section className='flex flex-col items-center justify-center gap-2'>
              <div className='font-semibold text-center text-lg'>
                {/* Tên bàn */}
                {table.table_number}
              </div>
              <div className='flex items-center gap-2'>
                <Users size={16} />
                <span>
                  {/* Số người */}
                  {table.capacity || 0}
                </span>
              </div>
            </section>
            <div className='shrink-0 w-px grow h-auto bg-gray-300'></div>

            {!isOccupied ? (
              <section className='flex flex-col items-center justify-center gap-2'>
                <ClipboardCheck size={16} />
                <span className='flex justify-between items-center text-sm'>Trống</span>
              </section>
            ) : (
              <section className='flex flex-col gap-2'>
                <div className='flex items-center'>
                  <AlarmClockCheck size={16} />
                  <span className='ml-2 font-semibold'>
                    {/* Số đơn chờ */}
                    {pendingCount}
                  </span>
                </div>
                <div className='flex items-center'>
                  <CookingPot size={16} />
                  <span className='ml-2 font-semibold'>
                    {/* Số đơn đang nấu */}
                    {preparingCount}
                  </span>
                </div>
                <div className='flex items-center'>
                  <CheckCheck size={16} />
                  <span className='ml-2 font-semibold'>
                    {/* Số đơn đã phục vụ */}
                    {servedCount}
                  </span>
                </div>
              </section>
            )}
          </div>
        )
      })}

      <Modal
        open={open}
        title={selectedTable ? `Chi tiết đơn hàng - Bàn ${selectedTable.table_number}` : 'Chi tiết đơn hàng'}
        footer={null}
        width={760}
        onCancel={() => {
          setOpen(false)
          setSelectedTable(null)
          setModalOrders([])
        }}
      >
        {modalLoading ? (
          <div className='py-8 flex justify-center'>
            <Spin />
          </div>
        ) : modalOrders.length === 0 ? (
          <Empty description='Chưa có đơn hàng' />
        ) : (
          <div className='flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1'>
            {modalOrders.map((order) => {
              const codeTail = String(order?._id || '').slice(-6).toUpperCase()
              const statusConfig = statusTagMap[order?.status] || {
                color: 'default',
                label: order?.status || 'Không rõ',
              }

              return (
                <div key={order._id} className='border border-gray-200 rounded-md p-3'>
                  <div className='flex items-center justify-between gap-2 mb-2'>
                    <div className='font-semibold'>Đơn #{codeTail}</div>
                    <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                  </div>

                  <div className='text-sm mb-2'>Ghi chú: {order?.note || (<i>Không có ghi chú</i>)}</div>

                  <div className='flex flex-col gap-1'>
                    {(order?.items || []).map((item) => (
                      <div key={item._id} className='text-sm flex items-center justify-between gap-2'>
                        <div>
                          <b>{item?.dish_id?.dish_name || '-'} </b>
                          <Tag color='volcano'>x{item?.quantity || 0}</Tag>
                        </div>
                        <span>{(item?.price || 0).toLocaleString()}đ</span>
                      </div>
                    ))}
                  </div>
                  <div className='flex items-center justify-between '>
                    <b>Tổng tiền:</b>
                    <span className='text-orange-500 font-bold'>{(order?.total_amount || 0).toLocaleString()}đ</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </>
  )
}

export default TableOrderManager
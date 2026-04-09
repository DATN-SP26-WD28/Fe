import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, message, Modal, Radio, Space, Empty, Tag, notification } from 'antd'
import { CreditCardOutlined, WalletOutlined, ArrowLeftOutlined, PlusOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'
import paymentAPI from '@/configs/payment.api'
import { useSocket } from '@/contexts/SocketContext'
import { ORDER_ITEM_STATUS_MAP, normalizeOrderStatus } from '@/shared/constants/app.constants'
import { SOCKET_EVENTS } from '@/shared/constants/socket.constants'
import { Dot } from 'lucide-react'

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ'

const OrdersPage = () => {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('vnpay')
  const [processPaymentLoading, setProcessPaymentLoading] = useState(false)
  const { socket, isConnected } = useSocket()
  const [notificationApi, notificationContextHolder] = notification.useNotification()
  const lastStatusEventRef = useRef('')
  const refreshTimeoutRef = useRef(null)

  const flattenedItems = useMemo(() => {
    return orders.flatMap(order =>
      (order.items || []).map(item => ({
        ...item,
        orderId: order._id,
        orderStatus: order.status,
        createdAt: order.createdAt
      }))
    )
  }, [orders])

  const groupedItems = useMemo(() => {
    const grouped = {}
    flattenedItems.forEach(item => {
      const dishId = item.dish_id?._id
      if (!dishId) return

      if (!grouped[dishId]) {
        grouped[dishId] = {
          ...item,
          quantity: 0
        }
      }
      grouped[dishId].quantity += item.quantity
    })
    return Object.values(grouped)
  }, [flattenedItems])

  const totalItems = useMemo(() => {
    return groupedItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [groupedItems])

  const grandTotal = useMemo(() => {
    return groupedItems.reduce((sum, item) => {
      const itemPrice = item.price || item.dish_id?.dish_price || 0
      return sum + (itemPrice * item.quantity)
    }, 0)
  }, [groupedItems])

  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderAPI.getByTable(tableId)
      setOrders(response.data)
    } catch (error) {
      if (error.response?.status !== 404) {
        message.error("Không thể tải danh sách đơn hàng")
      } else {
        setOrders([])
      }
    } finally {
      setLoading(false)
    }
  }, [tableId])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const scheduleFetchOrders = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    refreshTimeoutRef.current = setTimeout(() => {
      fetchOrders()
    }, 450)
  }, [fetchOrders])

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!socket || !isConnected || !tableId) return
    socket.emit(SOCKET_EVENTS.JOIN_TABLE, String(tableId))
  }, [socket, isConnected, tableId])

  useEffect(() => {
    if (!socket) return

    const onOrderCreated = (payload) => {
      const isSameTable =
        String(payload?.tableId || '') === String(tableId) ||
        String(payload?.tableNumber || '') === String(tableId)
      if (!isSameTable) return
      scheduleFetchOrders()
    }

    const onItemStatusUpdated = (payload) => {
      const isSameTable =
        String(payload?.tableId || '') === String(tableId) ||
        String(payload?.tableNumber || '') === String(tableId)
      if (!isSameTable) return

      const eventKey = `${payload?.itemId || ''}:${payload?.newStatus || ''}:${payload?.updatedAt || ''}`
      if (eventKey && lastStatusEventRef.current === eventKey) return
      lastStatusEventRef.current = eventKey

      const oldStatus = normalizeOrderStatus(payload.oldStatus)
      const newStatus = normalizeOrderStatus(payload.newStatus)
      if (oldStatus === newStatus) return
      const oldLabel = ORDER_ITEM_STATUS_MAP[oldStatus]?.label || oldStatus
      const newLabel = ORDER_ITEM_STATUS_MAP[newStatus]?.label || newStatus

      notificationApi.info({
        message: 'Món ăn đã đổi trạng thái',
        description: `${oldLabel} -> ${newLabel}`,
        placement: 'topRight',
      })

      scheduleFetchOrders()
    }

    socket.on(SOCKET_EVENTS.ORDER_CREATED, onOrderCreated)
    socket.on(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED, onItemStatusUpdated)

    return () => {
      socket.off(SOCKET_EVENTS.ORDER_CREATED, onOrderCreated)
      socket.off(SOCKET_EVENTS.ORDER_ITEM_STATUS_UPDATED, onItemStatusUpdated)
    }
  }, [socket, tableId, scheduleFetchOrders, notificationApi])

  useEffect(() => {
    if (isConnected) return
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [isConnected, fetchOrders])

  const handleProcessPayment = async () => {
    try {
      setProcessPaymentLoading(true)
      if (paymentMethod === 'vnpay') {
        const res = await paymentAPI.createUrl({
          table_id: tableId,
          amount: grandTotal
        })
        const url = res.data?.paymentUrl || res.paymentUrl
        if (url) {
          message.loading("Đang kết nối đến VNPay...", 1.5)
          setTimeout(() => {
            window.location.href = url
          }, 1000)
        } else {
          console.log("Cấu trúc res nhận được:", res)
          message.error("Không nhận được link từ hệ thống (Sai cấu trúc data)")
        }
      } else if (paymentMethod === 'cash') {
        message.success('Gọi nhân viên để thanh toán tiền mặt')
        setIsPayModalOpen(false)
      }
    } catch (error) {
      console.error("Lỗi:", error)
      message.error("Có lỗi xảy ra khi tạo giao dịch")
    } finally {
      setProcessPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <>
      {notificationContextHolder}
      <div className="min-h-screen bg-white text-slate-900">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-start gap-5 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              <ArrowLeftOutlined className="text-lg" />
            </button>
            <h1 className="text-3xl font-semibold text-slate-800">Đơn hàng của bạn</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 pb-40">
        <div className='flex items-center mb-4'>
          <Tag color="orange" className="text-sm font-semibold">
            <span>Bàn {tableId}</span>
          </Tag>
          <Dot size={16} />
          <span className="text-xs text-slate-700">Mã đơn: #{orders[0]?._id?.slice(-6).toUpperCase() || 'N/A'}</span>
        </div>
        {flattenedItems.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-200 text-center">
            <Empty
              description={
                <div>
                  <p className="mt-4 text-base font-semibold text-slate-900">Chưa có đơn hàng nào</p>
                  <p className="mt-2 text-sm text-slate-500">Thêm món ngay để bắt đầu gọi đồ ăn</p>
                </div>
              }
              style={{ marginBottom: 0 }}
            />
            <button
              onClick={() => navigate(`/table-order/${tableId}/menu`)}
              className="mt-8 inline-flex rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-600 transition-all"
            >
              <PlusOutlined className="mr-2" /> Gọi thêm món
            </button>
          </div>
        ) : (
          <>
            {/* Items Section */}
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className='flex justify-between items-center'>
                <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-widest">Chi tiết món ăn</h3>
                <div className="text-xs text-orange-500 font-semibold mb-4">{totalItems} món</div>
              </div>
              <div className="space-y-4">
                {groupedItems.map((item, idx) => {
                  const itemPrice = item.price || item.dish_id?.dish_price || 0
                  const itemTotal = itemPrice * item.quantity
                  const dishImage = item.dish_id?.image_url || 'https://via.placeholder.com/80?text=Món+ăn'
                  return (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-b-0">
                      {/* Image */}
                      <div className="shrink-0">
                        <img
                          src={dishImage}
                          alt={item.dish_id?.dish_name || 'Món ăn'}
                          className="h-24 w-24 rounded-lg object-cover border border-slate-200"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{item.dish_id?.dish_name || 'Món ăn'}</p>
                          <span className="inline-block text-sm text-slate-600">
                            Số lượng: {item.quantity}
                          </span>
                          <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.dish_id.description || 'Chưa có ghi chú'}</p>
                          <p>
                            Trạng thái: <Tag>{ORDER_ITEM_STATUS_MAP[normalizeOrderStatus(item.status)]?.label || item.status || 'Chưa xác định'}</Tag>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-3">

                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-slate-900 text-base">{formatCurrency(itemTotal)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="rounded-2xl bg-linear-to-br from-orange-50 to-orange-100/50 p-6 shadow-sm border border-orange-200">
              <div className=" border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Tổng cộng</span>
                  <span className="text-2xl font-black text-orange-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Action Bar */}
      {flattenedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex gap-3 py-4">
              <button
                onClick={() => navigate(`/table-order/${tableId}/menu`)}
                className="flex-1 h-12 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Gọi thêm món
              </button>
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="flex-1 h-12 rounded-lg bg-linear-to-r from-orange-500 to-orange-600 text-sm font-bold text-white hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CreditCardOutlined className="text-xl text-orange-500" />
            <span className="font-bold text-slate-900">Chọn phương thức thanh toán</span>
          </div>
        }
        open={isPayModalOpen}
        onCancel={() => setIsPayModalOpen(false)}
        onOk={handleProcessPayment}
        okText="Xác nhận thanh toán"
        okButtonProps={{
          className: 'bg-orange-500 hover:bg-orange-600 h-10 font-bold',
          loading: processPaymentLoading
        }}
        cancelText={"Hủy bỏ"}
        width={480}
        centered
      >
        <div className="mt-6">
          <Radio.Group
            onChange={(e) => setPaymentMethod(e.target.value)}
            value={paymentMethod}
            className="w-full"
          >
            <Space direction="vertical" className="w-full" style={{ gap: '12px' }}>
              <div className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <Radio value="vnpay" className="w-full">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <CreditCardOutlined className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">VNPAY</p>
                      <p className="text-xs text-slate-500">Ngân hàng, ví điện tử, QR Code</p>
                    </div>
                  </div>
                </Radio>
              </div>
              <div className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <Radio value="cash" className="w-full">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <WalletOutlined className="text-xl text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Thanh toán tiền mặt</p>
                      <p className="text-xs text-slate-500">Thanh toán trực tiếp nhân viên</p>
                    </div>
                  </div>
                </Radio>
              </div>
            </Space>
          </Radio.Group>
          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Tổng số tiền thanh toán: <span className="text-orange-600">{formatCurrency(grandTotal)}</span>
            </p>
          </div>
        </div>
      </Modal>
      </div>
    </>
  )
}

export default OrdersPage
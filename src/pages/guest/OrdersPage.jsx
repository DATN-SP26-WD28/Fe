import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, message, Modal, Radio, Space, Empty } from 'antd'
import { CreditCardOutlined, WalletOutlined, ArrowLeftOutlined, PlusOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'
import paymentAPI from '@/configs/payment.api'

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ'

const OrdersPage = () => {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('vnpay')
  const [processPaymentLoading, setProcessPaymentLoading] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  const grandTotal = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  }, [orders])

  const completedCount = useMemo(() => {
    return orders.filter(o => o.status === 'completed').length
  }, [orders])

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
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

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

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Bếp đã nhận',
        icon: <ClockCircleOutlined />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        dotColor: 'bg-blue-400'
      },
      confirmed: {
        label: 'Đang nấu',
        icon: <ClockCircleOutlined />,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        dotColor: 'bg-amber-400'
      },
      completed: {
        label: 'Hoàn thành',
        icon: <CheckCircleOutlined />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        dotColor: 'bg-green-400'
      },
      cancelled: {
        label: 'Đã hủy',
        icon: null,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        dotColor: 'bg-red-400'
      }
    }
    return configs[status] || configs.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105 transition-all duration-200"
            >
              <ArrowLeftOutlined className="text-lg" />
            </button>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Bàn {tableId}</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">Danh sách đơn hàng</h1>
            </div>
            <div className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 pb-32">
        {/* Header Card */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/50 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tổng quan</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:flex sm:gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Số đơn</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{orders.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Hoàn thành</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/table-order/${tableId}/menu`)}
            className="mt-6 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-600 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <PlusOutlined /> Gọi thêm
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-200/50 text-center">
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
              className="mt-8 inline-flex rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-600 transition-all duration-200"
            >
              <PlusOutlined className="mr-2" /> Gọi thêm món
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const total = order.total_amount || 0
              const orderTime = new Date(order.createdAt).toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
              const itemSummary = order.items?.map((it) => `${it.quantity}x ${it.dish_id?.dish_name || 'Món ăn'}`).join(', ')
              const statusConfig = getStatusConfig(order.status)
              const isExpanded = expandedOrderId === order._id

              return (
                <div key={order._id} className="space-y-0">
                  <div 
                    onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                    className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor} border`}>
                            <span className={`h-2 w-2 rounded-full ${statusConfig.dotColor}`} />
                            {statusConfig.label}
                          </span>
                        </div>
                        <h3 className="mt-3 text-lg font-bold text-slate-900">{order.items?.length || 0} {order.items?.length === 1 ? 'món' : 'món'}</h3>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{itemSummary || 'Chưa có sản phẩm'}</p>
                      </div>
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <div className="rounded-xl bg-orange-50 px-4 py-3 text-right border border-orange-100">
                          <p className="text-xs font-medium uppercase tracking-widest text-orange-600">Tổng</p>
                          <p className="mt-1 text-xl font-black text-orange-600">{formatCurrency(total)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <span>🕐 {orderTime}</span>
                      <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="bg-slate-50 border border-t-0 border-slate-200/50 rounded-b-2xl p-5 animate-in fade-in duration-300">
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Chi tiết đơn hàng</h4>
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-2">
                            {order.items.map((item, idx) => {
                              const itemPrice = item.dish_id?.dish_price || 0
                              const itemTotal = itemPrice * item.quantity
                              return (
                                <div key={idx} className="flex items-start justify-between gap-3 rounded-lg bg-white p-3 border border-slate-100">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm">{item.dish_id?.dish_name || 'Món ăn'}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {item.quantity}x {formatCurrency(itemPrice)}
                                    </p>
                                    {item.dish_id?.description && (
                                      <p className="mt-1 text-xs text-slate-400 line-clamp-1">{item.dish_id.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right min-w-max">
                                    <p className="font-bold text-orange-600 text-sm">{formatCurrency(itemTotal)}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">Không có sản phẩm</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {orders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 px-5 py-4 border border-orange-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Tổng cộng</p>
                <p className="mt-1.5 text-2xl font-black text-orange-600">{formatCurrency(grandTotal)}</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate(`/table-order/${tableId}/menu`)}
                  className="flex-1 sm:flex-none h-12 rounded-xl bg-slate-100 px-6 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200 hover:scale-105 transition-all duration-200"
                >
                  <PlusOutlined className="mr-2" /> Gọi thêm
                </button>
                <button
                  onClick={() => setIsPayModalOpen(true)}
                  className="flex-1 sm:flex-none h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 hover:scale-105 transition-all duration-200"
                >
                  💳 Thanh toán
                </button>
              </div>
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
        cancelText="Bỏ qua"
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
                      <p className="font-bold text-slate-900">VNPay Online</p>
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
                      <p className="font-bold text-slate-900">Tiền mặt</p>
                      <p className="text-xs text-slate-500">Thanh toán trực tiếp nhân viên</p>
                    </div>
                  </div>
                </Radio>
              </div>
            </Space>
          </Radio.Group>
          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-semibold text-amber-900">
              💡 Tổng số tiền thanh toán: <span className="text-orange-600">{formatCurrency(grandTotal)}</span>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default OrdersPage
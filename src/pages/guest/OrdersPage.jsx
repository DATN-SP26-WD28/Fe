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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              <ArrowLeftOutlined className="text-lg" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Bàn {tableId}</p>
              <p className="text-xs text-slate-500">Mã đơn: #{orders[0]?._id?.slice(-6).toUpperCase() || 'N/A'}</p>
            </div>
            <div className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 pb-40">
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
              <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-widest">Chi tiết món ăn</h3>
              <div className="text-xs text-slate-500 mb-4">{totalItems} món</div>
              <div className="space-y-4">
                {groupedItems.map((item, idx) => {
                  const itemPrice = item.price || item.dish_id?.dish_price || 0
                  const itemTotal = itemPrice * item.quantity
                  const dishImage = item.dish_id?.image_url || 'https://via.placeholder.com/80?text=Món+ăn'
                  return (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-b-0">
                      {/* Image */}
                      <div className="flex-shrink-0">
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
                          {item.dish_id?.description && (
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.dish_id.description}</p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {item.quantity}x
                          </span>
                          <span className="text-sm font-bold text-orange-600">{formatCurrency(itemPrice)}</span>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-orange-600 text-base">{formatCurrency(itemTotal)}</p>
                        <p className="text-xs text-slate-400 mt-1">tổng</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 shadow-sm border border-orange-200">
              <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-widest">Tổng tất thanh toán</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Tạm tính</span>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(grandTotal * 0.95)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Phí dịch vụ (5%)</span>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(grandTotal * 0.05)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">VAT (8%)</span>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(grandTotal * 0.08)}</span>
                </div>
              </div>
              <div className="border-t border-orange-200 pt-4">
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
                className="flex-1 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-sm font-bold text-white hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                💳 Thanh toán
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
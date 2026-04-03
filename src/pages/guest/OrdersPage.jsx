import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, message, Modal, Radio, Space } from 'antd'
import { ArrowLeftOutlined, CreditCardOutlined, WalletOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'
import paymentAPI from '@/configs/payment.api'
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ'

const OrdersPage = () => {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState({})
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('vnpay')

  // 1. Tính tổng cộng tất cả các hóa đơn đang hiển thị
  const grandTotal = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  }, [orders])

  const fetchOrders = async () => {
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
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [tableId])

  // 2. Hàm xử lý thanh toán

  const handleProcessPayment = async () => {
    try {
      if (paymentMethod === 'vnpay') {
        const res = await paymentAPI.createUrl({
          table_id: tableId,
          amount: grandTotal
        });

        // Kiểm tra cả hai trường hợp: res.data.paymentUrl hoặc res.paymentUrl
        // Vì tùy vào axiosClient của bạn có tự .data hay không
        const url = res.data?.paymentUrl || res.paymentUrl;

        if (url) {
          message.loading("Đang kết nối đến VNPay...", 1.5);
          setTimeout(() => {
            window.location.href = url;
          }, 1000);
        } else {
          // Log ra để xem thực tế res đang chứa cái gì nếu vẫn lỗi
          console.log("Cấu trúc res nhận được:", res);
          message.error("Không nhận được link từ hệ thống (Sai cấu trúc data)");
        }
      }
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Có lỗi xảy ra khi tạo giao dịch");
    }
  };

  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }))

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-600'
      case 'confirmed': return 'bg-blue-100 text-blue-600'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status) => {
    const map = { pending: 'Bếp đã nhận', confirmed: 'Đang nấu', completed: 'Hoàn thành', cancelled: 'Đã hủy' }
    return map[status] || status
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>

  return (
    <div className="p-4 max-w-[980px] mx-auto pb-40">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeftOutlined className="text-xl" /></button>
        <h1 className="text-2xl font-black uppercase text-gray-800">Món đã gọi</h1>
      </div>

      {/* Danh sách Order */}
      <div className="space-y-4">
        {orders.map((order) => {
          const total = order.total_amount || 0
          const timeFormatted = new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          return (
            <div key={order._id} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm transition-all">
              <div className="flex items-center justify-between gap-4">
                <div onClick={() => toggle(order._id)} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {order._id.slice(-6).toUpperCase()}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-xs text-gray-500 font-medium">{timeFormatted}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-gray-800">{order.items?.length || 0} món</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-base font-black text-orange-500 italic">{formatCurrency(total)}</span>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${getStatusStyle(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {open[order._id] && (
                <div className="mt-4 border-t border-dashed border-gray-100 pt-4 space-y-4">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex gap-3 text-sm">
                        <span className="font-bold text-orange-600">x{it.quantity}</span>
                        <span className="font-bold text-gray-800">{it.dish_id?.dish_name || "Món ăn"}</span>
                      </div>
                      <div className="text-sm font-black text-gray-700">{formatCurrency(it.price * it.quantity)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom Bar: Tổng tiền & Nút bấm */}
      {orders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
          <div className="max-w-[980px] mx-auto">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Tổng cộng tạm tính:</span>
              <span className="text-2xl font-black text-orange-500 italic">{formatCurrency(grandTotal)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/table-order/${tableId}/menu`)}
                className="flex-1 h-14 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Gọi thêm
              </button>
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="flex-[1.5] h-14 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-orange-200 active:scale-95 transition-all"
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chọn phương thức thanh toán */}
      <Modal
        title={<span className="font-black uppercase tracking-tight">Chọn phương thức trả tiền</span>}
        open={isPayModalOpen}
        onCancel={() => setIsPayModalOpen(false)}
        onOk={handleProcessPayment}
        okText="Xác nhận"
        cancelText="Để sau"
        okButtonProps={{ className: 'bg-orange-500 h-10 font-bold uppercase' }}
      >
        <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod} className="w-full mt-4">
          <Space direction="vertical" className="w-full">
            <Radio value="vnpay" className="border p-4 rounded-xl w-full flex items-center">
              <div className="flex items-center gap-3">
                <CreditCardOutlined className="text-blue-500 text-xl" />
                <div>
                  <div className="font-bold">VNPay Online</div>
                  <div className="text-[10px] text-gray-400">Thanh toán qua ngân hàng, ví điện tử</div>
                </div>
              </div>
            </Radio>
            <Radio value="cash" className="border p-4 rounded-xl w-full flex items-center">
              <div className="flex items-center gap-3">
                <WalletOutlined className="text-orange-500 text-xl" />
                <div>
                  <div className="font-bold">Tiền mặt tại quầy</div>
                  <div className="text-[10px] text-gray-400">Gọi nhân viên đến hỗ trợ thanh toán</div>
                </div>
              </div>
            </Radio>
          </Space>
        </Radio.Group>
      </Modal>
    </div>
  )
}

export default OrdersPage
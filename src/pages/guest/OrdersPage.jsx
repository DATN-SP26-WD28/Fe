import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ'

const OrdersPage = () => {
  const { tableId } = useParams() // tableId lấy từ URL (ví dụ: "1")
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState({})

  // 1. Hàm lấy dữ liệu từ Server (SỬA LOGIC Ở ĐÂY)
  const fetchOrders = async () => {
    try {
      // Gọi API truyền tableId (số bàn) trực tiếp lên Backend mới
      const response = await orderAPI.getByTable(tableId)

      // Backend mới đã sort sẵn, nhưng nếu bạn muốn đảo ngược lại thì giữ reverse()
      // Lưu ý: response.data lúc này là mảng ordersWithItems từ Backend
      setOrders(response.data)
    } catch (error) {
      console.error("Lỗi fetch đơn hàng:", error)
      // Chỉ hiện lỗi khi không phải lỗi 404 (chưa có đơn)
      if (error.response?.status !== 404) {
        message.error("Không thể tải danh sách đơn hàng")
      } else {
        setOrders([]) // Nếu 404 thì coi như chưa có đơn nào
      }
    } finally {
      setLoading(false)
    }
  }

  // 2. Tự động cập nhật mỗi 10 giây
  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [tableId])

  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }))

  // 3. Hàm hiển thị màu sắc theo trạng thái đơn hàng (Giữ nguyên)
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
    const map = {
      pending: 'Bếp đã nhận',
      confirmed: 'Đang chế biến',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    }
    return map[status] || status
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" tip="Đang tải đơn hàng..." /></div>

  return (
    <div className="p-4 max-w-[980px] mx-auto pb-24">
      {/* Header điều hướng */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeftOutlined className="text-xl" />
        </button>
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-800">Món đã gọi</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          // Lấy total_amount đã được Backend tính sẵn hoặc dùng total_price tùy Schema
          const total = order.total_amount || 0
          const statusStyle = getStatusStyle(order.status)
          const timeFormatted = new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

          return (
            <div
              key={order._id}
              className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm transition-all overflow-hidden"
            >
              <div className="flex items-center justify-between gap-4">
                <div onClick={() => toggle(order._id)} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      ID: {order._id.slice(-6).toUpperCase()}
                    </p>
                    <span className="text-gray-300">•</span>
                    <p className="text-xs text-gray-500 font-medium">{timeFormatted}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-gray-800">{order.items?.length || 0} món</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-base font-black text-orange-500 italic">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${statusStyle}`}>
                    {getStatusText(order.status)}
                  </span>

                  <button
                    onClick={() => toggle(order._id)}
                    className={`p-2 rounded-lg bg-gray-50 text-gray-400 transition-transform ${open[order._id] ? 'rotate-90' : ''}`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chi tiết từng món trong đơn */}
              {open[order._id] && (
                <div className="mt-4 border-t border-dashed border-gray-100 pt-4 space-y-4 animate-fadeIn">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center font-bold text-orange-600 text-xs">
                          x{it.quantity}
                        </div>
                        <div>
                          {/* SỬA LOGIC HIỂN THỊ: Dùng dish_name thay vì name để khớp Backend */}
                          <div className="font-bold text-gray-800 text-sm">{it.dish_id?.dish_name || "Món ăn"}</div>
                          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                            Đơn giá: {formatCurrency(it.price)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-black text-gray-700">{formatCurrency(it.price * it.quantity)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {orders.length === 0 && (
          <div className="mt-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Bạn chưa gọi món nào</p>
            <button
              onClick={() => navigate(`/table-order/${tableId}/menu`)}
              className="mt-4 text-orange-500 font-black text-sm uppercase underline"
            >
              Quay lại thực đơn
            </button>
          </div>
        )}
      </div>

      {/* Nút gọi thêm món cố định ở dưới */}
      <div className="fixed bottom-20 left-4 right-4 z-40">
        <button
          onClick={() => navigate(`/table-order/${tableId}/menu`)}
          className="w-full h-14 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-orange-200 active:scale-95 transition-all"
        >
          Gọi thêm món
        </button>
      </div>
    </div>
  )
}

export default OrdersPage
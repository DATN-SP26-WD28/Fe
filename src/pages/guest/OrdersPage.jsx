import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, message, Modal, Radio, Space, Tag } from 'antd'
import { ArrowLeftOutlined, CreditCardOutlined, WalletOutlined, LoadingOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'
import paymentAPI from '@/configs/payment.api'
import {
  ORDER_ITEM_STATUS_MAP,
  normalizeOrderStatus
} from '@/shared/constants/app.constants'

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ'

const OrdersPage = () => {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('vnpay')

  // 1. LOGIC TÍNH TỔNG TẠM TÍNH: Tính tất cả trừ món 'cancelled'

  const grandTotal = useMemo(() => {
    return orders.reduce((sum, order) => {
      // Tính lại tổng tiền của mỗi Order dựa trên từng Item
      const orderActualTotal = (order.items || []).reduce((acc, item) => {
        const status = normalizeOrderStatus(item.status);

        // CHỈ CỘNG TIỀN: Nếu món không phải trạng thái Hủy
        if (status !== 'canceled' && status !== 'Đã hủy') {
          return acc + (Number(item.price) * Number(item.quantity));
        }
        return acc;
      }, 0);

      return sum + orderActualTotal;
    }, 0);
  }, [orders]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderAPI.getByTable(tableId)
      // Giả sử API trả về { data: [...] } hoặc trực tiếp [...]
      setOrders(Array.isArray(response.data) ? response.data : response || [])
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
    // Polling mỗi 5 giây để cập nhật trạng thái món ăn từ bếp
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [tableId])

  const handleProcessPayment = async () => {
    if (grandTotal === 0) return message.warning("Không có món nào để thanh toán!");

    try {
      setProcessPaymentLoading(true)
      if (paymentMethod === 'vnpay') {
        const res = await paymentAPI.createUrl({
          table_id: tableId,
          amount: grandTotal
        });

        const url = res.data?.paymentUrl || res.paymentUrl;
        if (url) {
          message.loading("Đang chuyển hướng đến VNPay...", 1.5);
          setTimeout(() => { window.location.href = url; }, 1000);
        } else {
          message.error("Lỗi cấu hình thanh toán VNPay");
        }
      } else {
        // Gửi yêu cầu gọi nhân viên cho phương thức tiền mặt
        message.success("Đã gửi yêu cầu thanh toán! Nhân viên sẽ đến hỗ trợ bạn ngay.");
        setIsPayModalOpen(false);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi xử lý giao dịch");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#f07f29' }} spin />} />
      <p className="mt-4 font-bold text-gray-400 animate-pulse uppercase text-[10px] tracking-widest">Đang tải đơn hàng...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      {/* Top Header Fixed */}
      <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center gap-3 z-50">
        <button onClick={() => navigate(-1)} className="p-2 active:bg-gray-100 rounded-full transition-all">
          <ArrowLeftOutlined className="text-xl" />
        </button>
        <h1 className="text-xl font-black uppercase text-gray-800 tracking-tight italic">Chi tiết đơn đã gọi</h1>
      </div>

      <div className="p-4 max-w-[600px] mx-auto space-y-4">
        {orders.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-bold italic">Bạn chưa gọi món nào</div>
        ) : orders.map((order) => {
          const codeTail = String(order?._id || '').slice(-6).toUpperCase()
          const time = new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={order._id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">ĐƠN #{codeTail}</div>
                  <div className="text-[10px] text-gray-400 font-bold italic">{time}</div>
                </div>
                <Tag color="orange" className="m-0 border-none rounded-full px-3 text-[10px] font-black uppercase italic">
                  Bếp đã nhận
                </Tag>
              </div>

              {/* Items List - LUÔN HIỆN */}
              <div className="space-y-4">
                {(order.items || []).map((it, idx) => {
                  const status = normalizeOrderStatus(it.status);
                  const isCancelled = status === 'cancelled' || status === 'Đã hủy';
                  const statusConfig = ORDER_ITEM_STATUS_MAP[status] || { label: status, color: 'default' };

                  return (
                    <div key={idx} className={`flex justify-between items-start ${isCancelled ? 'opacity-40' : ''}`}>
                      <div className="flex-1 pr-4">
                        <div className="flex gap-2 items-center mb-1">
                          <span className="font-black text-orange-500">x{it.quantity}</span>
                          <span className={`font-bold text-gray-800 ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                            {it.dish_id?.dish_name || "Món ăn"}
                          </span>
                        </div>
                        {/* THEO DÕI TIẾN ĐỘ TỪNG MÓN */}
                        <Tag color={statusConfig.color} className="text-[8px] font-black uppercase border-none rounded-sm px-1 py-0">
                          {statusConfig.label}
                        </Tag>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-sm ${isCancelled ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatCurrency(isCancelled ? 0 : it.price * it.quantity)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Bar: Tổng tiền & Nút bấm */}
      {orders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
          <div className="max-w-[600px] mx-auto">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">Tổng cộng tạm tính:</span>
              <span className="text-2xl font-black text-orange-500 italic">{formatCurrency(grandTotal)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/table-order/${tableId}/menu`)}
                className="flex-1 h-14 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
              >
                Gọi thêm món
              </button>
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="flex-[2] h-14 bg-orange-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200 active:scale-95 transition-all"
              >
                💳 Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        title={<div className="font-black uppercase text-center italic tracking-tight pt-2">Thanh toán</div>}
        open={isPayModalOpen}
        onCancel={() => setIsPayModalOpen(false)}
        onOk={handleProcessPayment}
        okText="Xác nhận"
        cancelText="Quay lại"
        okButtonProps={{ className: 'bg-orange-500 h-10 font-bold uppercase rounded-xl border-none shadow-orange-200' }}
        cancelButtonProps={{ className: 'rounded-xl h-10 font-bold' }}
        centered
      >
        <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod} className="w-full mt-4">
          <Space direction="vertical" className="w-full">
            <Radio value="vnpay" className="border border-gray-100 p-4 rounded-2xl w-full flex items-center hover:border-orange-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><CreditCardOutlined className="text-blue-500 text-xl" /></div>
                <div>
                  <div className="font-black text-xs uppercase italic">VNPay Online</div>
                  <div className="text-[10px] text-gray-400 font-bold">ATM, Ví điện tử, QR Code</div>
                </div>
              </div>
            </Radio>
            <Radio value="cash" className="border border-gray-100 p-4 rounded-2xl w-full flex items-center hover:border-orange-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><WalletOutlined className="text-orange-500 text-xl" /></div>
                <div>
                  <div className="font-black text-xs uppercase italic">Tiền mặt</div>
                  <div className="text-[10px] text-gray-400 font-bold">Thanh toán trực tiếp tại quầy</div>
                </div>
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
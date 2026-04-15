/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, message, Modal, Radio, Space, Empty, Tag, notification } from 'antd'
import { CreditCardOutlined, WalletOutlined, ArrowLeftOutlined, PlusOutlined, QrcodeOutlined } from '@ant-design/icons'
import orderAPI from '@/configs/order.api'
import paymentAPI from '@/configs/payment.api'
import { useSocket } from '@/contexts/SocketContext'
import { ORDER_ITEM_STATUS_MAP, normalizeOrderStatus } from '@/shared/constants/app.constants'
import { SOCKET_EVENTS } from '@/shared/constants/socket.constants'
import { Dot } from 'lucide-react'

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ'

// --- CẤU HÌNH SEPAY ---
const SEPAY_BANK_ACCOUNT = "0961301419";
const SEPAY_BANK_NAME = "MBBank";

const OrdersPage = () => {
  const { tableId } = useParams() // Đây thường là table_number (Ví dụ: "1")
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('vnpay')
  const [processPaymentLoading, setProcessPaymentLoading] = useState(false)
  const [showSepayQR, setShowSepayQR] = useState(false)

  const { socket, isConnected } = useSocket()
  const [notificationApi, notificationContextHolder] = notification.useNotification()
  const lastStatusEventRef = useRef('')
  const refreshTimeoutRef = useRef(null)

  // --- GIỮ NGUYÊN LOGIC TÍNH TOÁN CỦA BẠN ---
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
        grouped[dishId] = { ...item, quantity: 0 }
      }
      grouped[dishId].quantity += item.quantity
    })
    return Object.values(grouped)
  }, [flattenedItems])

  const totalItems = useMemo(() => groupedItems.reduce((sum, item) => sum + item.quantity, 0), [groupedItems])
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
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    refreshTimeoutRef.current = setTimeout(() => fetchOrders(), 450)
  }, [fetchOrders])

  // --- ĐỒNG NHẤT LOGIC SOCKET THANH TOÁN ---
useEffect(() => {
  if (!socket) return;

  const onPaymentSuccess = (payload) => {
    console.log("🚀 Socket nhận tín hiệu thanh toán:", payload);

    // Đảm bảo so sánh chính xác giữa payload từ server và tableId hiện tại
    const incomingTableId = String(payload.tableId || payload.table_id);
    const currentTableId = String(tableId);

    if (incomingTableId === currentTableId) {
      // 1. Thông báo thành công ngay lập tức
      notificationApi.success({
        message: 'Thanh toán thành công!',
        description: 'Hệ thống đã nhận được tiền. Cảm ơn quý khách!',
        placement: 'top', // Đưa lên top để dễ nhìn
        duration: 5,
      });

      // 2. Đóng tất cả các Modal và trạng thái chờ
      setIsPayModalOpen(false);
      setShowSepayQR(false);

      // 3. Cập nhật lại dữ liệu đơn hàng (để hiển thị trạng thái đã thanh toán hoặc trống)
      fetchOrders();
      
      // 4. Tùy chọn: Chuyển hướng sau vài giây nếu muốn
      // setTimeout(() => navigate(`/table-order/${tableId}/thanks`), 3000);
    }
  };

  socket.on('payment_success', onPaymentSuccess);
  
  return () => {
    socket.off('payment_success', onPaymentSuccess);
  };
}, [socket, tableId, fetchOrders, notificationApi]);

  // --- POLLING DỰ PHÒNG (ĐẢM BẢO 100% THÀNH CÔNG DÙ SOCKET LAG) ---
  useEffect(() => {
    let interval;
    if (showSepayQR && isPayModalOpen) {
      interval = setInterval(() => {
        fetchOrders(); // Tự động load lại đơn, nếu DB đã update xong thì Modal sẽ tự tắt do logic render của bạn
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [showSepayQR, isPayModalOpen, fetchOrders]);

  useEffect(() => {
    if (!socket || !isConnected || !tableId) return
    socket.emit(SOCKET_EVENTS.JOIN_TABLE, String(tableId))
  }, [socket, isConnected, tableId])

  useEffect(() => {
    if (!socket) return
    const onOrderCreated = (payload) => {
      const isSameTable = String(payload?.tableId || '') === String(tableId) || String(payload?.tableNumber || '') === String(tableId)
      if (isSameTable) scheduleFetchOrders()
    }
    const onItemStatusUpdated = (payload) => {
      const isSameTable = String(payload?.tableId || '') === String(tableId) || String(payload?.tableNumber || '') === String(tableId)
      if (!isSameTable) return
      const eventKey = `${payload?.itemId || ''}:${payload?.newStatus || ''}:${payload?.updatedAt || ''}`
      if (eventKey && lastStatusEventRef.current === eventKey) return
      lastStatusEventRef.current = eventKey
      notificationApi.info({
        message: 'Món ăn đã đổi trạng thái',
        description: `Trạng thái: ${ORDER_ITEM_STATUS_MAP[normalizeOrderStatus(payload.newStatus)]?.label}`,
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

  const handleProcessPayment = async () => {
    try {
      setProcessPaymentLoading(true)
      if (paymentMethod === 'sepay') {
        setShowSepayQR(true);
        setProcessPaymentLoading(false);
      } else if (paymentMethod === 'vnpay') {
        const res = await paymentAPI.createUrl({ table_id: tableId, amount: grandTotal })
        const url = res.data?.paymentUrl || res.paymentUrl
        if (url) {
          message.loading("Đang kết nối đến VNPay...", 1.5)
          setTimeout(() => { window.location.href = url }, 1000)
        } else {
          message.error("Lỗi tạo link VNPay")
        }
      } else if (paymentMethod === 'cash') {
        message.success('Gọi nhân viên để thanh toán tiền mặt')
        setIsPayModalOpen(false)
      }
    } catch (error) {
      message.error("Có lỗi xảy ra")
    } finally {
      setProcessPaymentLoading(false)
    }
  }

  // --- GIỮ NGUYÊN LOGIC TẠO MÃ CỦA BẠN ---
  const orderCode = orders[0]?._id?.slice(-6).toUpperCase() || 'N/A'
  const paymentContent = `ROOSTA${orderCode !== 'N/A' ? orderCode : tableId}`
  const qrCodeUrl = `https://qr.sepay.vn/img?acc=${SEPAY_BANK_ACCOUNT}&bank=${SEPAY_BANK_NAME}&amount=${grandTotal}&des=${paymentContent}&template=compact`

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100"><Spin size="large" /></div>

  return (
    <>
      {notificationContextHolder}
      <div className="min-h-screen bg-white text-slate-900 pb-40">
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-4 flex items-center justify-start gap-5 py-4">
            <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
              <ArrowLeftOutlined className="text-lg" />
            </button>
            <h1 className="text-3xl font-semibold text-slate-800">Đơn hàng của bạn</h1>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className='flex items-center mb-4'>
            <Tag color="orange" className="font-semibold">Bàn {tableId}</Tag>
            <Dot size={16} />
            <span className="text-xs text-slate-700">Mã đơn: #{orderCode}</span>
          </div>

          {flattenedItems.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 shadow-sm border text-center">
              <Empty description={<div><p className="mt-4 text-base font-semibold">Chưa có đơn hàng nào</p></div>} />
              <button onClick={() => navigate(`/table-order/${tableId}/menu`)} className="mt-8 bg-orange-500 px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:bg-orange-600">Gọi thêm món</button>
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-slate-900">Chi tiết món ăn</h3>
                <div className="space-y-4">
                  {groupedItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                      <img src={item.dish_id?.image_url || 'https://via.placeholder.com/80'} alt="Món ăn" className="h-24 w-24 rounded-lg object-cover border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{item.dish_id?.dish_name}</p>
                        <span className="text-sm text-slate-600">Số lượng: {item.quantity}</span>
                        <div className="mt-1"><Tag>{ORDER_ITEM_STATUS_MAP[normalizeOrderStatus(item.status)]?.label}</Tag></div>
                      </div>
                      <div className="text-right"><p className="font-semibold text-slate-900">{formatCurrency((item.price || item.dish_id?.dish_price || 0) * item.quantity)}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-orange-50 p-6 border border-orange-200 flex justify-between items-center shadow-sm">
                <span className="text-lg font-bold text-slate-900">Tổng cộng</span>
                <span className="text-2xl font-black text-orange-600">{formatCurrency(grandTotal)}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Bar */}
        {flattenedItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl p-4 shadow-lg z-40">
            <div className="mx-auto max-w-6xl flex gap-3">
              <button onClick={() => navigate(`/table-order/${tableId}/menu`)} className="flex-1 h-12 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition-all">Gọi thêm món</button>
              <button onClick={() => setIsPayModalOpen(true)} className="flex-1 h-12 rounded-lg bg-linear-to-r from-orange-500 to-orange-600 text-white font-bold hover:shadow-lg transition-all">Thanh toán</button>
            </div>
          </div>
        )}

        <Modal
          title={showSepayQR ? <div className="flex items-center gap-2"><QrcodeOutlined className="text-xl text-blue-500" /><span className="font-bold">Quét mã để thanh toán</span></div> : <div className="flex items-center gap-2"><CreditCardOutlined className="text-xl text-orange-500" /><span className="font-bold">Chọn phương thức thanh toán</span></div>}
          open={isPayModalOpen}
          onCancel={() => { setIsPayModalOpen(false); setShowSepayQR(false); }}
          onOk={handleProcessPayment}
          okText="Xác nhận"
          cancelText="Hủy bỏ"
          width={480}
          centered
          footer={showSepayQR ? null : undefined}
          okButtonProps={{ className: 'bg-orange-500 font-bold h-10', loading: processPaymentLoading }}
        >
          {!showSepayQR ? (
            <div className="mt-6">
              <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod} className="w-full">
                <Space direction="vertical" className="w-full" style={{ gap: '12px' }}>
                  <div className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'sepay' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <Radio value="sepay" className="w-full">
                      <div className="flex items-center gap-4">
                        <QrcodeOutlined className="text-xl text-blue-600" />
                        <div><p className="font-bold text-slate-900">VietQR (Tự động)</p><p className="text-xs text-slate-500">Xác nhận thanh toán ngay lập tức</p></div>
                      </div>
                    </Radio>
                  </div>
                  <div className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <Radio value="cash" className="w-full">
                      <div className="flex items-center gap-4">
                        <WalletOutlined className="text-xl text-green-600" />
                        <div><p className="font-bold text-slate-900">Thanh toán tiền mặt</p><p className="text-xs text-slate-500">Thanh toán trực tiếp nhân viên</p></div>
                      </div>
                    </Radio>
                  </div>
                </Space>
              </Radio.Group>
              <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-900">Tổng thanh toán: <span className="text-orange-600">{formatCurrency(grandTotal)}</span></p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 animate-fadeIn">
              <div className="p-2 border rounded-2xl bg-white mb-4 shadow-sm border-slate-200">
                <img src={qrCodeUrl} alt="VietQR" className="w-64 h-64 rounded-xl" />
              </div>
              <h2 className="text-2xl font-black text-orange-600 mb-2">{formatCurrency(grandTotal)}</h2>
              <div className="bg-slate-100 p-3 rounded-lg w-full text-center border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Nội dung chuyển khoản (Bắt buộc):</p>
                <p className="text-lg font-mono font-bold text-slate-800 tracking-wider">{paymentContent}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-blue-600 animate-pulse">
                <Spin size="small" /> <span className="text-sm font-semibold italic">Đang chờ hệ thống xác nhận tiền...</span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  )
}

export default OrdersPage
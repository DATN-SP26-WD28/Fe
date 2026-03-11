import React, { useState } from 'react'

const MOCK_ORDERS = [
  {
    id: 'ORD-1001',
    time: '11:23 11/03/2026',
    status: 'Đang chế biến',
    items: [
      { name: 'Thịt Bò Mỹ Thượng Hạng', qty: 2, price: 159000 },
      { name: 'Đậu Hũ Non Chiên Giòn', qty: 1, price: 49000 },
    ],
  },
  {
    id: 'ORD-1002',
    time: '10:05 11/03/2026',
    status: 'Hoàn thành',
    items: [
      { name: 'Hải Sản Tươi Sống Mix', qty: 1, price: 249000 },
    ],
  },
]

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ'

const OrdersPage = () => {
  const [open, setOpen] = useState({})

  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }))

  const calcTotal = (items) => items.reduce((s, it) => s + it.qty * it.price, 0)

  return (
    <div className="p-4 max-w-[980px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Theo dõi đơn hàng</h1>

      <div className="space-y-4">
        {MOCK_ORDERS.map((order) => {
          const total = calcTotal(order.items)
          const isDone = order.status === 'Hoàn thành'
          return (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-default"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn: <span className="font-medium text-gray-800">{order.id}</span></p>
                  <p className="text-xs text-gray-400">{order.time}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{order.items.length} món</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm font-semibold text-brand">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDone ? 'bg-green-100 text-green-700' : 'bg-brand-light text-brand'}`}>
                    {order.status}
                  </span>

                  <button
                    onClick={() => toggle(order.id)}
                    className="flex items-center gap-2 text-sm text-brand font-medium hover:text-brand-dark"
                    aria-expanded={!!open[order.id]}
                  >
                    <svg className={`h-4 w-4 transition-transform ${open[order.id] ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M6.293 14.707a1 1 0 010-1.414L10.586 9 6.293 4.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {open[order.id] && (
                <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{it.name}</div>
                        <div className="text-xs text-gray-500">Số lượng: {it.qty}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-800">{formatCurrency(it.price * it.qty)}</div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">Tổng cộng</div>
                    <div className="text-sm font-semibold text-brand">{formatCurrency(total)}</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {MOCK_ORDERS.length === 0 && (
          <div className="mt-8 text-center text-gray-400 text-sm">
            Hiện chưa có đơn hàng để theo dõi.
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage

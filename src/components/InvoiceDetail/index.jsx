import React from 'react'

const InvoiceDetail = ({ invoice }) => {
  if (!invoice) return null;
  return (
    <div>
      <div className="flex gap-4 text-sm mb-3 text-slate-600">
        <span>Bàn số: <strong>{invoice.table_id?.table_number ?? '?'}</strong></span>
        <span>Phương thức thanh toán: <strong>{invoice.payment_method?.toUpperCase()}</strong></span>
        <span>Tổng tiền: <strong className="text-orange-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.total_amount || 0)}</strong></span>
      </div>
      {(invoice.order_ids || []).map((order, oIdx) => {
        const items = Array.isArray(order.items) ? order.items : [];
        return (
          <div key={order._id || oIdx} className="mb-4">
            <div className="text-xs text-slate-500 text-center font-semibold py-1">Mã đơn hàng #{String(order._id).slice(-6).toUpperCase()}</div>
            {items.length === 0 ? (
              <p className="text-gray-400 text-xs text-center">Không có món</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="text-left px-3 py-2 font-semibold">Món ăn</th>
                    <th className="text-center px-3 py-2 font-semibold">SL</th>
                    <th className="text-right px-3 py-2 font-semibold">Đơn giá</th>
                    <th className="text-right px-3 py-2 font-semibold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, iIdx) => (
                    <tr key={item._id || iIdx} className="border-t border-slate-100">
                      <td className="px-3 py-2">{item.dish_id?.dish_name ?? '—'}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.price || 0) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InvoiceDetail;

import React from 'react'

const InvoiceTicket = ({ invoice }) => {
  if (!invoice) return null;
  const allItems = (invoice.order_ids || []).flatMap(o => Array.isArray(o.items) ? o.items : []);
  const tableNumber = invoice.table_id?.table_number ?? '?';
  const invoiceDate = new Date(invoice.created_at || invoice.createdAt).toLocaleString('vi-VN');
  return (
    <div id="invoice-ticket-content" className="p-4 bg-white text-black font-mono leading-relaxed max-w-100 mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-lg font-black uppercase tracking-widest">Nhà hàng</h2>
        <p className="text-xs text-gray-500 mt-1">{invoiceDate}</p>
      </div>
      <div className="border-t border-dashed border-black my-3" />
      <h1 className="text-xl font-black uppercase tracking-widest my-2 text-center">Hóa đơn thanh toán</h1>
      <div className="text-xs space-y-1 mb-4">
        <div className="flex justify-between">
          <span className="font-bold">Số bàn:</span>
          <span>Bàn {tableNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Mã hóa đơn:</span>
          <span className="uppercase">{invoice.invoice_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Phương thức:</span>
          <span className="uppercase">{invoice.payment_method || 'CASH'}</span>
        </div>
      </div>
      <div className="border-t-2 border-black mb-2" />
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-1">Món</th>
            <th className="text-center py-1">SL</th>
            <th className="text-right py-1">Tiền</th>
          </tr>
        </thead>
        <tbody>
          {allItems.map((item, idx) => (
            <tr key={item._id || idx} className="border-t border-dashed border-gray-300">
              <td className="py-1 pr-2 capitalize">{item.dish_id?.dish_name || 'Món không tên'}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right whitespace-nowrap">{((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t-2 border-black mt-3 pt-3 flex justify-between items-baseline">
        <span className="text-base font-black uppercase">Tổng cộng:</span>
        <span className="text-base font-black">{(invoice.total_amount || 0).toLocaleString('vi-VN')} <sup className="text-xs font-normal">VNĐ</sup></span>
      </div>
      <div className="border-t border-dashed border-black mt-6" />
      <p className="text-center text-xs mt-3 text-gray-500">Cảm ơn quý khách!</p>
      <div className="mt-4 flex justify-center opacity-10">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="w-4 h-2 bg-gray-300" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
        ))}
      </div>
    </div>
  );
};

export default InvoiceTicket;

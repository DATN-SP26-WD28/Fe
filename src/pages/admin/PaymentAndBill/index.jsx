import React, { useState, useEffect, useMemo } from 'react'
import { Breadcrumb, Card, Col, Row, Statistic, Table, Tag, Spin, message, Select, Space, Modal, Button, Divider, DatePicker, Input } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import invoiceAPI from '@/configs/invoice.api';
import { Eye, FileText, Printer } from 'lucide-react';
import InvoiceTicket from '@/components/InvoiceTicket';
import InvoiceDetail from '@/components/InvoiceDetail';

const { Option } = Select;

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0)

const PaymentAndBill = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState('all')
  const [detailInvoice, setDetailInvoice] = useState(null)
  const [printInvoice, setPrintInvoice] = useState(null)
  const [range, setRange] = useState([null, null])
  const [searchText, setSearchText] = useState('')
  const { Search } = Input

  const resetFilters = () => {
    setSelectedTable('all')
    setRange([null, null])
    setSearchText('')
  }

  const handlePrint = () => {
    const content = document.getElementById('invoice-ticket-content');
    if (!content) return;
    const win = window.open('', '_blank', 'width=480,height=700');
    win.document.write(`
      <html><head><title>Hóa đơn</title>
      <style>
        body { margin: 0; font-family: monospace; }
        @media print { body { margin: 0; } }
      </style>
      </head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceAPI.getAll();

      // LẤY DỮ LIỆU: Phải truy cập đúng vào res.data.data theo cấu trúc JSON của bạn
      const rawData = res.data?.data || res.data || [];

      // 1. LỌC: Chỉ lấy paid và đảm bảo rawData là mảng
      const paidInvoices = Array.isArray(rawData)
        ? rawData.filter(inv => inv.status?.toLowerCase() === 'paid')
        : [];

      // 2. SẮP XẾP: Mới nhất lên đầu
      const sortedData = [...paidInvoices].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });

      setInvoices(sortedData);
    } catch (error) {
      console.error("Lỗi fetch Invoices:", error);
      message.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };
  console.log("detailInvoice", detailInvoice)

  useEffect(() => {
    fetchInvoices();
  }, []);

  // 3. TÍNH TOÁN DANH SÁCH BÀN (Dùng String để đồng bộ bộ lọc)
  const tableNumbers = useMemo(() => {
    const numbers = invoices
      .map(inv => inv.table_id?.table_number)
      .filter(num => num !== undefined && num !== null);
    return [...new Set(numbers)].sort((a, b) => a - b);
  }, [invoices]);

  // 4. LỌC THEO BÀN: Ép kiểu String để tránh lỗi Number !== String
  const filteredData = useMemo(() => {
    const start = range && range[0] ? range[0].toDate?.() || (range[0] instanceof Date ? range[0] : null) : null
    const end = range && range[1] ? range[1].toDate?.() || (range[1] instanceof Date ? range[1] : null) : null

    return invoices.filter(inv => {
      // filter by table
      if (selectedTable !== 'all' && String(inv.table_id?.table_number) !== String(selectedTable)) return false

      // filter by date range (created_at or createdAt)
      if (start || end) {
        const created = new Date(inv.created_at || inv.createdAt || 0)
        if (start && created < new Date(start.setHours(0, 0, 0, 0))) return false
        if (end && created > new Date(end.setHours(23, 59, 59, 999))) return false
      }

      return true
    })
  }, [invoices, selectedTable, range]);

  // 5. ÁP DỤNG TÌM KIẾM (Invoice number, guest, table)
  const searchedData = useMemo(() => {
    const q = (searchText || '').trim().toLowerCase()
    if (!q) return filteredData

    return filteredData.filter(inv => {
      const invoiceNum = (inv.invoice_number || '').toString().toLowerCase()
      const tableNum = (inv.table_id?.table_number || '').toString().toLowerCase()
      const guest = (inv.guest_id?.username || inv.guest_name || '').toString().toLowerCase()
      return invoiceNum.includes(q) || tableNum.includes(q) || guest.includes(q)
    })
  }, [filteredData, searchText])

  const flatRows = useMemo(() => {
    const rows = [];
    searchedData.forEach(inv => {
      const orders = Array.isArray(inv.order_ids) ? inv.order_ids : [];
      if (orders.length === 0) {
        rows.push({ ...inv, _rowKey: inv._id, _order: null, _invoiceRef: inv });
      } else {
        orders.forEach((order, idx) => {
          rows.push({
            ...inv,
            _rowKey: `${inv._id}_${order._id || idx}`,
            _order: order,
            _invoiceRef: inv,
          });
        });
      }
    });
    return rows;
  }, [searchedData]);

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (_, record) => {
        const id = record._order?._id;
        return id ? <span className="font-mono text-slate-500 uppercase">{id.slice(-8).toUpperCase()}</span> : <span className="text-gray-300">—</span>;
      },
    },
    {
      title: 'Số Bàn',
      dataIndex: 'table_id',
      key: 'table_id',
      render: (table) => <Tag color="volcano" className='font-bold'>Bàn {table?.table_number || '?'}</Tag>,
    },
    {
      title: 'Phương thức',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (v) => <Tag color="blue">{v?.toUpperCase() || 'Tiền mặt'}</Tag>
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v, record) => <span className='text-gray-500 text-sm'>{new Date(v || record.createdAt).toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (value) => <span className="font-bold text-orange-500">{formatCurrency(value)}</span>,
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'action',
      align: "center",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            onClick={() => setDetailInvoice(record._invoiceRef)}
            title='Xem chi tiết'
            icon={<Eye size={16} />}
          >
          </Button>
          <Button
            type="text"
            onClick={() => setPrintInvoice(record._invoiceRef)}
            title='Xem hóa đơn'
            icon={<FileText size={16} />}
          >
          </Button>
        </Space>
      ),
    }
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Spin size="large" />
      <p className="mt-4 text-slate-400">Đang tải dữ liệu doanh thu...</p>
    </div>
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <section className="mb-3">
          <h1 className="font-bold text-3xl mb-2">Thanh toán & hóa đơn</h1>
          <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Thanh toán & hóa đơn' }]} />
        </section>

      </div>

      <Card
        className="rounded-3xl border-none shadow-sm overflow-hidden"
        title={<span className="text-slate-800 font-bold">Lịch sử giao dịch</span>}
      >
        <div className="p-4 flex items-center gap-4 mb-6">
          <span className="font-semibold text-slate-500">Bàn số:</span>
          <Select
            value={selectedTable}
            style={{ width: 180 }}
            onChange={val => setSelectedTable(val)}
            className="custom-select"
          >
            <Option value="all">Tất cả các bàn</Option>
            {tableNumbers.map(num => (
              <Option key={num} value={String(num)}>Bàn số {num}</Option>
            ))}
          </Select>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-500">Thời gian:</span>
            <DatePicker.RangePicker
              value={range}
              onChange={(vals) => setRange(vals || [null, null])}
              allowClear
              placeholder={["Từ ngày", "Đến ngày"]}
              style={{ width: 200 }}
            />
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-500">Tìm kiếm:</span>
              <Search
                placeholder="Tìm kiếm mã/bàn/khách"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
            </div>
            <div>
              <Button onClick={resetFilters} icon={<ReloadOutlined />} title="Đặt lại bộ lọc">
                Đặt lại
              </Button>
            </div>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={flatRows}
          rowKey="_rowKey"
          pagination={{ pageSize: 10 }}
          className="invoice-table"
        />
      </Card>

      <Modal
        open={!!printInvoice}
        onCancel={() => setPrintInvoice(null)}
        centered
        title={<span className="font-bold">In hóa đơn: {printInvoice?.invoice_number}</span>}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setPrintInvoice(null)}>Đóng</Button>
            <Button type="primary" icon={<Printer size={15} />} onClick={handlePrint}>
              In hóa đơn
            </Button>
          </div>
        }
        width={480}
      >
        <InvoiceTicket invoice={printInvoice} />
      </Modal>

      <Modal
        open={!!detailInvoice}
        onCancel={() => setDetailInvoice(null)}
        footer={null}
        centered
        title={
          <span className="font-bold text-blue-700">
            Chi tiết hóa đơn: {detailInvoice?.invoice_number}
          </span>
        }
        width={640}
      >
        {detailInvoice && <InvoiceDetail invoice={detailInvoice} />}
      </Modal>
    </>
  )
}

export default PaymentAndBill
import React, { useState, useEffect, useMemo } from 'react'
import { Breadcrumb, Card, Col, Row, Statistic, Table, Tag, Spin, message, Select, Space } from 'antd'
import invoiceAPI from '@/configs/invoice.api';

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
    if (selectedTable === 'all') return invoices;
    return invoices.filter(inv => String(inv.table_id?.table_number) === String(selectedTable));
  }, [invoices, selectedTable]);

  // 5. THỐNG KÊ
  const summary = useMemo(() => {
    return {
      count: filteredData.length,
      revenue: filteredData.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0)
    };
  }, [filteredData]);

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (v, record) => <span className="font-mono font-bold text-blue-600">{v || record._id?.slice(-6).toUpperCase()}</span>,
    },
    {
      title: 'Số Bàn',
      dataIndex: 'table_id',
      key: 'table_id',
      render: (table) => <Tag color="volcano" className='font-bold'>Bàn {table?.table_number || '?'}</Tag>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (value) => <span className="font-bold text-slate-700">{formatCurrency(value)}</span>,
    },
    {
      title: 'Phương thức',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (v) => <Tag color="blue">{v?.toUpperCase() || 'CASH'}</Tag>
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v, record) => <span className='text-gray-400 text-xs'>{new Date(v || record.createdAt).toLocaleString('vi-VN')}</span>,
    }
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Spin size="large" />
      <p className="mt-4 text-slate-400">Đang tải dữ liệu doanh thu...</p>
    </div>
  );

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Báo Cáo Doanh Thu</h1>
          <Breadcrumb items={[{ title: 'Admin' }, { title: 'Thanh toán' }]} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <span className="font-semibold text-slate-500">Lọc theo bàn:</span>
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
        </div>
      </div>

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} md={8}>
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
            <Statistic
              title={<span className='text-slate-400 font-medium'>Số lượng hóa đơn</span>}
              value={summary.count}
              suffix="phiếu"
              valueStyle={{ color: '#1d4ed8', fontWeight: 800 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card className="rounded-3xl border-none shadow-sm bg-white" style={{ borderLeft: '6px solid #f07f29' }}>
            <Statistic
              title={<span className='text-slate-400 font-medium'>Doanh thu thực tế {selectedTable !== 'all' ? `(Bàn ${selectedTable})` : ''}</span>}
              value={summary.revenue}
              formatter={(val) => formatCurrency(val)}
              valueStyle={{ color: '#ea580c', fontWeight: 900, fontSize: '32px' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="rounded-3xl border-none shadow-sm overflow-hidden"
        title={<span className="text-slate-800 font-bold">CHI TIẾT GIAO DỊCH</span>}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          className="invoice-table"
        />
      </Card>
    </div>
  )
}

export default PaymentAndBill
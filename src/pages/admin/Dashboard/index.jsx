import React, { useEffect, useMemo, useState } from 'react';
import { Breadcrumb, Button, Card, Empty, Progress, Spin, Statistic, Table, Tag, Radio, Space } from 'antd';
import { FireOutlined, ShopOutlined, ArrowUpOutlined, FileDoneOutlined, SmileOutlined, AppstoreOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import invoiceAPI from '@/configs/invoice.api';

const BRAND_COLOR = '#f07f29';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [timeFilter, setTimeFilter] = useState('week'); // Mặc định là Tuần này

  // 1. LẤY DỮ LIỆU TỪ SERVER (Chỉ gọi 1 lần)
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const invoicesRes = await invoiceAPI.getAll();
      const allInvoices = invoicesRes.data?.invoices || invoicesRes.data?.data || invoicesRes.data || [];
      const invoiceList = Array.isArray(allInvoices) ? allInvoices : [];

      const sortedInvoices = [...invoiceList].sort((a, b) =>
        new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      );

      setInvoices(sortedInvoices);
    } catch (error) {
      console.error("Lỗi fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 2. LOGIC BỘ LỌC THỜI GIAN (Tự động cập nhật khi đổi tab)
  const filteredInvoices = useMemo(() => {
    const now = new Date();

    // Tìm ngày đầu tuần (Thứ 2) và cuối tuần (Chủ nhật)
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return invoices.filter(inv => {
      // Chỉ quan tâm hóa đơn đã thanh toán
      if (inv.status !== 'paid') return false;

      const d = new Date(inv.created_at || inv.createdAt);
      if (!d) return false;

      // Lọc theo Tuần, Tháng, Năm
      if (timeFilter === 'week') {
        return d >= startOfWeek && d <= endOfWeek;
      } else if (timeFilter === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [invoices, timeFilter]);

  // 3. TÍNH TOÁN CÁC CHỈ SỐ TỔNG QUAN (Dựa trên dữ liệu đã lọc)
  const stats = useMemo(() => {
    const totalRevenue = filteredInvoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
    return {
      totalRevenue,
      orderCount: filteredInvoices.length,
      tableOccupancy: 65, // Giả lập tỷ lệ lấp đầy
    };
  }, [filteredInvoices]);

  // 4. CHUẨN BỊ DỮ LIỆU BIỂU ĐỒ (Thay đổi form tùy theo Tuần/Tháng/Năm)
  const chartData = useMemo(() => {
    const now = new Date();

    if (timeFilter === 'week') {
      const data = [
        { time: 'T2', revenue: 0 }, { time: 'T3', revenue: 0 }, { time: 'T4', revenue: 0 },
        { time: 'T5', revenue: 0 }, { time: 'T6', revenue: 0 }, { time: 'T7', revenue: 0 }, { time: 'CN', revenue: 0 },
      ];
      filteredInvoices.forEach(inv => {
        const d = new Date(inv.created_at || inv.createdAt);
        const day = d.getDay(); // 0(CN) -> 6(T7)
        const idx = day === 0 ? 6 : day - 1; // Chuyển đổi index cho mảng (T2=0, CN=6)
        data[idx].revenue += Number(inv.total_amount) || 0;
      });
      return data;

    } else if (timeFilter === 'month') {
      // Biểu đồ từ ngày 1 đến cuối tháng
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const data = Array.from({ length: daysInMonth }, (_, i) => ({ time: `${i + 1}`, revenue: 0 }));
      filteredInvoices.forEach(inv => {
        const d = new Date(inv.created_at || inv.createdAt);
        const dateNum = d.getDate(); // Ngày 1 -> 31
        data[dateNum - 1].revenue += Number(inv.total_amount) || 0;
      });
      return data;

    } else if (timeFilter === 'year') {
      // Biểu đồ từ Tháng 1 đến Tháng 12
      const data = Array.from({ length: 12 }, (_, i) => ({ time: `Th${i + 1}`, revenue: 0 }));
      filteredInvoices.forEach(inv => {
        const d = new Date(inv.created_at || inv.createdAt);
        const monthNum = d.getMonth(); // 0 -> 11
        data[monthNum].revenue += Number(inv.total_amount) || 0;
      });
      return data;
    }
  }, [filteredInvoices, timeFilter]);

  // 5. TOP MÓN ĂN THỊNH HÀNH (Đồng bộ thời gian với biểu đồ)
  const topDishesData = useMemo(() => {
    const dishCounts = {};
    filteredInvoices.forEach(inv => {
      const orders = inv.order_ids || [];
      orders.forEach(order => {
        const items = order.items || [];
        items.forEach(item => {
          const name = item.dish_id?.dish_name || item.name || "Món ẩn";
          const quantity = Number(item.quantity) || 0;
          const status = item.status?.toLowerCase();
          if (status !== 'canceled' && status !== 'cancelled' && status !== 'đã hủy') {
            dishCounts[name] = (dishCounts[name] || 0) + quantity;
          }
        });
      });
    });

    return Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredInvoices]);

  // Bảng giao dịch gần nhất
  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (v) => <span className="font-mono font-semibold text-gray-600 hover:text-[#f07f29] cursor-pointer transition-colors text-xs">{v}</span>,
    },
    {
      title: 'Bàn',
      dataIndex: 'table_id',
      key: 'table_id',
      render: (table) => (
        <span className='font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full text-xs'>
          Bàn {table?.table_number || '?'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Tag color={record.status === 'paid' ? 'success' : 'warning'} className="border-none rounded-md">
          {record.status === 'paid' ? 'Đã thu tiền' : 'Chưa thu'}
        </Tag>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'right',
      render: (v) => <span className="font-bold text-gray-800">{new Intl.NumberFormat('vi-VN').format(v)}đ</span>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'right',
      render: (v) => <span className='text-gray-400 text-xs'>{new Date(v).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>,
    }
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Spin size="large" tip="Đang đồng bộ dữ liệu..." /></div>;

  return (
    <div className="min-h-screen font-sans bg-slate-50 p-4 -m-6 sm:m-0 sm:p-0 sm:bg-transparent">
      {/* Header & Filter */}
      <section className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-bold text-3xl mb-2 text-slate-800">Thống kê tổng quan</h1>
            <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Thống kê' }]} className="text-slate-500" />
          </div>
          <div className="flex items-center gap-3">
            {/* Đã cập nhật Radio Group theo yêu cầu của bạn */}
            <Radio.Group value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} buttonStyle="solid" className="shadow-sm">
              <Radio.Button value="week">Tuần này</Radio.Button>
              <Radio.Button value="month">Tháng này</Radio.Button>
              <Radio.Button value="year">Năm nay</Radio.Button>
            </Radio.Group>
            <Button type="primary" className="rounded-lg flex items-center gap-2 shadow-md shadow-orange-200" icon={<FireOutlined />} onClick={fetchDashboardData} style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR }}>
              Làm mới
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className='absolute -right-4 -top-4 opacity-5 text-orange-500 group-hover:scale-110 transition-transform duration-500'>
            <ShopOutlined style={{ fontSize: '100px' }} />
          </div>
          <Statistic
            title={<span className="text-sm font-medium text-slate-500">Doanh thu tổng</span>}
            value={stats.totalRevenue}
            suffix="đ"
            valueStyle={{ color: BRAND_COLOR, fontWeight: 800, fontSize: '28px' }}
          />
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-sm font-medium text-slate-500">Hóa đơn đã chốt</span>}
            value={stats.orderCount}
            prefix={<FileDoneOutlined className="text-blue-500 mr-2 text-xl" />}
            valueStyle={{ fontWeight: 700, fontSize: '28px', color: '#1e293b' }}
          />
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-500">Lấp đầy bàn</span>
            <AppstoreOutlined className="text-indigo-500 text-xl" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-2">{stats.tableOccupancy}%</div>
          <Progress percent={stats.tableOccupancy} strokeColor={BRAND_COLOR} status="active" strokeWidth={10} strokeLinecap="round" showInfo={false} />
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-sm font-medium text-slate-500">Tỷ lệ hài lòng</span>}
            value={98.5}
            suffix="%"
            prefix={<SmileOutlined className="text-green-500 mr-2 text-xl" />}
            valueStyle={{ color: '#10b981', fontWeight: 700, fontSize: '28px' }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cột trái: Chart (Span 2) */}
        <Card className="xl:col-span-2 rounded-2xl border-none shadow-sm" title={<span className="font-bold text-slate-700">Biểu đồ doanh thu</span>}>
          <div className="h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={BRAND_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                  // Chỉ hiển thị vài tick nếu dùng biểu đồ Tháng để tránh bị chèn chữ
                  interval={timeFilter === 'month' ? 4 : 'preserveStartEnd'}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${value / 1000}k`}
                  dx={-10}
                />
                <Tooltip
                  labelFormatter={(label) => timeFilter === 'month' ? `Ngày ${label}` : label}
                  formatter={(value) => [new Intl.NumberFormat('vi-VN').format(value) + 'đ', 'Doanh thu']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke={BRAND_COLOR} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cột phải: Món ăn thịnh hành */}
        <Card className="rounded-2xl border-none shadow-sm flex flex-col h-full" title={<span className="font-bold text-slate-700">Món ăn thịnh hành</span>}>
          <div className="space-y-5 mt-2 flex-grow">
            {topDishesData.length > 0 ? topDishesData.map((dish, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-orange-100 text-orange-600' :
                    index === 1 ? 'bg-slate-100 text-slate-600' :
                      index === 2 ? 'bg-orange-50 text-orange-400' : 'bg-gray-50 text-gray-400'}`}>
                  #{index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-sm font-semibold text-slate-700">
                    <span className="truncate max-w-[150px]">{dish.name}</span>
                    <span className="text-orange-500">{dish.count} món</span>
                  </div>
                  <Progress
                    percent={Math.round((dish.count / topDishesData[0].count) * 100)}
                    showInfo={false}
                    strokeColor={index === 0 ? '#f97316' : '#fdba74'}
                    strokeWidth={8}
                    className="m-0"
                  />
                </div>
              </div>
            )) : <Empty description="Chưa có dữ liệu bán hàng" className="mt-10" />}
          </div>
        </Card>

        {/* Bảng giao dịch */}
        <Card className="xl:col-span-3 rounded-2xl border-none shadow-sm" title={<span className="font-bold text-slate-700">Lịch sử giao dịch mới nhất</span>}>
          <Table
            columns={columns}
            dataSource={invoices.slice(0, 5)} // Bảng này thường nên giữ all in-time mới nhất thay vì lọc
            pagination={false}
            rowKey="_id"
            className="custom-table"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    </div>
  );
}
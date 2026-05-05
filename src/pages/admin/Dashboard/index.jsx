import React, { useEffect, useMemo, useState } from 'react';
import { Breadcrumb, Button, Card, Empty, Progress, Spin, Statistic, Table, Tag, Radio, Space, DatePicker } from 'antd';
import { FireOutlined, ShopOutlined, FileDoneOutlined, SmileOutlined, WalletOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import invoiceAPI from '@/configs/invoice.api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const BRAND_COLOR = '#f07f29';

// Định nghĩa tỷ suất lợi nhuận giả lập (25%)
const PROFIT_MARGIN = 0.25;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [timeFilter, setTimeFilter] = useState('week');
  const [dateRange, setDateRange] = useState(null);

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

  // LOGIC BỘ LỌC THỜI GIAN 
  const filteredInvoices = useMemo(() => {
    const now = new Date();

    return invoices.filter(inv => {
      // Bỏ qua các hóa đơn chưa thanh toán hoặc bị hủy
      if (inv.status !== 'paid') return false;
      const d = new Date(inv.created_at || inv.createdAt);
      if (isNaN(d.getTime())) return false; // Tránh lỗi ngày tháng không hợp lệ

      // 1. Lọc theo RangePicker (từ ngày - đến ngày)
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].startOf('day').toDate();
        const end = dateRange[1].endOf('day').toDate();
        return d >= start && d <= end;
      }

      // 2. Lọc theo bộ chọn nhanh
      if (timeFilter === 'week') {
        const currentDay = now.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        return d >= startOfWeek;
      } else if (timeFilter === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [invoices, timeFilter, dateRange]);

  // TÍNH TOÁN CÁC CHỈ SỐ TỔNG QUAN (Doanh thu, Lợi nhuận)
  const stats = useMemo(() => {
    const totalRevenue = filteredInvoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
    const estimatedProfit = totalRevenue * PROFIT_MARGIN;

    return {
      totalRevenue,
      estimatedProfit,
      orderCount: filteredInvoices.length,
    };
  }, [filteredInvoices]);

  // CHUẨN BỊ DỮ LIỆU BIỂU ĐỒ (Đã fix lỗi gộp Tháng và Năm)
  const chartData = useMemo(() => {
    // 1. CHỌN TỪ NGÀY - ĐẾN NGÀY
    if (dateRange && dateRange[0] && dateRange[1]) {
      const dataMap = {};
      let currentDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');

      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        dataMap[currentDate.format('DD/MM')] = 0;
        currentDate = currentDate.add(1, 'day');
      }

      filteredInvoices.forEach(inv => {
        const label = dayjs(inv.created_at || inv.createdAt).format('DD/MM');
        if (dataMap[label] !== undefined) {
          dataMap[label] += (Number(inv.total_amount) || 0);
        }
      });

      return Object.entries(dataMap).map(([time, revenue]) => ({ time, revenue }));
    }

    // 2. CHỌN THÁNG NÀY (Dàn trải 30/31 ngày)
    if (timeFilter === 'month') {
      const dataMap = {};
      const daysInMonth = dayjs().daysInMonth();
      for (let i = 1; i <= daysInMonth; i++) {
        const label = dayjs().date(i).format('DD/MM');
        dataMap[label] = 0;
      }

      filteredInvoices.forEach(inv => {
        const label = dayjs(inv.created_at || inv.createdAt).format('DD/MM');
        if (dataMap[label] !== undefined) {
          dataMap[label] += (Number(inv.total_amount) || 0);
        }
      });

      return Object.entries(dataMap).map(([time, revenue]) => ({ time, revenue }));
    }

    // 3. CHỌN NĂM NAY (Tách riêng: Dàn trải 12 tháng)
    if (timeFilter === 'year') {
      const dataMap = {};
      for (let i = 1; i <= 12; i++) {
        dataMap[`Th${i}`] = 0;
      }

      filteredInvoices.forEach(inv => {
        const monthNum = dayjs(inv.created_at || inv.createdAt).month() + 1;
        const label = `Th${monthNum}`;
        if (dataMap[label] !== undefined) {
          dataMap[label] += (Number(inv.total_amount) || 0);
        }
      });

      return Object.entries(dataMap).map(([time, revenue]) => ({ time, revenue }));
    }

    // 4. MẶC ĐỊNH TUẦN NÀY
    const data = [
      { time: 'T2', revenue: 0 }, { time: 'T3', revenue: 0 }, { time: 'T4', revenue: 0 },
      { time: 'T5', revenue: 0 }, { time: 'T6', revenue: 0 }, { time: 'T7', revenue: 0 }, { time: 'CN', revenue: 0 },
    ];
    filteredInvoices.forEach(inv => {
      const d = new Date(inv.created_at || inv.createdAt);
      if (isNaN(d.getTime())) return;
      const day = d.getDay();
      const idx = day === 0 ? 6 : day - 1;
      data[idx].revenue += Number(inv.total_amount) || 0;
    });
    return data;
  }, [filteredInvoices, timeFilter, dateRange]);

  // TOP MÓN ĂN THỊNH HÀNH
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
    return Object.entries(dishCounts).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredInvoices]);

  // THỐNG KÊ LƯỢNG KHÁCH NGỒI THEO BÀN
  const topTablesData = useMemo(() => {
    const tableCounts = {};
    filteredInvoices.forEach(inv => {
      const tableNum = inv.table_id?.table_number;
      if (tableNum) {
        tableCounts[tableNum] = (tableCounts[tableNum] || 0) + 1;
      }
    });

    return Object.entries(tableCounts)
      .map(([number, count]) => ({ number, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredInvoices]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Spin size="large" tip="Đang đồng bộ dữ liệu..." /></div>;

  return (
    <div className="min-h-screen font-sans bg-slate-50 p-4 -m-6 sm:m-0 sm:p-0 sm:bg-transparent">
      {/* Header & Filter */}
      <section className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-bold text-3xl mb-2 text-slate-800">Thống kê doanh thu</h1>
            <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Thống kê' }]} className="text-slate-500" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RangePicker
              onChange={(dates) => { setDateRange(dates); setTimeFilter('custom'); }}
              className="shadow-sm rounded-lg"
              placeholder={['Từ ngày', 'Đến ngày']}
              format="DD/MM/YYYY"
              value={dateRange} // Đảm bảo đồng bộ UI khi reset
            />
            <Radio.Group value={timeFilter} onChange={(e) => { setTimeFilter(e.target.value); setDateRange(null); }} buttonStyle="solid" className="shadow-sm">
              <Radio.Button value="week">Tuần này</Radio.Button>
              <Radio.Button value="month">Tháng này</Radio.Button>
              <Radio.Button value="year">Năm nay</Radio.Button>
            </Radio.Group>
            <Button type="primary" className="rounded-lg flex items-center gap-2 shadow-md" icon={<FireOutlined />} onClick={fetchDashboardData} style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR }}>
              Làm mới
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <Statistic
            title={<span className="text-sm font-medium text-slate-500">Doanh thu tổng</span>}
            value={stats.totalRevenue}
            suffix="đ"
            valueStyle={{ color: BRAND_COLOR, fontWeight: 800, fontSize: '24px' }}
          />
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className='absolute -right-4 -top-4 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform duration-500'>
            <WalletOutlined style={{ fontSize: '100px' }} />
          </div>
          <Statistic
            title={<span className="text-sm font-medium text-slate-500">Lợi nhuận (ước tính 25%)</span>}
            value={stats.estimatedProfit}
            suffix="đ"
            valueStyle={{ color: '#10b981', fontWeight: 800, fontSize: '24px' }}
          />
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-sm font-medium text-slate-500">Hóa đơn đã chốt</span>}
            value={stats.orderCount}
            prefix={<FileDoneOutlined className="text-blue-500 mr-2 text-xl" />}
            valueStyle={{ fontWeight: 700, fontSize: '24px', color: '#1e293b' }}
          />
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-sm font-medium text-slate-500">Tỷ lệ hài lòng</span>}
            value={98.5}
            suffix="%"
            prefix={<SmileOutlined className="text-green-500 mr-2 text-xl" />}
            valueStyle={{ color: '#10b981', fontWeight: 700, fontSize: '24px' }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Biểu đồ */}
        <Card className="xl:col-span-2 rounded-2xl border-none shadow-sm" title={<span className="font-bold text-slate-700">Biểu đồ doanh thu</span>}>
          <div className="h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={BRAND_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${v / 1000}k`} dx={-10} />
                <Tooltip formatter={(value) => [new Intl.NumberFormat('vi-VN').format(value) + 'đ', 'Doanh thu']} />
                <Area type="monotone" dataKey="revenue" stroke={BRAND_COLOR} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Món ăn thịnh hành */}
        <Card className="rounded-2xl border-none shadow-sm flex flex-col" title={<span className="font-bold text-slate-700">Món ăn thịnh hành</span>}>
          <div className="space-y-5 mt-2">
            {topDishesData.length > 0 ? topDishesData.map((dish, index) => {
              // Phòng hờ chia cho 0
              const maxCount = topDishesData[0]?.count || 1;
              const percent = Math.round((dish.count / maxCount) * 100);
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>#{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1 text-sm font-semibold text-slate-700">
                      <span className="truncate max-w-[150px]">{dish.name}</span>
                      <span className="text-orange-500">{dish.count} món</span>
                    </div>
                    <Progress percent={percent} showInfo={false} strokeColor={BRAND_COLOR} strokeWidth={8} />
                  </div>
                </div>
              );
            }) : <Empty description="Chưa có dữ liệu" />}
          </div>
        </Card>

        {/* Thống kê bàn */}
        <Card className="xl:col-span-3 rounded-2xl border-none shadow-sm" title={<span className="font-bold text-slate-700">Lưu lượng khách theo bàn (Top 5)</span>}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-4">
            {topTablesData.length > 0 ? topTablesData.map((table, index) => {
              // Phòng hờ chia cho 0
              const maxTableCount = topTablesData[0]?.count || 1;
              const percent = Math.round((table.count / maxTableCount) * 100);
              return (
                <div key={index} className="flex flex-col items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-orange-200 transition-colors">
                  <div className="text-slate-500 text-xs mb-2 uppercase font-semibold">Bàn số</div>
                  <div className="text-3xl font-bold text-slate-800 mb-1">{table.number}</div>
                  <div className="text-orange-500 font-bold text-sm">{table.count} lượt khách</div>
                  <div className="w-full mt-3">
                    <Progress percent={percent} size="small" showInfo={false} strokeColor={BRAND_COLOR} />
                  </div>
                </div>
              );
            }) : <div className="col-span-5"><Empty description="Chưa có dữ liệu bàn" /></div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
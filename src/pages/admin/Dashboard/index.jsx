import invoiceAPI from '@/configs/invoice.api';
import { FireOutlined, ShopOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Empty, Progress, Spin, Statistic, Table, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const BRAND_COLOR = '#f07f29';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]); // Dùng invoices làm nguồn dữ liệu chính cho doanh thu
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    tableOccupancy: 0,
  });

  // 1. Logic tính Top món ăn: Lấy từ các hóa đơn đã thanh toán để đảm bảo tính thực tế
  const topDishesData = useMemo(() => {
    const dishCounts = {};
    // Quét qua tất cả hóa đơn, sau đó quét qua từng order trong hóa đơn đó (nếu có populate items)
    // Hoặc đơn giản là quét qua các items của hóa đơn nếu backend trả về items kèm theo
    invoices.forEach(inv => {
      // Giả sử backend trả về invoice kèm thông tin món (nếu không, dùng dữ liệu orders)
      // Ở đây mình ưu tiên tính từ orders đã hoàn thành
      inv.order_ids?.forEach(order => {
        order.items?.forEach(item => {
          const name = item.dish_id?.dish_name || "Món ẩn";
          dishCounts[name] = (dishCounts[name] || 0) + (item.quantity || 0);
        });
      });
    });

    return Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [invoices]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [invoicesRes] = await Promise.all([
        invoiceAPI.getAll(),
      ]);

      // KIỂM TRA PHẢN HỒI: Khớp với dữ liệu JSON thực tế của Khanh
      const allInvoices = invoicesRes.data?.invoices || invoicesRes.data?.data || invoicesRes.data || [];

      // Đảm bảo allInvoices là mảng
      const invoiceList = Array.isArray(allInvoices) ? allInvoices : [];

      // SẮP XẾP: Đưa hóa đơn mới nhất lên đầu
      const sortedInvoices = [...invoiceList].sort((a, b) =>
        new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      );

      setInvoices(sortedInvoices);

      // TÍNH DOANH THU THỰC TẾ
      const totalRevenue = sortedInvoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);

      setStats({
        totalRevenue,
        orderCount: sortedInvoices.length, // Số lượng hóa đơn đã thanh toán
        tableOccupancy: 65,
      });
    } catch (error) {
      console.error("Lỗi fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (v) => <span className="font-mono font-bold text-blue-600 text-xs">{v}</span>,
    },
    {
      title: 'Bàn',
      dataIndex: 'table_id',
      key: 'table_id',
      render: (table) => <Tag color="orange" className='font-bold'>Bàn {table?.table_number || '?'}</Tag>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'right',
      render: (v) => <span className="font-black text-gray-800">{new Intl.NumberFormat('vi-VN').format(v)}đ</span>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v) => <span className='text-gray-400 text-xs'>{new Date(v).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>,
    }
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Spin size="large" tip="Đang tính toán doanh thu..." /></div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <section className="mb-8 flex justify-between items-end">
        <div>
          <Breadcrumb items={[{ title: 'Roosta' }, { title: 'Dashboard' }]} className="mb-2" />
          <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter">Hệ thống Thống kê</h1>
        </div>
        <Button onClick={fetchDashboardData} icon={<FireOutlined />} className='border-none shadow-sm font-bold'>Làm mới số liệu</Button>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden relative">
          <div className='absolute top-[-10px] right-[-10px] opacity-5 text-orange-600'><ShopOutlined style={{ fontSize: '80px' }} /></div>
          <Statistic
            title={<span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Doanh thu tổng</span>}
            value={stats.totalRevenue}
            suffix="đ"
            valueStyle={{ color: BRAND_COLOR, fontWeight: 900, fontSize: '28px' }}
          />
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <Statistic
            title={<span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Hóa đơn đã chốt</span>}
            value={stats.orderCount}
            valueStyle={{ fontWeight: 900, fontSize: '28px' }}
          />
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <div className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-4">Lấp đầy bàn</div>
          <Progress percent={stats.tableOccupancy} strokeColor={BRAND_COLOR} status="active" strokeWidth={15} strokeLinecap="round" />
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <Statistic
            title={<span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Hài lòng</span>}
            value={98.5}
            suffix="%"
            valueStyle={{ color: '#3f8600', fontWeight: 900, fontSize: '28px' }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Table Lịch sử */}
        <Card className="xl:col-span-2 rounded-3xl border-none shadow-sm"
          title={<span className="font-black uppercase italic text-gray-400 text-xs tracking-widest">Lịch sử giao dịch mới nhất</span>}>
          <Table
            columns={columns}
            dataSource={invoices.slice(0, 6)}
            pagination={false}
            rowKey="_id"
            className="custom-table"
          />
        </Card>

        {/* Món ăn bán chạy */}
        <Card className="rounded-3xl border-none shadow-sm"
          title={<span className="font-black uppercase italic text-gray-400 text-xs tracking-widest">Món ăn thịnh hành</span>}>
          <div className="space-y-8 mt-4">
            {topDishesData.length > 0 ? topDishesData.map((dish, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2 font-black text-gray-700 text-xs uppercase">
                  <span>{dish.name}</span>
                  <span className="text-orange-500 italic">{dish.count} món</span>
                </div>
                <Progress
                  percent={Math.round((dish.count / topDishesData[0].count) * 100)}
                  showInfo={false}
                  strokeColor={index === 0 ? '#ff4d4f' : BRAND_COLOR}
                  strokeWidth={10}
                />
              </div>
            )) : <Empty description="Chưa có dữ liệu bán hàng" />}
          </div>
        </Card>
      </div>
    </div>
  );
}
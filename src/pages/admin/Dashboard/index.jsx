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

    // Duyệt qua danh sách hóa đơn đang có
    invoices.forEach(inv => {
      // 1. Kiểm tra mảng order_ids (Nơi chứa các đơn hàng của hóa đơn đó)
      const orders = inv.order_ids || [];

      orders.forEach(order => {
        // 2. Kiểm tra mảng items (Danh sách món trong từng đơn)
        // Lưu ý: Backend cần phải .populate('order_ids.items.dish_id') 
        const items = order.items || [];

        items.forEach(item => {
          // Lấy tên món từ dish_id (nếu đã populate) hoặc từ chính item
          const name = item.dish_id?.dish_name || item.name || "Món ẩn";
          const quantity = Number(item.quantity) || 0;

          // CHỈ TÍNH TIỀN MÓN KHÔNG BỊ HỦY (Theo logic 4 trạng thái của Khanh)
          const status = item.status?.toLowerCase();
          if (status !== 'canceled' && status !== 'cancelled' && status !== 'đã hủy') {
            dishCounts[name] = (dishCounts[name] || 0) + quantity;
          }
        });
      });
    });

    // 3. Chuyển kết quả sang mảng để hiển thị biểu đồ
    const result = Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count) // Món bán chạy nhất lên đầu
      .slice(0, 5); // Lấy Top 5 món

    return result;
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
    <div className="min-h-screen font-sans">
      <section className="mb-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-bold text-3xl mb-2">Hệ thống thống kê</h1>
            <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Thống kê' }]} />
          </div>
          <Button type="primary" className="rounded-xl flex items-center gap-2" icon={<FireOutlined />} onClick={fetchDashboardData}>
            Làm mới số liệu
          </Button>
        </div>
      </section>

      <Card className="shadow-sm rounded-2xl mb-8" title="Tổng quan">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden relative">
            <div className='absolute top-[-10px] right-[-10px] opacity-5 text-orange-600'><ShopOutlined style={{ fontSize: '80px' }} /></div>
            <Statistic
              title={<span className="text-sm text-slate-500">Doanh thu tổng</span>}
              value={stats.totalRevenue}
              suffix="đ"
              valueStyle={{ color: BRAND_COLOR, fontWeight: 700, fontSize: '24px' }}
            />
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <Statistic
              title={<span className="text-sm text-slate-500">Hóa đơn đã chốt</span>}
              value={stats.orderCount}
              valueStyle={{ fontWeight: 700, fontSize: '24px' }}
            />
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <div className="text-sm text-slate-500 mb-4">Lấp đầy bàn</div>
            <Progress percent={stats.tableOccupancy} strokeColor={BRAND_COLOR} status="active" strokeWidth={15} strokeLinecap="round" />
          </Card>

          <Card className="rounded-2xl border-none shadow-sm">
            <Statistic
              title={<span className="text-sm text-slate-500">Hài lòng</span>}
              value={98.5}
              suffix="%"
              valueStyle={{ color: '#3f8600', fontWeight: 700, fontSize: '24px' }}
            />
          </Card>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Table Lịch sử */}
        <Card className="xl:col-span-2 rounded-2xl border-none shadow-sm"
          title="Lịch sử giao dịch mới nhất">
          <Table
            columns={columns}
            dataSource={invoices.slice(0, 6)}
            pagination={false}
            rowKey="_id"
            className="custom-table"
          />
        </Card>

        {/* Món ăn bán chạy */}
        <Card className="rounded-2xl border-none shadow-sm"
          title="Món ăn thịnh hành">
          <div className="space-y-6 mt-4">
            {topDishesData.length > 0 ? topDishesData.map((dish, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex justify-between mb-2 text-sm font-semibold text-slate-800">
                  <span>{dish.name}</span>
                  <span className="text-orange-500">{dish.count} món</span>
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
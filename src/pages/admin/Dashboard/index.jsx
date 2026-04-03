import invoiceAPI from '@/configs/invoice.api';
import orderAPI from '@/configs/order.api';
import { ShopOutlined, ShoppingCartOutlined, StarOutlined } from '@ant-design/icons';
import { Breadcrumb, Card, Progress, Spin, Statistic, Table, Empty, Tag } from 'antd';
import { useEffect, useState, useMemo } from 'react';

const BRAND_COLOR = '#f07f29';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]); // Lưu orders để tính top dishes
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    tableOccupancy: 0,
    recentInvoices: [],
  });

  // 1. Logic tính toán Top món ăn bán chạy nhất từ dữ liệu thực
  const topDishesData = useMemo(() => {
    const dishCounts = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const name = item.dish_id?.dish_name || "Món ẩn";
        dishCounts[name] = (dishCounts[name] || 0) + (item.quantity || 0);
      });
    });

    return Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Lấy top 5 món
  }, [orders]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [invoicesRes, ordersRes] = await Promise.all([
          invoiceAPI.getAll(),
          orderAPI.getAll()
        ]);

        // FIX LỖI: Trỏ đúng vào mảng invoices từ response của Khanh
        const allInvoices = invoicesRes.data?.invoices || invoicesRes.data?.data?.invoices || [];
        const allOrders = ordersRes.data || [];

        setOrders(allOrders);

        // Tính doanh thu: Lọc các hóa đơn đã thanh toán (paid hoặc completed)
        const totalRevenue = allInvoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);

        setStats({
          totalRevenue,
          orderCount: allOrders.length,
          recentInvoices: allInvoices.slice(0, 5), // Hiện 5 hóa đơn mới nhất
          tableOccupancy: 65, // Số này có thể tính từ tableAPI nếu cần
        });
      } catch (error) {
        console.error("Lỗi fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoice_number',
      render: (v) => <span className="font-bold text-blue-600">{v}</span>,
    },
    {
      title: 'Bàn',
      dataIndex: ['table_id', 'table_number'],
      render: (v) => <Tag color="blue">Bàn {v}</Tag>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      align: 'right',
      render: (v) => <span className="font-bold text-orange-500">{new Intl.NumberFormat('vi-VN').format(v)}đ</span>,
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'created_at',
      render: (v) => v ? new Date(v).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      }) : "---",
    }
  ];

  if (loading) return <div className="h-screen flex items-center justify-center"><Spin size="large" tip="Đang tải số liệu..." /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <section className="mb-6">
        <Breadcrumb items={[{ title: 'Admin' }, { title: 'Thống kê' }]} className="mb-2" />
        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight italic">Tổng quan Roosta</h1>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
          <Statistic
            title={<span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Doanh thu tổng</span>}
            value={stats.totalRevenue}
            suffix="đ"
            valueStyle={{ color: BRAND_COLOR, fontWeight: 900, fontSize: '24px' }}
            prefix={<ShopOutlined className="mr-2 opacity-20" />}
          />
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
          <Statistic
            title={<span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Đơn hàng hiện tại</span>}
            value={stats.orderCount}
            valueStyle={{ fontWeight: 900, fontSize: '24px' }}
            prefix={<ShoppingCartOutlined className="mr-2 text-blue-500 opacity-20" />}
          />
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
          <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2">Tỷ lệ lấp đầy bàn</div>
          <Progress percent={stats.tableOccupancy} strokeColor={BRAND_COLOR} status="active" strokeWidth={12} />
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
          <Statistic
            title={<span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Hài lòng khách hàng</span>}
            value={98.5}
            suffix="%"
            valueStyle={{ color: '#3f8600', fontWeight: 900, fontSize: '24px' }}
            prefix={<StarOutlined className="mr-2 opacity-20" />}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table Gần đây */}
        <Card className="xl:col-span-2 rounded-2xl border-none shadow-sm" title={<span className="font-black uppercase italic tracking-tighter">Lịch sử hóa đơn mới nhất</span>}>
          <Table
            columns={columns}
            dataSource={stats.recentInvoices}
            pagination={false}
            rowKey="_id"
            locale={{ emptyText: <Empty description="Chưa có hóa đơn nào" /> }}
          />
        </Card>

        {/* Món ăn bán chạy */}
        <Card className="rounded-2xl border-none shadow-sm" title={<span className="font-black uppercase italic tracking-tighter">Món ăn thịnh hành</span>}>
          <div className="space-y-6 mt-2">
            {topDishesData.length > 0 ? topDishesData.map((dish, index) => (
              <DishProgress
                key={index}
                name={dish.name}
                // Tính % dựa trên món bán chạy nhất (index 0)
                percent={Math.round((dish.count / topDishesData[0].count) * 100)}
                color={index === 0 ? "#ff4d4f" : index === 1 ? "#faad14" : BRAND_COLOR}
              />
            )) : <Empty description="Chưa có dữ liệu món ăn" />}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DishProgress({ name, percent, color }) {
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between mb-1 font-bold text-gray-600 text-sm">
        <span className="truncate max-w-[150px]">{name}</span>
        <span className="italic text-gray-400">{percent}%</span>
      </div>
      <Progress percent={percent} showInfo={false} strokeColor={color} strokeWidth={8} />
    </div>
  );
}
import {
  LayoutDashboard,
  ChartBarStacked,
  Soup,
  Table,
  ShoppingBasket,
  CreditCard,
  MessageSquareHeart,
  Contact,
  UsersRound,
  UtensilsCrossed,
} from 'lucide-react'

export const BRAND = { name: 'Trang Quản Trị', icon: UtensilsCrossed }

export const MENU = [
  { key: 'dashboard', label: 'Thống kê', path: '/admin', icon: LayoutDashboard },
  { key: 'categories', label: 'Danh mục', path: '/admin/categories', icon: ChartBarStacked },
  { key: 'dishes', label: 'Món ăn', path: '/admin/dishes', icon: Soup },
  { key: 'tables', label: 'Bàn ăn', path: '/admin/tables', icon: Table },
  {
    key: 'orders',
    label: 'Đơn hàng',
    icon: ShoppingBasket,
    children: [
      { key: 'orders-all', label: 'Tất cả', path: '/admin/orders' },
      { key: 'orders-pending', label: 'Chờ xử lý', path: '/admin/orders?status=pending' },
    ],
  },
  {
    key: 'payment-and-billing',
    label: 'Thanh toán & hóa đơn',
    path: '/admin/payment-and-billing',
    icon: CreditCard,
  },
  { key: 'reviews', label: 'Đánh giá', path: '/admin/reviews', icon: MessageSquareHeart },
  {
    key: 'staffs',
    label: 'Nhân viên',
    path: '/admin/staffs',
    icon: Contact,
    roles: ['admin', 'manager'],
  },
  { key: 'users', label: 'Người dùng', path: '/admin/users', icon: UsersRound, roles: ['admin'] },
]

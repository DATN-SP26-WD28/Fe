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

export const BRAND = { name: 'Quản trị viên', icon: UtensilsCrossed }

export const MENU = [
  { key: 'dashboard', label: 'Thống kê', path: '/admin', icon: LayoutDashboard },
  { key: 'categories', label: 'Danh mục', path: '/admin/categories', icon: ChartBarStacked },
  { key: 'dishes', label: 'Món ăn', path: '/admin/dishes', icon: Soup },
  { key: 'tables', label: 'Bàn ăn', path: '/admin/tables', icon: Table },
  { key: 'orders', label: 'Đơn hàng', icon: ShoppingBasket, path: '/admin/orders'},
  {
    key: 'payment-and-billing',
    label: 'Thanh toán & hóa đơn',
    path: '/admin/payment-and-billing',
    icon: CreditCard,
  },
  {
    key: 'staffs',
    label: 'Nhân viên',
    path: '/admin/staffs',
    icon: Contact,
    roles: ['admin', 'manager'],
  },
]

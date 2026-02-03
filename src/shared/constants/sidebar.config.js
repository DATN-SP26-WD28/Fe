import { DashboardOutlined, UserOutlined, ShoppingOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons'

export const BRAND = {
    icon: DashboardOutlined,
    name: 'Admin Dashboard',
}

export const MENU = [
    {
        key: 'dashboard',
        icon: DashboardOutlined,
        label: 'Dashboard',
        path: '/admin',
    },
    {
        key: 'users',
        icon: UserOutlined,
        label: 'Người dùng',
        path: '/admin/users',
        children: [
            {
                key: 'users-list',
                label: 'Danh sách',
                path: '/admin/users/list',
            },
            {
                key: 'users-add',
                label: 'Thêm mới',
                path: '/admin/users/add',
            },
        ],
    },
    {
        key: 'orders',
        icon: ShoppingOutlined,
        label: 'Đơn hàng',
        path: '/admin/orders',
    },
    {
        key: 'analytics',
        icon: BarChartOutlined,
        label: 'Thống kê',
        path: '/admin/analytics',
    },
    {
        key: 'settings',
        icon: SettingOutlined,
        label: 'Cài đặt',
        path: '/admin/settings',
    },
]

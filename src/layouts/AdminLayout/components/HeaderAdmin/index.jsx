import { Layout, Avatar, Button, Dropdown } from 'antd'
import { BellOutlined, UserOutlined, DownOutlined } from '@ant-design/icons'

const { Header } = Layout

const USER_MENU_ITEMS = [
  { key: 'profile', label: 'Hồ sơ' },
  { key: 'settings', label: 'Cài đặt' },
  { type: 'divider' },
  { key: 'logout', label: 'Đăng xuất', danger: true },
]

const HeaderAdmin = () => {
  return (
    <Header className="!bg-white !border-b !border-gray-100 !px-6 flex items-center">
      <div className="flex items-center justify-end w-full gap-1">
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined />}
          className="!text-gray-500 hover:!text-gray-800"
        />
        <Dropdown menu={{ items: USER_MENU_ITEMS }} trigger={['click']}>
          <button className="flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Avatar size={32} icon={<UserOutlined />} className="!bg-red-600" />
            <span className="hidden md:inline text-sm font-medium text-gray-700">Admin</span>
            <DownOutlined className="text-[10px] text-gray-400" />
          </button>
        </Dropdown>
      </div>
    </Header>
  )
}

export default HeaderAdmin

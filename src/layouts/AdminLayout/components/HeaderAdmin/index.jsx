import { Layout, Avatar, Button, Dropdown, message } from 'antd'
import { BellOutlined, UserOutlined, DownOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { clearAuthSession, getAuthSession } from '@/shared/utils/authSession'

const { Header } = Layout

const USER_MENU_ITEMS = [
  { key: 'profile', label: 'Hồ sơ' },
  { key: 'settings', label: 'Cài đặt' },
  { type: 'divider' },
  { key: 'logout', label: 'Đăng xuất', danger: true },
]

const HeaderAdmin = () => {
  const navigate = useNavigate()
  const { user } = getAuthSession()

  const handleMenuClick = ({ key }) => {
    if (key !== 'logout') return

    clearAuthSession()
    message.success('Đăng xuất thành công')
    navigate('/login', { replace: true })
  }

  return (
    <Header className="!bg-white !border-b !border-gray-100 !px-6 flex items-center">
      <div className="flex items-center justify-end w-full gap-1">
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined />}
          className="!text-gray-500 hover:!text-gray-800"
        />
        <Dropdown menu={{ items: USER_MENU_ITEMS, onClick: handleMenuClick }} trigger={['click']}>
          <button className="flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Avatar size={32} icon={<UserOutlined />} className="!bg-brand" />
            <span className="hidden md:inline text-sm font-medium text-gray-700">
              {user?.username || 'Admin'}
            </span>
            <DownOutlined className="text-[10px] text-gray-400" />
          </button>
        </Dropdown>
      </div>
    </Header>
  )
}

export default HeaderAdmin

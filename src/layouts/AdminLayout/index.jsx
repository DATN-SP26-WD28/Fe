import { useState } from 'react'
import { Outlet } from 'react-router'
import { Layout } from 'antd'
const { Content } = Layout
// components
import Sidebar from './components/Sidebar'
import HeaderAdmin from './components/HeaderAdmin'
import FooterAdmin from './components/FooterAdmin'

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const role = 'admin' // Data test quyền

  return (
    <Layout className="h-screen">
      <Sidebar role={role} collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <HeaderAdmin />
        <Content className="p-4 md:p-6 overflow-auto">
          <Outlet />
        </Content>
        <FooterAdmin />
      </Layout>
    </Layout>
  )
}

export default AdminLayout

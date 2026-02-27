import React, { useState } from 'react'
import { Layout } from 'antd'
import SidebarMenu from './SidebarMenu'
import { BRAND } from '@/shared/constants/sidebar.config'

const { Sider } = Layout

export default function Sidebar({ role, collapsed: collapsedProp, onCollapse }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = typeof collapsedProp === 'boolean' ? collapsedProp : internalCollapsed
  const Icon = BRAND.icon

  const handleCollapse = (v) => {
    if (onCollapse) onCollapse(v)
    else setInternalCollapsed(v)
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={handleCollapse}
      width={260}
      collapsedWidth={64}
      breakpoint="lg"
      onBreakpoint={(broken) => {
        if (typeof collapsedProp !== 'boolean') setInternalCollapsed(broken)
      }}
      className="!bg-white !border-r !border-gray-100"
    >
      <div className="flex items-center gap-2 w-full px-4 h-16">
        <a href="/admin" className="w-16 h-16w-16 rounded-2xl grid place-items-center">
          <img src="/logo-roosta.png" alt="Roosta Logo" width={50} />
        </a>
        {!collapsed && <span className="text-base font-semibold tracking-tight">{BRAND.name}</span>}
      </div>
      <SidebarMenu role={role} />
    </Sider>
  )
}

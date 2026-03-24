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
      <div className="flex items-center gap-2 w-full px-4 h-16 border-b border-gray-100">
        <a href="/admin" className="w-9 h-9 shrink-0 rounded-xl grid place-items-center overflow-hidden">
          <img src="/logo-roosta.png" alt="Roosta Logo" width={36} height={36} className="object-contain" />
        </a>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-gray-800 truncate">
            {BRAND.name}
          </span>
        )}
      </div>
      <SidebarMenu role={role} />
    </Sider>
  )
}

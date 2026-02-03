import React, { useState } from 'react'
import { Layout } from 'antd'
import SidebarBrand from './SidebarBrand'
import SidebarMenu from './SidebarMenu'

const { Sider } = Layout

/**
 * Props:
 * - role: 'admin' | 'manager' | 'staff' | undefined
 * - collapsed?: boolean
 * - onCollapse?: (boolean) => void
 */
export default function Sidebar({ role, collapsed: collapsedProp, onCollapse }) {
    const [internalCollapsed, setInternalCollapsed] = useState(false)
    const collapsed =
        typeof collapsedProp === 'boolean' ? collapsedProp : internalCollapsed

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
            <SidebarBrand collapsed={collapsed} />
            <SidebarMenu role={role} />
        </Sider>
    )
}

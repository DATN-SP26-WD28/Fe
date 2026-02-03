import React, { useMemo } from 'react'
import { Menu } from 'antd'
import { MENU } from '@/shared/constants/sidebar.config'
import { buildMenuItems, computeKeys } from '@/shared/utils/menuUtils'
import { useLocation } from 'react-router'

export default function SidebarMenu({ role }) {
    const location = useLocation()

    const { selectedKeys, openKeys, items } = useMemo(() => {
        const keys = computeKeys(location.pathname)
        return {
            ...keys,
            items: buildMenuItems(MENU, role),
        }
    }, [location.pathname, role])

    return (
        <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            items={items}
            className="!border-r-0"
        />
    )
}

import React from 'react'

export function buildMenuItems(menu, role) {
    return menu.map((item) => {
        const Icon = item.icon
        const menuItem = {
            key: item.key,
            icon: Icon ? React.createElement(Icon) : null,
            label: item.label,
        }

        if (item.children) {
            menuItem.children = item.children.map((child) => ({
                key: child.key,
                label: child.label,
            }))
        }

        return menuItem
    })
}

export function computeKeys(pathname) {
    const segments = pathname.split('/').filter(Boolean)
    const selectedKey = segments[1] || 'dashboard'
    const openKey = segments[1] || 'dashboard'

    return {
        selectedKeys: [selectedKey],
        openKeys: [openKey],
    }
}

import React from 'react'
import { BRAND } from '@/shared/constants/sidebar.config'

export default function SidebarBrand({ collapsed }) {
    const Icon = BRAND.icon
    return (
        <div className="flex items-center gap-2 px-4 h-16">
            <div className="w-9 h-9 rounded-2xl bg-gray-100 grid place-items-center">
                <Icon size={18} />
            </div>
            {!collapsed && <span className="text-base font-semibold tracking-tight">{BRAND.name}</span>}
        </div>
    )
}

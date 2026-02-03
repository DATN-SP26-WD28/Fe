/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import { NavLink } from 'react-router'

export const canSee = (item, userRole) => !item.roles || (userRole && item.roles.includes(userRole))

export const computeKeys = (pathname) => {
  const seg = pathname.split('/').filter(Boolean)
  const selected = seg[1] || 'dashboard'
  const open = seg[1] === 'orders' ? ['orders'] : []
  return { selectedKeys: [selected], openKeys: open }
}

export const LinkLabel = ({ to, children }) =>
  to ? (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center gap-2 ${isActive ? 'font-medium' : ''}`}
    >
      {children}
    </NavLink>
  ) : (
    <span className="flex items-center gap-2">{children}</span>
  )

/* Nested children */
export const buildMenuItems = (menu, role) =>
  menu
    .filter((m) => canSee(m, role))
    .map((m) => {
      const iconEl = m.icon ? <m.icon size={20} /> : null
      if (m.children?.length) {
        return {
          key: m.key,
          icon: iconEl,
          label: <LinkLabel>{m.label}</LinkLabel>,
          children: m.children
            .filter((c) => canSee(c, role))
            .map((c) => ({
              key: c.key,
              icon: c.icon ? <c.icon size={18} /> : null,
              label: <LinkLabel to={c.path}>{c.label}</LinkLabel>,
            })),
        }
      }
      return {
        key: m.key,
        icon: iconEl,
        label: <LinkLabel to={m.path}>{m.label}</LinkLabel>,
      }
    })

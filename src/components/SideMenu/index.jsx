import React from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CloseOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  LogoutOutlined,
} from '@ant-design/icons'

const SideMenu = ({ isOpen, onClose }) => {
  const { tableId } = useParams()

  const menuItems = [
    { key: 'home', label: 'Trang chủ', icon: HomeOutlined, to: '/' },
    { key: 'menu', label: 'Thực Đơn', icon: AppstoreOutlined, to: '/menu' },
    {
      key: 'orders',
      label: 'Đơn hàng',
      icon: ShoppingOutlined,
      to: `/table-order/${tableId}/orders`,
    },
  ]

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-60 w-[85vw] max-w-[320px] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)] border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 via-white to-orange-50">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Menu</h3>
            <p className="text-sm text-slate-500">Điều hướng nhanh</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            aria-label="Đóng menu"
          >
            <CloseOutlined />
          </button>
        </div>

        <nav className="p-5">
          <ul className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.key}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-3xl border border-transparent px-4 py-3 text-slate-700 transition hover:border-orange-100 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition group-hover:bg-orange-200">
                      <Icon />
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}

            <li>
              <button
                type="button"
                onClick={() => {
                  onClose()
                }}
                className="flex w-full items-center gap-3 rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-left text-red-600 transition hover:bg-red-100"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <LogoutOutlined />
                </span>
                <span className="font-medium">Đăng Xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default SideMenu

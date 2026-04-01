import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { CloseOutlined } from '@ant-design/icons'

const SideMenu = ({ isOpen, onClose }) => {
  const {tableId} = useParams();
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-60 w-[80vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Menu</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><CloseOutlined /></button>
        </div>

        <nav className="p-4">
          <ul className="flex flex-col gap-3">
            <li>
              <Link to="/" onClick={onClose} className="block px-3 py-2 rounded hover:bg-gray-100">Trang chủ</Link>
            </li>
            <li>
              <Link to="/menu" onClick={onClose} className="block px-3 py-2 rounded hover:bg-gray-100">Thực Đơn</Link>
            </li>
            <li>
              <Link to={`/table-order/${tableId}/orders`} onClick={onClose} className="block px-3 py-2 rounded hover:bg-gray-100">Đơn hàng</Link>
            </li>
            <li>
              <button onClick={() => { /* TODO: implement logout */ onClose() }} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Đăng Xuất</button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default SideMenu

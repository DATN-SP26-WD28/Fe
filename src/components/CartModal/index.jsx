import React from 'react'
import { useDispatch } from 'react-redux'
import { removeItem, updateQuantity, clearCart } from '@/redux/slices/cart.slices'
import { parsePrice, formatCurrency } from '@/shared/utils/currency'
import { FileTextOutlined, CloseOutlined } from '@ant-design/icons'

const CartModal = ({ items, isModalOpen, onCloseModal }) => {
  const dispatch = useDispatch()

  if (!isModalOpen) return null

  const handleDecrement = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({ id, quantity: currentQty - 1 }))
    } else {
      dispatch(removeItem(id))
    }
  }

  const handleIncrement = (id, currentQty) => {
    dispatch(updateQuantity({ id, quantity: currentQty + 1 }))
  }

  const getPriceNum = (price) => Number(parsePrice(price) || 0)

  const formatPrice = (price) => formatCurrency(price)

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onCloseModal}
        aria-label="Close cart modal"
      />

      {/* Modal — slides up from bottom */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-end md:items-center md:justify-center pointer-events-none">
        <div className="bg-white w-screen rounded-t-2xl md:rounded-2xl shadow-2xl pointer-events-auto flex flex-col h-[85vh] md:h-[85vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 border-b border-gray-200 shrink-0">
            <button
              onClick={() => { dispatch(clearCart()); onCloseModal() }}
              className="text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
            >
              Xóa tất cả
            </button>
            <h2 className="text-base font-bold text-gray-900">Giỏ hàng</h2>
            <button
              onClick={onCloseModal}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Close"
            >
              <CloseOutlined style={{ fontSize: 18 }} />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Giỏ hàng trống
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const priceNum = getPriceNum(item.price)
                  const originalPrice = Math.ceil(priceNum * 1.07)

                  return (
                    <div key={item.id} className="px-4 py-4 md:px-5 flex gap-3 items-start">
                      {/* Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-18 h-18 rounded-lg object-cover shrink-0"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base leading-snug">
                          {item.name}
                        </h3>

                        {/* Per-item note */}
                        <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                          <FileTextOutlined style={{ fontSize: 13 }} />
                          <input
                            type="text"
                            placeholder="Thêm ghi chú..."
                            className="flex-1 bg-transparent text-xs outline-none placeholder-gray-300 text-gray-500"
                          />
                        </div>

                        {/* Price row + Qty controls */}
                        <div className="flex items-center justify-between mt-2">
                          {/* Prices */}
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-brand font-semibold text-sm md:text-base">
                              {formatPrice(priceNum)}
                            </span>
                            <span className="text-gray-400 line-through text-xs">
                              {formatPrice(originalPrice)}
                            </span>
                          </div>

                          {/* Qty Controls */}
                          <div className="flex items-center shrink-0">
                            <button
                              onClick={() => handleDecrement(item.id, item.quantity)}
                              className="w-7 h-7 flex items-center justify-center rounded border border-brand text-brand text-base font-bold hover:bg-brand-light transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrement(item.id, item.quantity)}
                              className="w-7 h-7 flex items-center justify-center rounded bg-brand text-white text-base font-bold hover:bg-brand-dark transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

export default CartModal

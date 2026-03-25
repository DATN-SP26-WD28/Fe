import { ShoppingBasket } from 'lucide-react'
import React from 'react'
import { parsePrice, formatCurrency } from '@/shared/utils/currency'

const CartSummaryBar = ({ items, onClick }) => {
  if (items.length === 0) return null

  const totalPrice = items.reduce((sum, item) => {
    const priceNum = Number(parsePrice(item.price) || 0)
    return sum + priceNum * item.quantity
  }, 0)

  const originalTotal = Math.ceil(totalPrice * 1.07)

  const formatPrice = (price) => formatCurrency(price)

  // Total items count
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 shadow-2xl z-60">
      <div className="flex items-center gap-3">
        {/* Basket icon with badge */}
        <div
          onClick={onClick}
          className="relative cursor-pointer shrink-0"
          aria-label="Xem giỏ hàng"
        >
          <ShoppingBasket />
          <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {totalQty}
          </span>
        </div>

        {/* Price info */}
        <div onClick={onClick} className="flex flex-col cursor-pointer flex-1">
          <span className="text-gray-400 line-through text-xs leading-none">
            {formatPrice(originalTotal)}
          </span>
          <span className="text-brand font-bold text-base leading-tight">
            {formatPrice(totalPrice)}
          </span>
        </div>

        {/* CTA button */}
        <button
          onClick={onClick}
          className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shrink-0"
        >
          Gọi món
        </button>
      </div>
    </div>
  )
}

export default CartSummaryBar

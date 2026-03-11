import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [], // Array of { id, name, price, image, quantity, description }
  isOpen: false, // Modal open/close state
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { id, name, price, image, description } = action.payload
      const existingItem = state.items.find((item) => item.id === id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({
          id,
          name,
          price,
          image,
          description,
          quantity: 1,
        })
      }
    },

    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((item) => item.id === id)
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item.id !== id)
        } else {
          item.quantity = quantity
        }
      }
    },

    openCart: (state) => {
      state.isOpen = true
    },

    closeCart: (state) => {
      state.isOpen = false
    },

    clearCart: (state) => {
      state.items = []
      state.isOpen = false
    },
  },
})

export const { addItem, removeItem, updateQuantity, openCart, closeCart, clearCart } = cartSlice.actions
export default cartSlice.reducer

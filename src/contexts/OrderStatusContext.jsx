/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { normalizeOrderStatus } from '@/shared/constants/app.constants'
import orderAPI from '@/configs/order.api'

const OrderStatusContext = createContext(null)

const buildItemStatusMap = (orders = []) => {
  return orders.reduce((acc, order) => {
    const items = Array.isArray(order?.items) ? order.items : []
    items.forEach((item) => {
      if (!item?._id) return
      acc[item._id] = normalizeOrderStatus(item?.status)
    })
    return acc
  }, {})
}

export const OrderStatusProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [itemStatusById, setItemStatusById] = useState({})

  const hydrateOrders = useCallback((nextOrders = []) => {
    const safeOrders = Array.isArray(nextOrders) ? nextOrders : []
    setOrders(safeOrders)
    setItemStatusById(buildItemStatusMap(safeOrders))
  }, [])

  const normalizeOrder = (order) => ({
    ...order,
    items: Array.isArray(order?.items) ? order.items : [],
    key: order?._id,
  })

  const refreshOrders = useCallback(async () => {
    try {
      const res = await orderAPI.getAll()
      const actualOrders = res?.data?.data || res?.data || []
      if (Array.isArray(actualOrders)) {
        const normalizedOrders = actualOrders.map((o) => normalizeOrder(o))
        hydrateOrders(normalizedOrders)
      }
    } catch (err) {
      console.error('refreshOrders error', err)
    }
  }, [hydrateOrders])

  const applyItemStatusUpdate = useCallback((itemId, nextStatus) => {
    if (!itemId) return

    const normalizedStatus = normalizeOrderStatus(nextStatus)

    setItemStatusById((prev) => ({
      ...prev,
      [itemId]: normalizedStatus,
    }))

    setOrders((prevOrders) =>
      prevOrders.map((order) => ({
        ...order,
        items: (order?.items || []).map((item) =>
          item?._id === itemId
            ? {
                ...item,
                status: normalizedStatus,
              }
            : item,
        ),
      })),
    )
  }, [])

  const value = useMemo(
    () => ({
      orders,
      itemStatusById,
      hydrateOrders,
      refreshOrders,
      applyItemStatusUpdate,
    }),
    [orders, itemStatusById, hydrateOrders, refreshOrders, applyItemStatusUpdate],
  )

  return <OrderStatusContext.Provider value={value}>{children}</OrderStatusContext.Provider>
}

export const useOrderStatus = () => {
  const context = useContext(OrderStatusContext)
  if (!context) {
    throw new Error('useOrderStatus must be used within OrderStatusProvider')
  }
  return context
}

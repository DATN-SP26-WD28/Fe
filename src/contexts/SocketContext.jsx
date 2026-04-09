/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_EVENTS } from '@/shared/constants/socket.constants'

const SOCKET_URL = (import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:8888').replace(/\/$/, '')

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const socket = useMemo(
    () =>
      io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        withCredentials: true,
      }),
    [],
  )

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true)
      if (import.meta.env.DEV) {
        console.info('[socket] connected', socket.id)
      }
    }
    const onDisconnect = (reason) => {
      setIsConnected(false)
      if (import.meta.env.DEV) {
        console.info('[socket] disconnected', reason)
      }
    }

    socket.on(SOCKET_EVENTS.CONNECT, onConnect)
    socket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect)

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, onConnect)
      socket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect)
      socket.disconnect()
    }
  }, [socket])

  const value = useMemo(
    () => ({
      socket,
      isConnected,
    }),
    [socket, isConnected],
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

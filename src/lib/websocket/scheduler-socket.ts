'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  WebSocketMessage,
  TaskExecutionUpdate,
  LeaderElectionChange,
  UseSchedulerWebSocketOptions,
  WebSocketConnection,
} from '@/types/scheduler'

class SchedulerWebSocket {
  private socket: WebSocket | null = null
  private url: string
  private token?: string
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectInterval: number = 3000
  private isManuallyDisconnected: boolean = false
  private messageHandlers: Map<string, (data: unknown) => void> = new Map()
  private statusHandlers: Map<string, () => void> = new Map()

  // Event callbacks
  private onConnect?: () => void
  private onDisconnect?: () => void
  private onError?: (error: Error) => void
  private onMessage?: (message: WebSocketMessage) => void

  constructor(url: string, options: Partial<UseSchedulerWebSocketOptions> = {}) {
    this.url = url
    this.token = options.token
    this.maxReconnectAttempts = options.reconnectAttempts || 5
    this.reconnectInterval = options.reconnectInterval || 3000
    this.onConnect = options.onConnect
    this.onDisconnect = options.onDisconnect
    this.onError = options.onError
    this.onMessage = options.onMessage

    if (options.autoConnect !== false) {
      this.connect()
    }
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return
    }

    this.isManuallyDisconnected = false

    try {
      const wsUrl = new URL(this.url)
      if (this.token) {
        wsUrl.searchParams.set('token', this.token)
      }

      this.socket = new WebSocket(wsUrl.toString())

      this.socket.addEventListener('open', this.handleOpen.bind(this))
      this.socket.addEventListener('message', this.handleMessage.bind(this))
      this.socket.addEventListener('close', this.handleClose.bind(this))
      this.socket.addEventListener('error', this.handleError.bind(this))

      this.statusHandlers.forEach(handler => handler())
    } catch (error) {
      this.handleError(new Error(`WebSocket connection failed: ${error}`))
    }
  }

  disconnect(): void {
    this.isManuallyDisconnected = true
    this.reconnectAttempts = 0

    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect')
      this.socket = null
    }

    this.statusHandlers.forEach(handler => handler())
  }

  sendMessage(message: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message)
    }
  }

  subscribe(eventType: string, handler: (data: unknown) => void): () => void {
    this.messageHandlers.set(eventType, handler)

    return () => {
      this.messageHandlers.delete(eventType)
    }
  }

  onStatusChange(handler: () => void): () => void {
    const id = Math.random().toString(36)
    this.statusHandlers.set(id, handler)

    return () => {
      this.statusHandlers.delete(id)
    }
  }

  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    if (!this.socket) return 'disconnected'

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'error'
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  private handleOpen(): void {
    console.log('WebSocket connected to scheduler')
    this.reconnectAttempts = 0
    this.onConnect?.()
    this.statusHandlers.forEach(handler => handler())
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)

      // Handle specific message types
      const handler = this.messageHandlers.get(message.type)
      if (handler) {
        handler(message.payload)
      }

      // Call general message handler
      this.onMessage?.(message)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected from scheduler', event.code, event.reason)

    this.onDisconnect?.()
    this.statusHandlers.forEach(handler => handler())

    // Attempt to reconnect unless manually disconnected
    if (!this.isManuallyDisconnected && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  private handleError(error: Event | Error): void {
    const err = error instanceof Error ? error : new Error('WebSocket error')
    console.error('WebSocket error:', err)

    this.onError?.(err)
    this.statusHandlers.forEach(handler => handler())
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1)

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)

    setTimeout(() => {
      if (!this.isManuallyDisconnected) {
        this.connect()
      }
    }, delay)
  }

  setToken(token: string): void {
    this.token = token

    // Reconnect with new token if currently connected
    if (this.isConnected()) {
      this.disconnect()
      setTimeout(() => this.connect(), 100)
    }
  }

  clearToken(): void {
    this.token = undefined
  }

  destroy(): void {
    this.disconnect()
    this.messageHandlers.clear()
    this.statusHandlers.clear()
  }
}

// React hook for using WebSocket connection
export const useSchedulerWebSocket = (
  options: UseSchedulerWebSocketOptions
): WebSocketConnection => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

  const wsRef = useRef<SchedulerWebSocket | null>(null)

  const updateStatus = useCallback(() => {
    if (wsRef.current) {
      const status = wsRef.current.getConnectionStatus()
      setConnectionStatus(status)
      setIsConnected(status === 'connected')
      setIsConnecting(status === 'connecting')
    }
  }, [])

  useEffect(() => {
    const wsOptions = {
      ...options,
      onConnect: () => {
        updateStatus()
        options.onConnect?.()
      },
      onDisconnect: () => {
        updateStatus()
        options.onDisconnect?.()
      },
      onError: (error: Error) => {
        updateStatus()
        options.onError?.(error)
      },
      onMessage: (message: WebSocketMessage) => {
        setLastMessage(message)
        options.onMessage?.(message)
      },
    }

    wsRef.current = new SchedulerWebSocket(options.url, wsOptions)

    const unsubscribeStatus = wsRef.current.onStatusChange(updateStatus)

    return () => {
      unsubscribeStatus()
      wsRef.current?.destroy()
      wsRef.current = null
    }
  }, [options, updateStatus])

  const connect = useCallback(() => {
    wsRef.current?.connect()
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect()
  }, [])

  const sendMessage = useCallback((message: unknown) => {
    wsRef.current?.sendMessage(message)
  }, [])

  return {
    isConnected,
    isConnecting,
    lastMessage,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
  }
}

// Hook for subscribing to specific message types
export const useSchedulerWebSocketSubscription = (
  ws: WebSocketConnection,
  eventType: string,
  handler: (data: unknown) => void,
): void => {

  useEffect(() => {
    if (ws && 'subscribe' in ws) {
      const unsubscribe = (ws as unknown as SchedulerWebSocket).subscribe(eventType, handler)
      return unsubscribe
    }
  }, [ws, eventType, handler])
}

// Specialized hooks for different message types
export const useTaskExecutionUpdates = (
  ws: WebSocketConnection,
  onUpdate: (update: TaskExecutionUpdate) => void
): void => {
  useSchedulerWebSocketSubscription(ws, 'task_execution_update', (data: unknown) => onUpdate(data as TaskExecutionUpdate))
}

export const useLeaderElectionChanges = (
  ws: WebSocketConnection,
  onChange: (change: LeaderElectionChange) => void
): void => {
  useSchedulerWebSocketSubscription(ws, 'leader_election_change', (data: unknown) => onChange(data as LeaderElectionChange))
}

export const useSystemMetricsUpdates = (
  ws: WebSocketConnection,
  onUpdate: (metrics: unknown) => void
): void => {
  useSchedulerWebSocketSubscription(ws, 'system_metrics_update', onUpdate)
}

export const useTaskStatusChanges = (
  ws: WebSocketConnection,
  onStatusChange: (change: unknown) => void
): void => {
  useSchedulerWebSocketSubscription(ws, 'task_status_change', onStatusChange)
}

export const useAlertNotifications = (
  ws: WebSocketConnection,
  onAlert: (alert: unknown) => void
): void => {
  useSchedulerWebSocketSubscription(ws, 'alert', onAlert)
}

// Utility function to create WebSocket URL
export const createWebSocketUrl = (baseUrl: string, token?: string): string => {
  const url = new URL('/api/v1/admin/scheduler/stream', baseUrl)
  url.protocol = url.protocol.replace('http', 'ws')

  if (token) {
    url.searchParams.set('token', token)
  }

  return url.toString()
}

export default SchedulerWebSocket
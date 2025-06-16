"use client"

import { useState, useCallback } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}

interface UseToastReturn {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((newToast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toastWithId = { ...newToast, id }

    setToasts((prev) => [...prev, toastWithId])

    // Auto remove after duration
    const duration = newToast.duration || 5000
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, toast, removeToast }
}

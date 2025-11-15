'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
}

let toasts: Toast[] = []
let listeners: (() => void)[] = []

function notifyListeners() {
  listeners.forEach(listener => listener())
}

export function toast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = Math.random().toString(36).substring(7)
  toasts = [...toasts, { id, message, type, duration }]
  notifyListeners()

  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id)
      notifyListeners()
    }, duration)
  }
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const updateToasts = () => {
      setCurrentToasts([...toasts])
    }
    listeners.push(updateToasts)
    updateToasts()

    return () => {
      listeners = listeners.filter(l => l !== updateToasts)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {currentToasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`
                flex items-center gap-3 p-4 rounded-lg shadow-lg
                bg-background border border-border
                min-w-[300px] max-w-md
              `}
            >
              <div className={`${colors[toast.type]} p-2 rounded-full`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => {
                  toasts = toasts.filter(t => t.id !== toast.id)
                  notifyListeners()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}



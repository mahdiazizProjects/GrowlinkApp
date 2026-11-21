import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

// Outside a provider (e.g. in isolated tests) messages go to the console instead.
const fallback: ToastApi = {
  success: m => console.info(m),
  error: m => console.error(m),
  info: m => console.info(m)
}
const ToastContext = createContext<ToastApi>(fallback)

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)

/** Turns an unknown thrown value into a message a person can read. */
// eslint-disable-next-line react-refresh/only-export-components
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return fallback
}

const STYLES: Record<ToastKind, string> = {
  success: 'border-green-200 bg-green-50 text-green-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-primary-200 bg-white text-gray-900'
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++
    setToasts(prev => [...prev.slice(-3), { id, kind, message }])
    window.setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 4000)
  }, [dismiss])

  const api = useMemo<ToastApi>(() => ({
    success: m => push('success', m),
    error: m => push('error', m),
    info: m => push('info', m)
  }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-96 pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${STYLES[t.kind]}`}
          >
            <span className="mt-0.5 flex-shrink-0">
              {t.kind === 'success' && <CheckCircle size={18} className="text-green-600" />}
              {t.kind === 'error' && <AlertCircle size={18} className="text-red-600" />}
              {t.kind === 'info' && <Info size={18} className="text-primary-600" />}
            </span>
            <p className="flex-1 text-sm">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 text-gray-500 hover:text-gray-800"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

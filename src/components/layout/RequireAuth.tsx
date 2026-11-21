import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

/** Sends signed-out visitors to the sign-in page and brings them back afterwards. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { currentUser, authLoading } = useApp()
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace state={{ from: location.pathname + location.search }} />
  }

  return <>{children}</>
}

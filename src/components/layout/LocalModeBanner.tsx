import { useState } from 'react'
import { X } from 'lucide-react'
import { isCloudBackend } from '../../services/backend'

/** Makes it obvious when the app is running on browser-only demo storage instead of the real backend. */
export default function LocalModeBanner() {
  const [hidden, setHidden] = useState(false)
  if (isCloudBackend || hidden) return null
  return (
    <div className="bg-amber-100 border-b border-amber-200 text-amber-900 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <p className="flex-1">
          <strong>Local demo mode.</strong> No backend is configured, so accounts and data are stored only in this
          browser. Add <code className="font-mono">amplify_outputs.json</code> to connect the real backend (see README).
        </p>
        <button type="button" onClick={() => setHidden(true)} aria-label="Dismiss" className="text-amber-800 hover:text-amber-950">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

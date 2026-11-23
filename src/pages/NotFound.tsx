import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-10 text-center">
        <Compass className="mx-auto text-primary-600 mb-4" size={48} />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            Go home
          </Link>
          <Link to="/mentors" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Browse mentors
          </Link>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { User } from '../../types'
import { Star, Bookmark, BookmarkCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface MentorCardProps {
  mentor: User
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)

  const handleViewProfile = () => {
    navigate(`/mentors/${mentor.id}`)
  }

  const handleRequest = () => {
    setShowRequestModal(true)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    // TODO: Implement save/unsave via GraphQL mutation
  }

  const tags = mentor.skills?.slice(0, 3) || []
  const highlight = mentor.bio?.substring(0, 50) || 'Experienced mentor ready to help'

  return (
    <>
      <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
        {/* Top Section - Avatar, Name, Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {mentor.avatar ? (
              <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold">{mentor.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{mentor.name}</h3>
            <p className="text-sm text-gray-600 truncate">{mentor.title || 'Mentor'}</p>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Highlight */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{highlight}...</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={star <= Math.round(mentor.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">{mentor.rating?.toFixed(1) || 'No rating yet'}</span>
          {mentor.totalSessions && (
            <span className="text-xs text-gray-500">({mentor.totalSessions} sessions)</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleViewProfile}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
          >
            View Profile
          </button>
          <button
            onClick={handleRequest}
            className="flex-1 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-semibold"
          >
            Request
          </button>
          <button
            onClick={handleSave}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={isSaved ? 'Unsave' : 'Save'}
          >
            {isSaved ? (
              <BookmarkCheck size={18} className="text-primary-600" />
            ) : (
              <Bookmark size={18} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Mentorship</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send a message to {mentor.name} requesting mentorship.
            </p>
            <textarea
              placeholder="Hi! I'd like to request mentorship..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              defaultValue={`Hi ${mentor.name}! I'd like to request mentorship. I'm interested in learning about ${tags[0] || 'your expertise'}.`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement request via GraphQL mutation
                  setShowRequestModal(false)
                  alert('Request sent!')
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


import { useState } from 'react'
import { X, Calendar, Clock, MapPin, Video, DollarSign, AlertCircle } from 'lucide-react'
import { Session } from '../../types'
import { format } from 'date-fns'
import FeedbackPrompt from '../feedback/FeedbackPrompt'

interface SessionDetailModalProps {
  session: Session
  onClose: () => void
  onLeaveFeedback?: () => void
  onUpdateSession?: (sessionId: string, updates: Partial<Session>) => Promise<void>
  currentUserId: string
}

export default function SessionDetailModal({
  session,
  onClose,
  onLeaveFeedback,
  onUpdateSession,
  currentUserId
}: SessionDetailModalProps) {
  const [updating, setUpdating] = useState(false)
  const isMentee = session.menteeId === currentUserId
  const sessionTime = session.time && session.time.length >= 5 ? session.time.slice(0, 5) : session.date.slice(11, 16)
  const sessionDate = new Date(`${session.date.slice(0, 10)}T${sessionTime || '00:00'}:00`)
  const endTime = new Date(sessionDate.getTime() + session.duration * 60000)

  const handleAcceptCancellation = async () => {
    if (!onUpdateSession) return
    setUpdating(true)
    try {
      await onUpdateSession(session.id, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'mentor',
        cancellationReason: session.cancellationReason,
        menteeAcceptedCancellation: true,
        cancellationRequestedAt: undefined
      })
      onClose()
    } finally {
      setUpdating(false)
    }
  }

  const handleRejectCancellation = async () => {
    if (!onUpdateSession) return
    setUpdating(true)
    try {
      await onUpdateSession(session.id, {
        menteeAcceptedCancellation: false,
        cancellationRequestedAt: undefined,
        cancellationReason: undefined
      })
      onClose()
    } finally {
      setUpdating(false)
    }
  }

  // Fix: Check if mentor exists
  if (!session.mentor) return null;

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
          <p className="text-sm text-gray-600 mt-1">{session.topic}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${session.status === 'completed' || session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              session.status === 'confirmed' || session.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                session.status === 'pending' || session.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
            }`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Session Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-gray-900">{format(sessionDate, 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-semibold text-gray-900">
                {format(sessionDate, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </p>
              <p className="text-xs text-gray-500">{session.duration} minutes</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {session.type === 'in-person' ? (
              <MapPin className="text-primary-600 mt-1" size={20} />
            ) : (
              <Video className="text-primary-600 mt-1" size={20} />
            )}
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold text-gray-900">
                {session.type === 'in-person' ? 'In-Person' : 'Virtual'}
              </p>
              {session.venue && (
                <p className="text-xs text-gray-500 mt-1">{session.venue.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-semibold text-gray-900">${session.price}</p>
            </div>
          </div>
        </div>

        {/* Mentor requested cancellation (mentee can accept/reject) */}
        {isMentee && session.cancellationRequestedAt && onUpdateSession && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-amber-600 shrink-0" size={20} />
              <p className="font-semibold text-amber-800">Mentor requested to cancel this session</p>
            </div>
            <p className="text-sm text-amber-700">Reason: {session.cancellationReason}</p>
            <p className="text-xs text-amber-600">If you accept, the session will be cancelled. If you reject, the session stays and the mentor may be penalised for last-minute cancellation requests.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAcceptCancellation}
                disabled={updating}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
              >
                {updating ? 'Processing…' : 'Accept cancellation'}
              </button>
              <button
                type="button"
                onClick={handleRejectCancellation}
                disabled={updating}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
              >
                Reject (session stays)
              </button>
            </div>
          </div>
        )}

        {/* Topic */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Topic</p>
          <p className="font-semibold text-gray-900">{session.topic}</p>
        </div>

        {/* Participants */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Participants</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                {session.mentor.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Mentor</p>
                <p className="font-semibold text-gray-900">{session.mentor.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                {session.mentee?.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Mentee</p>
                <p className="font-semibold text-gray-900">{session.mentee?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Venue Details (if in-person) */}
        {session.type === 'in-person' && session.venue && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Venue Details</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{session.venue.name}</p>
              <p className="text-sm text-gray-600 mt-1">{session.venue.address}</p>
              <p className="text-sm text-gray-600">{session.venue.city}</p>
              {session.venue.amenities && session.venue.amenities.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1">Amenities:</p>
                  <div className="flex flex-wrap gap-2">
                    {session.venue.amenities.map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-white rounded text-xs text-gray-700">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Section (for mentees on completed sessions) */}
        {isMentee && (session.status === 'completed' || session.status === 'COMPLETED') && onLeaveFeedback && (
          <div className="border-t border-gray-200 pt-4">
            <FeedbackPrompt
              session={session}
              onLeaveFeedback={onLeaveFeedback}
            />
          </div>
        )}

        {/* Rating/Review (if exists) */}
        {session.rating && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Rating</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${star <= (session.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                >
                  ★
                </span>
              ))}
              <span className="ml-2 text-gray-600">{session.rating} out of 5</span>
            </div>
            {session.review && (
              <p className="text-sm text-gray-700 mt-2">{session.review}</p>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

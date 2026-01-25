import { X, Calendar, Clock, MapPin, Video, DollarSign } from 'lucide-react'
import { MentorSessionNotes, Session } from '../../types'
import { format, isValid, parse } from 'date-fns'
import FeedbackPrompt from '../feedback/FeedbackPrompt'

interface SessionDetailModalProps {
  session: Session
  onClose: () => void
  onLeaveFeedback?: () => void
  currentUserId: string
  sessionNotes?: MentorSessionNotes | null
  onUpdateNotes?: (noteId: string, updates: Partial<MentorSessionNotes>) => void
  onUpdateSession?: (sessionId: string, updates: Partial<Session>) => void
}

export default function SessionDetailModal({
  session,
  onClose,
  onLeaveFeedback,
  currentUserId,
  sessionNotes,
  onUpdateNotes,
  onUpdateSession
}: SessionDetailModalProps) {
  const isMentee = session.menteeId === currentUserId
  const sessionDate = (() => {
    if (session.date) {
      const fromIso = new Date(session.date)
      if (isValid(fromIso)) return fromIso
    }
    if (session.date && session.time) {
      const parsed = parse(`${session.date} ${session.time}`, 'yyyy-MM-dd h:mm a', new Date())
      if (isValid(parsed)) return parsed
    }
    return null
  })()
  const endTime = sessionDate ? new Date(sessionDate.getTime() + session.duration * 60000) : null
  const dateLabel = sessionDate ? format(sessionDate, 'EEEE, MMMM d, yyyy') : 'Date TBD'
  const timeLabel = sessionDate
    ? `${format(sessionDate, 'h:mm a')} - ${format(endTime ?? sessionDate, 'h:mm a')}`
    : 'Time TBD'
  const normalizedStatus = session.status.toLowerCase()
  const now = new Date()
  const hoursUntil = sessionDate ? (sessionDate.getTime() - now.getTime()) / 36e5 : null
  const canCancel = normalizedStatus !== 'cancelled' && normalizedStatus !== 'completed'
    && !!sessionDate && hoursUntil !== null && hoursUntil >= 24

  const toggleActionItem = (itemId: string) => {
    if (!sessionNotes || !onUpdateNotes) return
    const nextItems = (sessionNotes.actionItems || []).map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    onUpdateNotes(sessionNotes.id, { actionItems: nextItems })
  }

  const handleCancel = async () => {
    if (!onUpdateSession || !canCancel) return
    await onUpdateSession(session.id, { status: 'cancelled' })
    onClose()
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
              <p className="font-semibold text-gray-900">{dateLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-semibold text-gray-900">{timeLabel}</p>
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

        {/* Topic */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Topic</p>
          <p className="font-semibold text-gray-900">{session.topic}</p>
        </div>

        {/* Rejection Reason (if session was rejected) */}
        {session.rejectionReason && normalizedStatus === 'cancelled' && (
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-900 mb-2">Session Rejected</p>
              <p className="text-sm text-red-800">{session.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Mentor Notes & Action Items */}
        {sessionNotes && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Session Summary</p>
              <p className="text-gray-900">{sessionNotes.summary}</p>
            </div>
            {sessionNotes.followUps && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Follow-ups</p>
                <p className="text-gray-900">{sessionNotes.followUps}</p>
              </div>
            )}
            {sessionNotes.growthFocus && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Growth Focus</p>
                <p className="text-gray-900">{sessionNotes.growthFocus}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 mb-2">Action Items</p>
              {sessionNotes.actionItems && sessionNotes.actionItems.length > 0 ? (
                <div className="space-y-2">
                  {sessionNotes.actionItems.map(item => (
                    <label key={item.id} className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleActionItem(item.id)}
                        disabled={!onUpdateNotes}
                        className="h-4 w-4 text-primary-600"
                      />
                      <span className={item.completed ? 'line-through text-gray-400' : ''}>
                        {item.text || 'Action item'}
                      </span>
                      {item.dueDate && (
                        <span className="text-xs text-gray-500">Due {format(new Date(item.dueDate), 'MMM d, yyyy')}</span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No action items yet.</p>
              )}
            </div>
          </div>
        )}

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

        {isMentee && onUpdateSession && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!canCancel}
                className="px-4 py-2 border border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel session
              </button>
              {!canCancel && (
                <span className="text-sm text-gray-500">
                  Cancellations are allowed only more than 24 hours before the session.
                </span>
              )}
            </div>
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

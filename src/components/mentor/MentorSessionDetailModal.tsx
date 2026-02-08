import { useState, useEffect } from 'react'
import { X, Save, Calendar, User, Star, MessageSquare, FileText, AlertCircle } from 'lucide-react'
import { Session, SessionFeedback, MentorSessionNotes } from '../../types'
import { format } from 'date-fns'

interface MentorSessionDetailModalProps {
  session: Session
  feedback?: SessionFeedback
  existingNotes?: MentorSessionNotes | null
  onClose: () => void
  onSaveNotes: (notes: Omit<MentorSessionNotes, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateNotes: (noteId: string, updates: Partial<MentorSessionNotes>) => void
  onUpdateSession?: (sessionId: string, updates: Partial<Session>) => Promise<void>
  mentorId: string
}

export default function MentorSessionDetailModal({
  session,
  feedback,
  existingNotes,
  onClose,
  onSaveNotes,
  onUpdateNotes,
  onUpdateSession,
  mentorId
}: MentorSessionDetailModalProps) {
  const [summary, setSummary] = useState(existingNotes?.summary || '')
  const [followUps, setFollowUps] = useState(existingNotes?.followUps || '')
  const [growthFocus, setGrowthFocus] = useState(existingNotes?.growthFocus || '')
  const [privateNotes, setPrivateNotes] = useState(existingNotes?.privateNotes || '')
  const [isEditing, setIsEditing] = useState(!existingNotes)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (existingNotes) {
      setSummary(existingNotes.summary)
      setFollowUps(existingNotes.followUps)
      setGrowthFocus(existingNotes.growthFocus || '')
      setPrivateNotes(existingNotes.privateNotes || '')
    }
  }, [existingNotes])

  const handleSave = () => {
    if (existingNotes) {
      onUpdateNotes(existingNotes.id, {
        summary,
        followUps,
        growthFocus,
        privateNotes
      })
    } else {
      onSaveNotes({
        sessionId: session.id,
        mentorId,
        summary,
        followUps,
        growthFocus: growthFocus || undefined,
        privateNotes: privateNotes || undefined
      })
    }
    setIsEditing(false)
  }

  const sessionTime = session.time && session.time.length >= 5 ? session.time.slice(0, 5) : session.date.slice(11, 16)
  const sessionDate = new Date(`${session.date.slice(0, 10)}T${sessionTime || '00:00'}:00`)
  const isWithin24h = sessionDate.getTime() - Date.now() < 24 * 60 * 60 * 1000
  const canCancel = !session.cancelledAt && (session.status === 'pending' || session.status === 'PENDING' || session.status === 'confirmed' || session.status === 'CONFIRMED')

  const handleRequestCancel = async () => {
    if (!cancellationReason.trim() || !onUpdateSession) return
    setCancelling(true)
    try {
      if (isWithin24h) {
        await onUpdateSession(session.id, {
          cancellationRequestedAt: new Date().toISOString(),
          cancellationReason: cancellationReason.trim()
        })
        setShowCancelForm(false)
        setCancellationReason('')
        // Mentee must accept; they will see the request in their session detail
      } else {
        await onUpdateSession(session.id, {
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancelledBy: 'mentor',
          cancellationReason: cancellationReason.trim()
        })
        setShowCancelForm(false)
        setCancellationReason('')
        onClose()
        // In production: send email to mentee
      }
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            {format(sessionDate, 'MMM d, yyyy')} at {sessionTime} • {session.topic}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Session Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Mentee</p>
              <p className="font-semibold text-gray-900">{session.mentee?.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-semibold text-gray-900">
                {format(sessionDate, 'EEEE, MMMM d, yyyy')} at {sessionTime}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation request (within 24h) */}
        {session.cancellationRequestedAt && (
          <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <div>
              <p className="font-semibold text-amber-800">Cancellation requested</p>
              <p className="text-sm text-amber-700">Reason: {session.cancellationReason}. Waiting for mentee to accept or reject.</p>
            </div>
          </div>
        )}

        {/* Cancel session (mentor) */}
        {canCancel && onUpdateSession && !session.cancellationRequestedAt && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-primary-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Cancel session</h3>
            </div>
            {!showCancelForm ? (
              <button
                type="button"
                onClick={() => setShowCancelForm(true)}
                className="text-sm text-red-600 hover:underline"
              >
                I need to cancel this session
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {isWithin24h
                    ? 'Within 24 hours: the mentee must accept your reason. If they reject, you may be penalised.'
                    : 'More than 24 hours before: you may cancel. The mentee will be notified (e.g. by email).'}
                </p>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Reason for cancellation (required)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRequestCancel}
                    disabled={!cancellationReason.trim() || cancelling}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelling ? 'Processing…' : isWithin24h ? 'Request cancellation' : 'Cancel session'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCancelForm(false); setCancellationReason('') }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${session.status === 'completed' ? 'bg-green-100 text-green-700' :
              session.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
            }`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>

        {/* Mentee Feedback Section */}
        {session.status === 'completed' && feedback && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="text-primary-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Mentee Feedback</h3>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Rating</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={24}
                      className={star <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                  <span className="ml-2 text-gray-700">{feedback.rating} out of 5</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Growth Area</p>
                <p className="text-gray-700">{feedback.growthArea}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Growth Idea</p>
                <p className="text-gray-700">{feedback.growthIdea}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-900 mb-1">✅ What Went Well</p>
                  <p className="text-sm text-green-800">{feedback.whatWentWell}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-orange-900 mb-1">💡 What to Improve</p>
                  <p className="text-sm text-orange-800">{feedback.whatToImprove}</p>
                </div>
              </div>

              {feedback.additionalComments && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Additional Comments</p>
                  <p className="text-gray-700">{feedback.additionalComments}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {session.status === 'completed' && !feedback && (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⏳ Waiting for mentee feedback. Feedback will appear here once submitted.
              </p>
            </div>
          </div>
        )}

        {/* Mentor Reflection Notes */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="text-primary-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Session Reflection</h3>
            </div>
            {!isEditing && existingNotes && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Edit Notes
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={!isEditing}
                placeholder="What was discussed in this session?"
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Follow-up Action Items
              </label>
              <textarea
                value={followUps}
                onChange={(e) => setFollowUps(e.target.value)}
                disabled={!isEditing}
                placeholder="What are the next steps or action items?"
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Growth Focus for Mentee (Optional)
              </label>
              <textarea
                value={growthFocus}
                onChange={(e) => setGrowthFocus(e.target.value)}
                disabled={!isEditing}
                placeholder="What should the mentee focus on for growth?"
                rows={2}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Private Notes (Optional)
              </label>
              <textarea
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                disabled={!isEditing}
                placeholder="Your private reflection (not visible to mentee)"
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Close
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={!summary.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {existingNotes ? 'Update Notes' : 'Save Notes'}
          </button>
        )}
      </div>
    </div>
  )
}


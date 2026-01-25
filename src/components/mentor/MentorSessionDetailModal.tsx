import { useState, useEffect } from 'react'
import { X, Save, Calendar, User, Star, MessageSquare, FileText } from 'lucide-react'
import { Session, SessionFeedback, MentorSessionNotes, SessionActionItem } from '../../types'
import { format, isValid, parse } from 'date-fns'

interface MentorSessionDetailModalProps {
  session: Session
  feedback?: SessionFeedback
  existingNotes?: MentorSessionNotes | null
  onClose: () => void
  onSaveNotes: (notes: Omit<MentorSessionNotes, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateNotes: (noteId: string, updates: Partial<MentorSessionNotes>) => void
  onUpdateSession: (sessionId: string, updates: Partial<Session>) => void
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
  const [actionItems, setActionItems] = useState<SessionActionItem[]>(existingNotes?.actionItems || [])
  const [isEditing, setIsEditing] = useState(!existingNotes)
  const [decisionReason, setDecisionReason] = useState('')
  const [decisionError, setDecisionError] = useState<string | null>(null)

  useEffect(() => {
    if (existingNotes) {
      setSummary(existingNotes.summary)
      setFollowUps(existingNotes.followUps)
      setGrowthFocus(existingNotes.growthFocus || '')
      setPrivateNotes(existingNotes.privateNotes || '')
      setActionItems(existingNotes.actionItems || [])
    }
  }, [existingNotes])

  const handleSave = () => {
    if (existingNotes) {
      onUpdateNotes(existingNotes.id, {
        summary,
        followUps,
        actionItems,
        growthFocus,
        privateNotes
      })
    } else {
      onSaveNotes({
        sessionId: session.id,
        mentorId,
        summary,
        followUps,
        actionItems,
        growthFocus: growthFocus || undefined,
        privateNotes: privateNotes || undefined
      })
    }
    setIsEditing(false)
  }

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
  const timeLabel = session.time || 'Time TBD'
  const dateLabel = sessionDate ? format(sessionDate, 'MMM d, yyyy') : 'Date TBD'
  const fullDateLabel = sessionDate ? format(sessionDate, 'EEEE, MMMM d, yyyy') : 'Date TBD'
  const normalizedStatus = session.status.toLowerCase()
  const now = new Date()
  const sessionDateTime = sessionDate
  const hoursUntil = sessionDateTime ? (sessionDateTime.getTime() - now.getTime()) / 36e5 : null
  const canAccept = normalizedStatus === 'pending' && !!sessionDateTime && hoursUntil !== null && hoursUntil > 0
  const canReject = normalizedStatus === 'pending' && !!sessionDateTime && hoursUntil !== null && hoursUntil >= 24

  const handleAccept = async () => {
    setDecisionError(null)
    if (!canAccept) {
      setDecisionError('This session can no longer be accepted.')
      return
    }
    await onUpdateSession(session.id, { status: 'confirmed' })
    onClose()
  }

  const handleReject = async () => {
    setDecisionError(null)
    if (!canReject) {
      setDecisionError('Rejections are only allowed more than 24 hours before the session.')
      return
    }
    if (decisionReason.trim().length < 5) {
      setDecisionError('Please provide a brief reason (at least 5 characters).')
      return
    }
    await onUpdateSession(session.id, { 
      status: 'cancelled',
      rejectionReason: decisionReason.trim()
    })
    onClose()
  }

  const addActionItem = () => {
    setActionItems(prev => [
      ...prev,
      { id: `action-${Date.now()}`, text: '', dueDate: undefined, completed: false }
    ])
  }

  const updateActionItem = (itemId: string, updates: Partial<SessionActionItem>) => {
    setActionItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item))
  }

  const removeActionItem = (itemId: string) => {
    setActionItems(prev => prev.filter(item => item.id !== itemId))
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            {dateLabel} at {timeLabel} • {session.topic}
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
                {fullDateLabel} at {timeLabel}
              </p>
            </div>
          </div>
        </div>

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

        {normalizedStatus === 'pending' && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Pending request actions</p>
              <p className="text-sm text-gray-500">
                Accept any time before the session starts. Rejections require a reason and must be more than 24 hours before the session.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection reason</label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Explain why you are rejecting this request."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none border-gray-300"
              />
            </div>
            {decisionError && <p className="text-sm text-red-600">{decisionError}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAccept}
                disabled={!canAccept}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Accept session
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!canReject}
                className="px-4 py-2 border border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Reject session
              </button>
            </div>
          </div>
        )}

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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Action Items for Mentee
                </label>
                {isEditing && (
                  <button
                    type="button"
                    onClick={addActionItem}
                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    + Add item
                  </button>
                )}
              </div>
              {actionItems.length === 0 ? (
                <p className="text-sm text-gray-500">No action items yet.</p>
              ) : (
                <div className="space-y-3">
                  {actionItems.map(item => (
                    <div key={item.id} className="flex flex-col md:flex-row gap-3 md:items-center">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateActionItem(item.id, { text: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Action item description"
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
                      />
                      <input
                        type="date"
                        value={item.dueDate || ''}
                        onChange={(e) => updateActionItem(item.id, { dueDate: e.target.value || undefined })}
                        disabled={!isEditing}
                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => updateActionItem(item.id, { completed: e.target.checked })}
                          disabled={!isEditing}
                          className="h-4 w-4 text-primary-600"
                        />
                        Done
                      </label>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeActionItem(item.id)}
                          className="text-sm text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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


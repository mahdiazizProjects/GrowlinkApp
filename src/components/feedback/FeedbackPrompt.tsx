import { MessageSquare, Clock, CheckCircle } from 'lucide-react'
import { Session } from '../../types'
import { format, differenceInHours } from 'date-fns'

interface FeedbackPromptProps {
  session: Session
  onLeaveFeedback: () => void
}

export default function FeedbackPrompt({ session, onLeaveFeedback }: FeedbackPromptProps) {
  const sessionDate = new Date(`${session.date}T${session.time}`)
  const hoursSinceSession = differenceInHours(new Date(), sessionDate)
  const daysSinceSession = Math.floor(hoursSinceSession / 24)
  const isExpired = daysSinceSession > 7

  if (session.feedbackSubmitted) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <div className="flex-1">
            <p className="font-semibold text-green-900">Feedback Submitted</p>
            <p className="text-sm text-green-700">
              Thank you for your feedback! {session.feedbackSubmittedAt &&
                `Submitted on ${format(new Date(session.feedbackSubmittedAt), 'MMM d, yyyy')}`
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Clock className="text-gray-500" size={24} />
          <div className="flex-1">
            <p className="font-semibold text-gray-700">Feedback Window Expired</p>
            <p className="text-sm text-gray-600">
              The feedback window for this session has closed (7 days after session).
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <MessageSquare className="text-primary-600" size={24} />
          <div>
            <p className="font-semibold text-primary-900">Leave Session Feedback</p>
            <p className="text-sm text-primary-700">
              Help {session.mentor?.name} improve by sharing your experience
              {daysSinceSession > 0 && ` (${7 - daysSinceSession} days remaining)`}
            </p>
          </div>
        </div>
        <button
          onClick={onLeaveFeedback}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors whitespace-nowrap"
        >
          Leave Feedback
        </button>
      </div>
    </div>
  )
}


import { useMemo } from 'react'
import { Users, Calendar, Star, MessageSquare, Clock } from 'lucide-react'
import { Session, SessionFeedback, User } from '../../types'
import { format, parseISO } from 'date-fns'

interface EnhancedMentorDashboardProps {
  mentorId: string
  sessions: Session[]
  sessionFeedbacks: SessionFeedback[]
  menteeSummaries: Array<{
    menteeId: string
    mentee: User
    totalSessions: number
    completedSessions: number
    averageRating: number
    lastSessionDate?: string
  }>
  onSessionClick: (session: Session) => void
  onViewMentees?: () => void
}

export default function EnhancedMentorDashboard({
  mentorId,
  sessions,
  sessionFeedbacks,
  menteeSummaries,
  onSessionClick,
  onViewMentees
}: EnhancedMentorDashboardProps) {
  const mentorSessions = useMemo(() =>
    sessions.filter(s => s.mentorId === mentorId),
    [sessions, mentorId]
  )

  const stats = useMemo(() => {
    const upcomingSessions = mentorSessions.filter(s =>
      s.status === 'confirmed' || s.status === 'pending'
    )

    // Today's sessions should be upcoming sessions (pending/confirmed) that are scheduled for today
    const today = new Date()
    const todayDateString = today.toISOString().split('T')[0] // YYYY-MM-DD format
    const todaysSessions = upcomingSessions.filter(s => {
      // Compare date strings to avoid timezone issues
      const sessionDateString = s.date.split('T')[0] // Extract just the date part
      return sessionDateString === todayDateString
    })

    const averageRating = sessionFeedbacks.length > 0
      ? sessionFeedbacks.reduce((sum, f) => sum + f.rating, 0) / sessionFeedbacks.length
      : 0

    const unreadFeedbacks = sessionFeedbacks
      .filter(f => f.mentorId === mentorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    return {
      totalMentees: menteeSummaries.length,
      upcomingSessions: upcomingSessions.length,
      averageRating: Math.round(averageRating * 10) / 10,
      newFeedbackCount: unreadFeedbacks.length,
      todaysSessions,
      upcomingSessionsList: upcomingSessions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
      recentFeedbacks: unreadFeedbacks
    }
  }, [mentorSessions, sessionFeedbacks, mentorId, menteeSummaries])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <SummaryCard
          icon={<Users className="text-primary-600" size={24} />}
          label="Total Mentees"
          value={stats.totalMentees.toString()}
          color="primary"
          onClick={onViewMentees}
          clickable={!!onViewMentees && stats.totalMentees > 0}
        />
        <SummaryCard
          icon={<Calendar className="text-blue-600" size={24} />}
          label="Upcoming Sessions"
          value={stats.upcomingSessions.toString()}
          color="blue"
        />
        <SummaryCard
          icon={<Star className="text-yellow-600" size={24} />}
          label="Average Rating"
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
          color="yellow"
        />
        <SummaryCard
          icon={<MessageSquare className="text-green-600" size={24} />}
          label="Recent Feedback"
          value={stats.newFeedbackCount.toString()}
          color="green"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-primary-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Today's Sessions</h2>
          </div>
          {stats.todaysSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sessions scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {stats.todaysSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => onSessionClick(session)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-primary-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
          </div>
          {stats.upcomingSessionsList.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingSessionsList.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => onSessionClick(session)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="text-primary-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
        </div>
        {stats.recentFeedbacks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No feedback received yet</p>
        ) : (
          <div className="space-y-4">
            {stats.recentFeedbacks.map(feedback => {
              const session = mentorSessions.find(s => s.id === feedback.sessionId)
              return (
                <div key={feedback.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {feedback.isAnonymous ? 'Anonymous' : session?.mentee?.name || 'Mentee'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                        {session && ` • ${session.topic}`}
                      </p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`text-lg ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    <span className="font-semibold">What went well:</span> {feedback.whatWentWell}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value, color, onClick, clickable }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  onClick?: () => void
  clickable?: boolean
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600'
  }

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`bg-white rounded-xl shadow-lg p-6 ${clickable ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all' : ''}`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 flex items-center gap-1">
        {label}
        {clickable && <span className="text-primary-600 text-xs">(click to view)</span>}
      </div>
    </div>
  )
}

function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
  // Handle date parsing more safely
  let formattedDate = session.date
  try {
    // Try to parse the date - handle both ISO format and YYYY-MM-DD format
    if (session.date.includes('T')) {
      formattedDate = format(parseISO(session.date), 'MMM d')
    } else {
      // If it's just YYYY-MM-DD, parse it directly
      const dateObj = new Date(session.date + 'T00:00:00')
      formattedDate = format(dateObj, 'MMM d')
    }
  } catch (e) {
    // Fallback to original date if parsing fails
    formattedDate = session.date
  }

  return (
    <div
      onClick={onClick}
      className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all active:scale-95"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-900">{session.mentee?.name}</span>
        <span className="text-sm text-gray-600">
          {formattedDate} at {session.time}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-2">{session.topic}</p>
      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${session.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
        session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
        {session.status}
      </span>
    </div>
  )
}


import { User, Calendar, Star, TrendingUp, Eye } from 'lucide-react'
import { MenteeSummary, Session } from '../../types'
import { format } from 'date-fns'

interface MenteeManagementProps {
  menteeSummaries: MenteeSummary[]
  sessions: Session[]
  onViewMentee: (menteeId: string) => void
}

export default function MenteeManagement({ menteeSummaries, sessions, onViewMentee }: MenteeManagementProps) {
  if (menteeSummaries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="text-primary-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">My Mentees</h2>
        </div>
        <div className="text-center py-12 text-gray-500">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <p>No mentees yet</p>
          <p className="text-sm mt-2">Mentees will appear here once they book sessions with you</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="text-primary-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">My Mentees</h2>
        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
          {menteeSummaries.length}
        </span>
      </div>

      <div className="space-y-4">
        {menteeSummaries.map((summary) => {
          const menteeSessions = sessions.filter(s => s.menteeId === summary.menteeId)
          const upcomingSessions = menteeSessions.filter(s => 
            s.status === 'confirmed' || s.status === 'pending'
          ).length

          return (
            <div
              key={summary.menteeId}
              className="border-2 border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {summary.mentee.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{summary.mentee.name}</h3>
                    <p className="text-sm text-gray-600">{summary.mentee.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => onViewMentee(summary.menteeId)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                  <Eye size={16} />
                  View Profile
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Total Sessions</p>
                    <p className="font-semibold text-gray-900">{summary.totalSessions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Completed</p>
                    <p className="font-semibold text-gray-900">{summary.completedSessions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Avg Rating</p>
                    <p className="font-semibold text-gray-900">
                      {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-purple-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Upcoming</p>
                    <p className="font-semibold text-gray-900">{upcomingSessions}</p>
                  </div>
                </div>
              </div>

              {summary.lastSessionDate && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Last session: {format(new Date(summary.lastSessionDate), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


import { X, Mail, MapPin, Calendar, Star, CheckCircle } from 'lucide-react'
import { MenteeSummary, Session, SessionFeedback } from '../../types'
import { format } from 'date-fns'

interface MenteeProfileModalProps {
  menteeSummary: MenteeSummary
  sessions: Session[]
  feedbacks: SessionFeedback[]
  onClose: () => void
}

export default function MenteeProfileModal({
  menteeSummary,
  sessions,
  feedbacks,
  onClose
}: MenteeProfileModalProps) {
  const menteeSessions = sessions.filter(s => s.menteeId === menteeSummary.menteeId)
  const upcomingSessions = menteeSessions.filter(s => 
    s.status === 'confirmed' || s.status === 'pending'
  )
  const menteeFeedbacks = feedbacks.filter(f => f.menteeId === menteeSummary.menteeId)

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mentee Profile</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
            {menteeSummary.mentee.avatar ? (
              <img 
                src={menteeSummary.mentee.avatar} 
                alt={menteeSummary.mentee.name} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              menteeSummary.mentee.name.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{menteeSummary.mentee.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                👤 Mentee
              </span>
              {menteeSummary.mentee.membershipTier === 'exclusive' && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gold-400 to-gold-600 text-white">
                  ✨ Exclusive Member
                </span>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="text-primary-600 mt-1" size={16} />
                <span className="text-gray-600">{menteeSummary.mentee.email}</span>
              </div>
              {menteeSummary.mentee.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="text-primary-600 mt-1" size={16} />
                  <span className="text-gray-600">{menteeSummary.mentee.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {menteeSummary.mentee.bio && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">About</h4>
            <p className="text-gray-700 leading-relaxed">{menteeSummary.mentee.bio}</p>
          </div>
        )}

        {/* Skills */}
        {menteeSummary.mentee.skills && menteeSummary.mentee.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Skills & Interests</h4>
            <div className="flex flex-wrap gap-2">
              {menteeSummary.mentee.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-blue-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">Total Sessions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{menteeSummary.totalSessions}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{menteeSummary.completedSessions}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-yellow-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {menteeSummary.averageRating > 0 ? menteeSummary.averageRating.toFixed(1) : 'N/A'}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-purple-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">Upcoming</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
          </div>
        </div>

        {/* Session History */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" size={20} />
            Session History
          </h4>
          {menteeSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sessions yet</p>
          ) : (
            <div className="space-y-3">
              {menteeSessions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map(session => {
                  const feedback = menteeFeedbacks.find(f => f.sessionId === session.id)
                  return (
                    <div
                      key={session.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{session.topic}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(session.date), 'MMM d, yyyy')} at {session.time}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          session.status === 'completed' ? 'bg-green-100 text-green-700' :
                          session.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      {feedback && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="text-yellow-500" size={14} />
                            <span className="text-sm font-semibold text-gray-700">
                              Rating: {feedback.rating}/5
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {feedback.whatWentWell}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Last Session */}
        {menteeSummary.lastSessionDate && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Last session:</span>{' '}
              {format(new Date(menteeSummary.lastSessionDate), 'MMMM d, yyyy')}
            </p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}


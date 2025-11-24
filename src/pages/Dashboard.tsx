import { useState, useMemo } from 'react'
import { Calendar, Video, MapPin, TrendingUp, Target, CheckCircle, BookOpen, ArrowRight, MessageSquare, User, Award } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import ProgressRingChart from '../components/habits/ProgressRingChart'
import FeedbackPrompt from '../components/feedback/FeedbackPrompt'
import SessionFeedbackForm from '../components/feedback/SessionFeedbackForm'
import MentorFeedbackView from '../components/feedback/MentorFeedbackView'
import SessionDetailModal from '../components/sessions/SessionDetailModal'
import EnhancedMentorDashboard from '../components/mentor/EnhancedMentorDashboard'
import MentorSessionDetailModal from '../components/mentor/MentorSessionDetailModal'
import MenteeManagement from '../components/mentor/MenteeManagement'
import MentorAnalytics from '../components/mentor/MentorAnalytics'
import NotificationSystem from '../components/notifications/NotificationSystem'
import MenteeProfileModal from '../components/mentor/MenteeProfileModal'
import { mockMentors } from '../data/mockData'
import { startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns'
import { Session, SessionFeedback, MentorSessionNotes, MenteeSummary } from '../types'

export default function Dashboard() {
  const { 
    currentUser, 
    setCurrentUser, 
    sessions, 
    goals, 
    habits, 
    habitCompletions, 
    sessionFeedbacks, 
    notifications,
    addSessionFeedback, 
    getMentorFeedbackStats,
    addMentorSessionNotes,
    updateMentorSessionNotes,
    getMentorSessionNotes,
    markNotificationAsRead,
    getUnreadNotificationCount,
    getMentorStats,
    getMenteeSummaries
  } = useApp()
  const [selectedSessionForFeedback, setSelectedSessionForFeedback] = useState<Session | null>(null)
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<Session | null>(null)
  const [selectedMentorSession, setSelectedMentorSession] = useState<Session | null>(null)
  const [selectedMentee, setSelectedMentee] = useState<MenteeSummary | null>(null)
  const [activeMentorTab, setActiveMentorTab] = useState<'dashboard' | 'mentees' | 'analytics'>('dashboard')

  // Mock login for demo
  const handleLogin = (role: 'mentee' | 'mentor' = 'mentee') => {
    if (role === 'mentor') {
      // Use the actual mentor from mockMentors (Sarah Chen with id '1')
      // This ensures sessions booked with this mentor will show up in the dashboard
      const mentor = mockMentors[0] // Sarah Chen
      setCurrentUser(mentor)
    } else {
      setCurrentUser({
        id: 'user-1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        role: 'mentee',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        bio: 'Aspiring designer looking to grow in product design.',
        location: 'New York, NY',
        skills: ['Design', 'Learning'],
        membershipTier: 'premium',
        verified: true,
        createdAt: '2024-01-01'
      })
    }
  }

  // Calculate habit stats - must be called before any conditional returns (Rules of Hooks)
  const habitStats = useMemo(() => {
    if (!currentUser) return { completionRate: 0, todayCompletions: 0, totalCompletions: 0 }
    
    const activeGoals = goals.filter(g => g.userId === currentUser.id && g.status === 'active')
    const activeHabits = habits.filter(h => h.status === 'active' && activeGoals.some(g => g.id === h.goalId))
    
    if (activeHabits.length === 0) return { completionRate: 0, todayCompletions: 0, totalCompletions: 0 }
    
    const today = new Date().toISOString().split('T')[0]
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    const todayCompletions = habitCompletions.filter(
      c => c.userId === currentUser.id && c.date === today && c.completed
    ).length
    
    const weekCompletions = habitCompletions.filter(c => {
      if (c.userId !== currentUser.id || !c.completed) return false
      const completionDate = parseISO(c.date)
      return completionDate >= weekStart && completionDate <= weekEnd
    }).length
    
    const totalDays = activeHabits.length * (weekDays.length)
    const completionRate = totalDays > 0 ? (weekCompletions / totalDays) * 100 : 0
    
    return {
      completionRate,
      todayCompletions,
      totalCompletions: habitCompletions.filter(c => c.userId === currentUser.id && c.completed).length
    }
  }, [currentUser, goals, habits, habitCompletions])

  // Show login screen if not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to GrowLink</h1>
            <p className="text-gray-600">
              Sign in to access your dashboard, manage sessions, and connect with the community.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => handleLogin('mentee')}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <User size={20} />
              Sign In as Mentee (Demo)
            </button>
            <button
              onClick={() => handleLogin('mentor')}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-900 transition-colors flex items-center justify-center gap-2 border-2 border-primary-500"
            >
              <Award size={20} />
              Sign In as Mentor (Demo)
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 <strong>Tip:</strong> Sign in as Mentor to see the enhanced mentor dashboard with analytics, mentee management, and session notes.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const user = currentUser

  // Handle feedback submission
  const handleFeedbackSubmit = (feedbackData: Omit<SessionFeedback, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFeedback: SessionFeedback = {
      ...feedbackData,
      id: `feedback-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addSessionFeedback(newFeedback)
    setSelectedSessionForFeedback(null)
  }

  // Handle mentor session notes
  const handleSaveMentorNotes = (notesData: Omit<MentorSessionNotes, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNotes: MentorSessionNotes = {
      ...notesData,
      id: `notes-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addMentorSessionNotes(newNotes)
  }

  const handleUpdateMentorNotes = (noteId: string, updates: Partial<MentorSessionNotes>) => {
    updateMentorSessionNotes(noteId, updates)
  }

  // If user is a mentor, show enhanced mentor dashboard
  if (user.role === 'mentor') {
    const feedbackStats = getMentorFeedbackStats(user.id)
    const mentorFeedbacks = sessionFeedbacks.filter(f => f.mentorId === user.id)
    const mentorStats = getMentorStats(user.id)
    const menteeSummaries = getMenteeSummaries(user.id)
    const unreadCount = getUnreadNotificationCount(user.id)
    const mentorNotifications = notifications.filter(n => n.userId === user.id)

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mentor Dashboard</h1>
              <p className="text-gray-600">Your mentoring control center</p>
            </div>
            <NotificationSystem
              notifications={mentorNotifications}
              unreadCount={unreadCount}
              onMarkAsRead={markNotificationAsRead}
              onNotificationClick={(notification) => {
                if (notification.relatedId) {
                  const session = sessions.find(s => s.id === notification.relatedId)
                  if (session) setSelectedMentorSession(session)
                }
              }}
            />
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveMentorTab('dashboard')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeMentorTab === 'dashboard'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveMentorTab('mentees')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeMentorTab === 'mentees'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Mentees
            </button>
            <button
              onClick={() => setActiveMentorTab('analytics')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeMentorTab === 'analytics'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          {activeMentorTab === 'dashboard' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EnhancedMentorDashboard
                  mentorId={user.id}
                  sessions={sessions}
                  sessionFeedbacks={sessionFeedbacks}
                  menteeSummaries={menteeSummaries}
                  onSessionClick={setSelectedMentorSession}
                  onViewMentees={() => setActiveMentorTab('mentees')}
                />
              </div>
              <div>
                <MentorFeedbackView
                  feedbackStats={feedbackStats}
                  allFeedbacks={mentorFeedbacks}
                />
              </div>
            </div>
          )}

          {activeMentorTab === 'mentees' && (
            <MenteeManagement
              menteeSummaries={menteeSummaries}
              sessions={sessions}
              onViewMentee={(menteeId) => {
                const mentee = menteeSummaries.find(m => m.menteeId === menteeId)
                if (mentee) {
                  setSelectedMentee(mentee)
                }
              }}
            />
          )}

          {activeMentorTab === 'analytics' && (
            <MentorAnalytics
              stats={mentorStats}
              feedbacks={mentorFeedbacks}
            />
          )}

          {/* Mentor Session Detail Modal */}
          {selectedMentorSession && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <MentorSessionDetailModal
                session={selectedMentorSession}
                feedback={sessionFeedbacks.find(f => f.sessionId === selectedMentorSession.id)}
                existingNotes={getMentorSessionNotes(selectedMentorSession.id)}
                onClose={() => setSelectedMentorSession(null)}
                onSaveNotes={handleSaveMentorNotes}
                onUpdateNotes={handleUpdateMentorNotes}
                mentorId={user.id}
              />
            </div>
          )}

          {/* Mentee Profile Modal */}
          {selectedMentee && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <MenteeProfileModal
                menteeSummary={selectedMentee}
                sessions={sessions}
                feedbacks={sessionFeedbacks}
                onClose={() => setSelectedMentee(null)}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Calculate habit stats for mentees (already calculated in useMemo above)
  const activeGoals = goals.filter(g => g.userId === user.id && g.status === 'active')
  const activeHabits = habits.filter(h => h.status === 'active' && activeGoals.some(g => g.id === h.goalId))

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Calendar />}
            label="Upcoming Sessions"
            value={sessions.filter(s => s.status === 'confirmed' || s.status === 'pending').length.toString()}
            color="primary"
          />
          <StatCard
            icon={<Target />}
            label="Active Goals"
            value={activeGoals.length.toString()}
            color="primary"
          />
          <StatCard
            icon={<CheckCircle />}
            label="Habits This Week"
            value={`${Math.round(habitStats.completionRate)}%`}
            color="green"
          />
          <StatCard
            icon={<TrendingUp />}
            label="Today's Habits"
            value={`${habitStats.todayCompletions}/${activeHabits.length}`}
            color="gold"
          />
        </div>

        {/* Habit Progress Overview */}
        {activeHabits.length > 0 && (
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-lg p-6 mb-8 border-2 border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">1% Growth Progress</h2>
                <p className="text-gray-600">Your weekly habit completion</p>
              </div>
              <Link
                to="/habits"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                View All Habits
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <ProgressRingChart progress={habitStats.completionRate} size={100} />
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(habitStats.completionRate)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {habitStats.todayCompletions}/{activeHabits.length}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-4">
                  💡 {activeHabits.length} active habit{activeHabits.length !== 1 ? 's' : ''} across {activeGoals.length} goal{activeGoals.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Sessions with Feedback Prompts */}
        {(() => {
          const completedSessions = sessions.filter(s => 
            s.status === 'completed' && 
            s.menteeId === user.id &&
            (!s.feedbackEligible || s.feedbackEligible === true)
          )
          
          if (completedSessions.length > 0) {
            return (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="text-primary-600" size={24} />
                  Completed Sessions - Leave Feedback
                </h2>
                <div className="space-y-4">
                  {completedSessions.map((session) => (
                    <div key={session.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer"
                            onClick={() => setSelectedSessionForDetail(session)}
                          >
                            {session.mentor.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(session.date).toLocaleDateString()} at {session.time} • {session.topic}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Completed
                        </span>
                      </div>
                      <FeedbackPrompt
                        session={session}
                        onLeaveFeedback={() => setSelectedSessionForFeedback(session)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          }
          return null
        })()}

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
            <div className="space-y-4">
              {sessions.filter(s => s.status === 'confirmed' || s.status === 'pending').length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
              ) : (
                sessions
                  .filter(s => s.status === 'confirmed' || s.status === 'pending')
                  .map((session) => (
                    <div 
                      key={session.id} 
                      onClick={() => setSelectedSessionForDetail(session)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {session.type === 'in-person' ? (
                            <MapPin className="inline mr-2 text-primary-600" size={18} />
                          ) : (
                            <Video className="inline mr-2 text-primary-600" size={18} />
                          )}
                          {session.type === 'in-person' ? 'In-Person' : 'Virtual'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{session.topic}</p>
                      <p className="text-xs text-gray-500 mt-2">Click to view details</p>
                    </div>
                  ))
              )}
              <Link
                to="/mentors"
                className="block w-full mt-4 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
              >
                Browse Mentors
              </Link>
            </div>
          </div>

          {/* Membership Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Membership</h2>
            <div className={`p-6 rounded-lg mb-4 ${
              user.membershipTier === 'exclusive'
                ? 'bg-gradient-to-br from-gold-50 to-gold-100 border-2 border-gold-300'
                : user.membershipTier === 'premium'
                ? 'bg-primary-50 border-2 border-primary-300'
                : 'bg-gray-50 border-2 border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900 capitalize">
                  {user.membershipTier} Member
                </span>
                {user.membershipTier === 'exclusive' && (
                  <span className="text-gold-600 text-xl">✨</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {user.membershipTier === 'exclusive'
                  ? 'You have access to all exclusive features and priority booking.'
                  : user.membershipTier === 'premium'
                  ? 'You have access to premium features and early event registration.'
                  : 'Upgrade to unlock more features and exclusive access.'}
              </p>
              {user.membershipTier !== 'exclusive' && (
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
                  Upgrade Membership
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <Link
                to="/goals"
                className="flex items-center justify-between w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-primary-600" />
                  <span>My Goals</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
              <Link
                to="/habits"
                className="flex items-center justify-between w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span>Habit Tracker</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
              <Link
                to="/reflections"
                className="flex items-center justify-between w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-600" />
                  <span>Reflections</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
              <Link
                to="/events"
                className="flex items-center justify-between w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary-600" />
                  <span>Browse Events</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSessionForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <SessionDetailModal
            session={selectedSessionForDetail}
            onClose={() => setSelectedSessionForDetail(null)}
            onLeaveFeedback={() => {
              setSelectedSessionForDetail(null)
              setSelectedSessionForFeedback(selectedSessionForDetail)
            }}
            currentUserId={user.id}
          />
        </div>
      )}

      {/* Feedback Modal */}
      {selectedSessionForFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <SessionFeedbackForm
            session={selectedSessionForFeedback}
            onSubmit={handleFeedbackSubmit}
            onClose={() => setSelectedSessionForFeedback(null)}
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    gold: 'bg-gold-50 text-gold-600',
    green: 'bg-green-50 text-green-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}


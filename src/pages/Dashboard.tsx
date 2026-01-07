import { useState } from 'react'
import { MessageSquare, User, Award } from 'lucide-react'
import { useApp } from '../context/AppContext'
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
import MenteeDashboard from '../components/mentee/MenteeDashboard'
import * as api from '../services/api'
import { Session, SessionFeedback, MentorSessionNotes, MenteeSummary } from '../types'
import { seedMentors } from '../utils/seedData'
import { mockMentees } from '../data/mockData'

export default function Dashboard() {
  const {
    currentUser,
    setCurrentUser,
    loading,
    sessions,
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

  // Mock login for demo - will be replaced with actual auth
  const handleLogin = async (role: 'mentee' | 'mentor' = 'mentee') => {
    if (role === 'mentor') {
      // Fetch first available mentor from API
      let mentors = await api.listMentors()
      
      // If no mentors exist, seed the database with mock mentors
      if (mentors.length === 0) {
        console.log('No mentors found. Seeding database...')
        await seedMentors()
        // Fetch mentors again after seeding
        mentors = await api.listMentors()
      }
      
      if (mentors.length > 0) {
        setCurrentUser(mentors[0])
      } else {
        console.error('Failed to seed mentors or no mentors available')
        alert('Unable to sign in as mentor. Please check the console for errors.')
      }
    } else {
      // For demo, get or create a test mentee user in the database
      try {
        // Try to find existing mentee users
        const allUsers = await api.listUsers()
        let mentee = allUsers.find(u => 
          (u.role === 'MENTEE' || u.role === 'mentee') && 
          u.email === 'alex@example.com'
        )
        
        // If no mentee exists, create one from mock data
        if (!mentee) {
          const mockMentee = mockMentees[0] // Use first mock mentee
          const createdMentee = await api.createUser({
            username: mockMentee.username,
            email: mockMentee.email,
            name: mockMentee.name,
            role: 'MENTEE',
            bio: mockMentee.bio,
            avatar: mockMentee.avatar,
            location: mockMentee.location,
            skills: mockMentee.skills || [],
            interests: [],
          })
          
          if (createdMentee) {
            mentee = createdMentee
            console.log('✓ Created demo mentee user:', createdMentee.name)
          } else {
            console.error('Failed to create mentee user')
            alert('Unable to sign in as mentee. Please check the console for errors.')
            return
          }
        }
        
        if (mentee) {
          setCurrentUser(mentee)
        }
      } catch (error) {
        console.error('Error signing in as mentee:', error)
        alert('Unable to sign in as mentee. Please check the console for errors.')
      }
    }
  }


  // Show loading state while checking for user
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

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
  if (user.role === 'MENTOR' || user.role === 'mentor') {
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
              className={`px-4 py-2 font-semibold transition-colors ${activeMentorTab === 'dashboard'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveMentorTab('mentees')}
              className={`px-4 py-2 font-semibold transition-colors ${activeMentorTab === 'mentees'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              My Mentees
            </button>
            <button
              onClick={() => setActiveMentorTab('analytics')}
              className={`px-4 py-2 font-semibold transition-colors ${activeMentorTab === 'analytics'
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

  return (
    <>
      <MenteeDashboard />

      {/* Completed Sessions with Feedback Prompts - Show below dashboard */}
      {(() => {
        const completedSessions = sessions.filter(s =>
          s.status === 'completed' &&
          s.menteeId === user.id &&
          (!s.feedbackEligible || s.feedbackEligible === true)
        )

        if (completedSessions.length > 0) {
          return (
            <div className="max-w-7xl mx-auto px-4 pb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="text-primary-600" size={24} />
                  Completed Sessions - Leave Feedback
                </h2>
                <div className="space-y-4">
                  {completedSessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer"
                            onClick={() => setSelectedSessionForDetail(session)}
                          >
                            {session.mentor?.name}
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
            </div>
          )
        }
        return null
      })()}

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
    </>
  )
}

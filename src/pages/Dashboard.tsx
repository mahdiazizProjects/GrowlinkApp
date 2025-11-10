import { useState, useMemo } from 'react'
import { Calendar, Video, MapPin, Star, TrendingUp, Target, CheckCircle, BookOpen, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import ProgressRingChart from '../components/habits/ProgressRingChart'
import MentorDashboard from '../components/habits/MentorDashboard'
import { startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns'

export default function Dashboard() {
  const { currentUser, setCurrentUser, sessions, goals, habits, habitCompletions, reflections } = useApp()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Mock login for demo
  const handleLogin = () => {
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
    setIsLoggedIn(true)
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
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to GrowLink</h1>
          <p className="text-gray-600 mb-6">
            Sign in to access your dashboard, manage sessions, and connect with the community.
          </p>
          <button
            onClick={handleLogin}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Sign In (Demo)
          </button>
        </div>
      </div>
    )
  }

  const user = currentUser

  // If user is a mentor, show mentor dashboard
  if (user.role === 'mentor') {
    // Get mentees (users with goals where this mentor is assigned)
    const menteeIds = [...new Set(goals.filter(g => g.mentorId === user.id).map(g => g.userId))]
    // In a real app, you'd fetch these users from the API
    // For now, we'll show a simplified mentor view
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mentor Dashboard</h1>
            <p className="text-gray-600">Overview of your mentees' progress</p>
          </div>
          <MentorDashboard
            mentees={[]} // Would be populated from API
            goals={goals.filter(g => g.mentorId === user.id)}
            habits={habits}
            habitCompletions={habitCompletions}
            reflections={reflections}
          />
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

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
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


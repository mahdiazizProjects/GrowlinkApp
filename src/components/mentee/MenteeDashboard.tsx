import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Star, Clock, Target, Calendar, CheckCircle, Users, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { parseISO, format, differenceInDays, subDays } from 'date-fns'

export default function MenteeDashboard() {
  const {
    currentUser,
    sessions,
    goals,
    habits,
    habitCompletions
  } = useApp()

  if (!currentUser) {
    return null
  }

  // Calculate streak (consecutive days with at least one habit completion)
  const streak = useMemo(() => {
    const userCompletions = habitCompletions.filter(
      c => c.userId === currentUser.id && c.completed
    )
    
    if (userCompletions.length === 0) return 0

    // Get unique dates with completions, sorted descending
    const completionDates = [...new Set(userCompletions.map(c => c.date))]
      .map(d => parseISO(d))
      .sort((a, b) => b.getTime() - a.getTime())
    
    if (completionDates.length === 0) return 0

    let currentStreak = 0
    let checkDate = new Date()
    const todayStr = format(checkDate, 'yyyy-MM-dd')
    
    // Check if today has completions
    const todayHasCompletions = completionDates.some(d => format(d, 'yyyy-MM-dd') === todayStr)
    
    // If today doesn't have completions, start from yesterday
    if (!todayHasCompletions) {
      checkDate = subDays(checkDate, 1)
    }
    
    // Count consecutive days backwards
    for (let i = 0; i < completionDates.length; i++) {
      const expectedDateStr = format(checkDate, 'yyyy-MM-dd')
      const completionDateStr = format(completionDates[i], 'yyyy-MM-dd')
      
      if (completionDateStr === expectedDateStr) {
        currentStreak++
        checkDate = subDays(checkDate, 1)
      } else if (completionDateStr < expectedDateStr) {
        // We've passed the expected date, streak is broken
        break
      }
      // If completionDateStr > expectedDateStr, continue to next completion date
    }
    
    return currentStreak
  }, [currentUser, habitCompletions])

  // Calculate total points (1 point per habit completion)
  const totalPoints = useMemo(() => {
    return habitCompletions.filter(
      c => c.userId === currentUser.id && c.completed
    ).length
  }, [currentUser, habitCompletions])

  // Get last session date
  const lastSession = useMemo(() => {
    const completedSessions = sessions
      .filter(s => s.menteeId === currentUser.id && s.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (completedSessions.length === 0) return null
    
    const lastSessionDate = parseISO(completedSessions[0].date)
    const daysAgo = differenceInDays(new Date(), lastSessionDate)
    
    return {
      date: lastSessionDate,
      daysAgo: daysAgo,
      session: completedSessions[0]
    }
  }, [currentUser, sessions])

  // Check if user has goals
  const hasGoals = goals.filter(g => g.userId === currentUser.id).length > 0
  const hasHabits = habits.filter(h => {
    const userGoals = goals.filter(g => g.userId === currentUser.id)
    return userGoals.some(g => g.id === h.goalId)
  }).length > 0
  const hasSessions = sessions.filter(s => s.menteeId === currentUser.id).length > 0

  // Get upcoming sessions
  const upcomingSessions = sessions
    .filter(s => s.menteeId === currentUser.id && (s.status === 'confirmed' || s.status === 'pending'))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-50 via-blue-50/50 to-white rounded-xl shadow-lg p-8 mb-8 border border-blue-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left side - Profile and Welcome */}
            <div className="flex items-center gap-6 flex-1">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {currentUser.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Welcome, {currentUser.name}!
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Let's work on your growth journey today.
                </p>
                
                {/* Metrics */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Flame className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Streak</div>
                      <div className="text-lg font-bold text-gray-900">{streak}-Day Streak</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Star className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Points</div>
                      <div className="text-lg font-bold text-gray-900">{totalPoints} Total Points</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Clock className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Last Session</div>
                      <div className="text-lg font-bold text-gray-900">
                        {lastSession 
                          ? lastSession.daysAgo === 0 
                            ? 'Today' 
                            : `${lastSession.daysAgo} day${lastSession.daysAgo !== 1 ? 's' : ''} ago`
                          : 'No sessions yet'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Illustration and CTA */}
            <div className="flex flex-col items-end gap-4">
              {/* Growth illustration */}
              <div className="relative w-64 h-48 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
                <img 
                  src="/growth-illustration.png"
                  alt="Growth and progress illustration showing bar chart, plants, and upward trending arrow"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              
              <Link
                to="/goals"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GettingStartedCard
              icon={<Target className="text-primary-600" size={24} />}
              title="Set Your First Goal"
              description="Define what you want to achieve."
              link="/goals"
              completed={hasGoals}
            />
            <GettingStartedCard
              icon={<Calendar className="text-primary-600" size={24} />}
              title="Book Your First Session"
              description="Find and schedule time with a mentor."
              link="/mentors"
              completed={hasSessions}
            />
            <GettingStartedCard
              icon={<CheckCircle className="text-primary-600" size={24} />}
              title="Pick Habits to Track"
              description="Select habits you want to develop."
              link="/habits"
              completed={hasHabits}
            />
            <GettingStartedCard
              icon={<Users className="text-primary-600" size={24} />}
              title="Meet Your Mentor(s)"
              description="Get to know available mentors."
              link="/mentors"
              completed={hasSessions}
            />
          </div>
        </div>

        {/* Bottom Section - Upcoming Sessions and Membership */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
            {upcomingSessions.length === 0 ? (
              <div className="space-y-4">
                <p className="text-gray-500">No upcoming sessions</p>
                <Link
                  to="/mentors"
                  className="block w-full px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
                >
                  Browse Mentors
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {session.mentor?.name || 'Mentor'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {format(parseISO(session.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{session.topic || 'Session'}</p>
                    <p className="text-xs text-gray-500 mt-1">{session.time}</p>
                  </div>
                ))}
                <Link
                  to="/mentors"
                  className="block w-full mt-4 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
                >
                  Browse Mentors
                </Link>
              </div>
            )}
          </div>

          {/* Membership Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Membership</h2>
            <div className={`p-6 rounded-lg mb-4 ${
              currentUser.membershipTier === 'exclusive'
                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300'
                : currentUser.membershipTier === 'premium'
                  ? 'bg-primary-50 border-2 border-primary-300'
                  : 'bg-gray-50 border-2 border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900 capitalize">
                  {currentUser.membershipTier || 'standard'} Member
                </span>
                {currentUser.membershipTier === 'exclusive' && (
                  <span className="text-yellow-600 text-xl">✨</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {currentUser.membershipTier === 'exclusive'
                  ? 'You have access to all exclusive features and priority booking.'
                  : currentUser.membershipTier === 'premium'
                    ? 'You have access to premium features and early event registration.'
                    : 'Upgrade to unlock more features and exclusive access.'}
              </p>
              {currentUser.membershipTier !== 'exclusive' && (
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
                  Upgrade Membership
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <Link
                to="/habits"
                className="flex items-center justify-between w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <span className="text-gray-700">Browse Habit Templates</span>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface GettingStartedCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
  completed?: boolean
}

function GettingStartedCard({ icon, title, description, link, completed }: GettingStartedCardProps) {
  return (
    <Link
      to={link}
      className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
        completed
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 hover:border-primary-300'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
          completed ? 'bg-green-100' : 'bg-primary-50'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
          {completed && (
            <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-semibold">
              <CheckCircle size={14} />
              Completed
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

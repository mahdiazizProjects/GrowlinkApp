import { useState } from 'react'
import { Calendar, Video, MapPin, Star, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Dashboard() {
  const { currentUser, setCurrentUser, sessions } = useApp()
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

  if (!currentUser && !isLoggedIn) {
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

  const user = currentUser!

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
            value="3"
            color="primary"
          />
          <StatCard
            icon={<MapPin />}
            label="In-Person Sessions"
            value="12"
            color="gold"
          />
          <StatCard
            icon={<Star />}
            label="Your Rating"
            value="4.8"
            color="primary"
          />
          <StatCard
            icon={<TrendingUp />}
            label="Growth Score"
            value="+15%"
            color="green"
          />
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
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
              <button className="w-full mt-4 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                Browse Mentors
              </button>
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
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Browse Events
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                View Venues
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Community Forums
              </button>
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


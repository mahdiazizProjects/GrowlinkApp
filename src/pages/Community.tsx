import { MessageCircle, Users, TrendingUp, Calendar } from 'lucide-react'
import { mockEvents } from '../data/mockData'
import { Link } from 'react-router-dom'

export default function Community() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Hub</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            More than mentoring sessions. Connect, hang out, and grow together through casual meetups and community events.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<Users />} number="2,400+" label="Active Members" />
          <StatCard icon={<MessageCircle />} number="180+" label="Community Posts" />
          <StatCard icon={<Calendar />} number="24+" label="Upcoming Events" />
          <StatCard icon={<TrendingUp />} number="95%" label="Satisfaction Rate" />
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <Link to="/events" className="text-primary-600 hover:text-primary-700 font-semibold">
              View All →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                {event.image && (
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                      {event.type}
                    </span>
                    {event.price === 0 && (
                      <span className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-semibold">
                        Free
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>{event.attendees.length}/{event.maxAttendees} attending</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Features */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-primary-50 rounded-lg">
              <MessageCircle className="text-primary-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Discussion Forums</h3>
              <p className="text-gray-600 text-sm">
                Join conversations, ask questions, and share insights with the community.
              </p>
            </div>
            <div className="p-6 bg-primary-50 rounded-lg">
              <Calendar className="text-primary-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Casual Hangouts</h3>
              <p className="text-gray-600 text-sm">
                Informal meetups at partner venues for networking and connection.
              </p>
            </div>
            <div className="p-6 bg-primary-50 rounded-lg">
              <Users className="text-primary-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Interest Groups</h3>
              <p className="text-gray-600 text-sm">
                Connect with others who share your interests and goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, number, label }: { icon: React.ReactNode; number: string; label: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
      <div className="flex justify-center mb-3 text-primary-600">
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}


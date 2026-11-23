import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Users, Sparkles, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'
import EventCard, { eventDate } from '../components/events/EventCard'

export default function Community() {
  const { events, journeys } = useApp()
  const [mentorCount, setMentorCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    api.listMentors()
      .then(list => { if (!cancelled) setMentorCount(list.length) })
      .catch(() => { if (!cancelled) setMentorCount(null) })
    return () => { cancelled = true }
  }, [])

  const upcoming = useMemo(
    () => events.filter(e => eventDate(e).getTime() + e.duration * 60000 >= Date.now()),
    [events]
  )
  const publicPosts = journeys.filter(j => j.visibility.toLowerCase() === 'everyone').length
  const attendees = new Set(upcoming.flatMap(e => e.attendees)).size

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
          <StatCard icon={<Users />} number={mentorCount === null ? '—' : String(mentorCount)} label="Mentors" />
          <StatCard icon={<MessageCircle />} number={String(publicPosts)} label="Journey Posts" />
          <StatCard icon={<Calendar />} number={String(upcoming.length)} label="Upcoming Events" />
          <StatCard icon={<Sparkles />} number={String(attendees)} label="People Attending" />
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <Link to="/events" className="text-primary-600 hover:text-primary-700 font-semibold">
              View All →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">
              No upcoming events yet. New meetups are announced here.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.slice(0, 3).map(event => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>

        {/* Community Features */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-primary-50 rounded-lg">
              <MessageCircle className="text-primary-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Journeys</h3>
              <p className="text-gray-600 text-sm mb-3">
                Share progress, react and comment on what others are learning.
              </p>
              <Link to="/journeys" className="text-primary-600 text-sm font-semibold hover:text-primary-700">Open Journeys →</Link>
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


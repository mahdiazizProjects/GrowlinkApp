import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext'
import EventCard, { eventDate } from '../components/events/EventCard'

export default function Events() {
  const { events } = useApp()

  const { upcoming, past } = useMemo(() => {
    const now = Date.now()
    const isOver = (e: (typeof events)[number]) => eventDate(e).getTime() + e.duration * 60000 < now
    return {
      upcoming: events.filter(e => !isOver(e)),
      past: events.filter(isOver).reverse().slice(0, 6)
    }
  }, [events])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Events & Hangouts</h1>
          <p className="text-xl text-gray-600">
            Join casual meetups, workshops, and networking events in-person or virtually
          </p>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={40} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No upcoming events yet</h2>
            <p className="text-gray-600">New meetups and workshops are announced here. Check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        )}

        {past.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Past events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
              {past.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

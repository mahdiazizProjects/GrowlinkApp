import { Calendar, MapPin, Users, Clock, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { Event } from '../../types'

/** Parses "YYYY-MM-DD" as a local date (new Date("YYYY-MM-DD") would be UTC and can show the previous day). */
// eslint-disable-next-line react-refresh/only-export-components
export function eventDate(event: Pick<Event, 'date' | 'time'>): Date {
  return new Date(`${event.date.slice(0, 10)}T${event.time && event.time.length >= 4 ? event.time : '00:00'}:00`)
}

export default function EventCard({ event }: { event: Event }) {
  const { venues, currentUser, toggleEventAttendance } = useApp()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const venue = event.venueId ? venues.find(v => v.id === event.venueId) : null
  const attending = !!currentUser && event.attendees.includes(currentUser.id)
  const isFull = event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees
  const isPast = eventDate(event).getTime() + event.duration * 60000 < Date.now()

  const handleClick = async () => {
    if (!currentUser) {
      navigate('/auth', { state: { from: '/events' } })
      return
    }
    setBusy(true)
    try {
      await toggleEventAttendance(event.id)
    } finally {
      setBusy(false)
    }
  }

  let label = 'Join Event'
  if (isPast) label = 'Event ended'
  else if (attending) label = "You're going · Cancel"
  else if (isFull) label = 'Event full'
  else if (!currentUser) label = 'Sign in to join'

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      {event.image && (
        <img src={event.image} alt="" className="w-full h-48 object-cover" />
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold capitalize">
            {event.type.replace(/-/g, ' ')}
          </span>
          {event.price === 0 ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Free</span>
          ) : (
            <span className="text-gray-900 font-semibold">${event.price}</span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{eventDate(event).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>{event.time} • {event.duration} min</span>
          </div>
          {venue ? (
            <div className="flex items-center space-x-2 text-sm text-primary-600">
              <MapPin size={16} />
              <span>{venue.name} • {venue.city}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Video size={16} />
              <span>{event.isVirtual ? 'Virtual event' : 'Location to be announced'}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users size={16} />
            <span>
              {event.attendees.length}{event.maxAttendees > 0 ? `/${event.maxAttendees}` : ''} attending
              {event.host ? ` • Hosted by ${event.host.name}` : ''}
            </span>
          </div>
        </div>

        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{tag}</span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleClick}
          disabled={busy || isPast || (isFull && !attending)}
          className={`mt-auto w-full px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            attending
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {busy ? 'Saving…' : label}
        </button>
      </div>
    </div>
  )
}

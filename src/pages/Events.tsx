import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { mockEvents } from '../data/mockData'
import { useApp } from '../context/AppContext'

export default function Events() {
  const { venues } = useApp()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Events & Hangouts</h1>
          <p className="text-xl text-gray-600">
            Join casual meetups, workshops, and networking events in-person or virtually
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event) => {
            const venue = event.venueId ? venues.find(v => v.id === event.venueId) : null
            
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                {event.image && (
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold capitalize">
                      {event.type.replace('-', ' ')}
                    </span>
                    {event.price === 0 ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Free
                      </span>
                    ) : (
                      <span className="text-gray-900 font-semibold">${event.price}</span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
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
                        <span>Virtual Event</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>{event.attendees.length}/{event.maxAttendees} attending</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    Join Event
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


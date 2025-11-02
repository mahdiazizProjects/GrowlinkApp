import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Video, MapPin, Clock, CheckCircle } from 'lucide-react'
import { mockMentors } from '../data/mockData'
import { useApp } from '../context/AppContext'

export default function BookSession() {
  const { mentorId } = useParams()
  const navigate = useNavigate()
  const { venues, addSession, currentUser } = useApp()
  
  const mentor = mockMentors.find(m => m.id === mentorId)
  const [sessionType, setSessionType] = useState<'virtual' | 'in-person'>('in-person')
  const [selectedVenue, setSelectedVenue] = useState<string>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [topic, setTopic] = useState('')

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentor not found</h1>
          <button onClick={() => navigate('/mentors')} className="text-primary-600 hover:underline">
            Back to mentors
          </button>
        </div>
      </div>
    )
  }

  const virtualPrice = 75
  const inPersonPrice = 50
  const price = sessionType === 'in-person' ? inPersonPrice : virtualPrice
  const discount = sessionType === 'in-person' ? virtualPrice - inPersonPrice : 0

  const handleBooking = () => {
    if (!date || !time || !topic) {
      alert('Please fill in all fields')
      return
    }

    if (sessionType === 'in-person' && !selectedVenue) {
      alert('Please select a venue')
      return
    }

    if (!currentUser) {
      alert('Please sign in to book a session')
      return
    }

    const newSession = {
      id: `session-${Date.now()}`,
      mentorId: mentor.id,
      menteeId: currentUser.id,
      mentor,
      mentee: currentUser,
      type: sessionType,
      venueId: sessionType === 'in-person' ? selectedVenue : undefined,
      venue: sessionType === 'in-person' ? venues.find(v => v.id === selectedVenue) : undefined,
      date,
      time,
      duration: 60,
      status: 'pending' as const,
      price,
      topic
    }

    addSession(newSession)
    alert('Session booked successfully!')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Session with {mentor.name}</h1>
              <p className="text-gray-600">{mentor.bio.substring(0, 60)}...</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Session Type */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Type</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setSessionType('in-person')
                    setSelectedVenue('')
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    sessionType === 'in-person'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MapPin className={`mx-auto mb-2 ${sessionType === 'in-person' ? 'text-primary-600' : 'text-gray-400'}`} size={32} />
                  <div className="font-semibold text-gray-900">In-Person</div>
                  <div className="text-sm text-primary-600 font-medium mt-1">
                    ${inPersonPrice}/hr • Save ${discount}!
                  </div>
                </button>
                <button
                  onClick={() => setSessionType('virtual')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    sessionType === 'virtual'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Video className={`mx-auto mb-2 ${sessionType === 'virtual' ? 'text-primary-600' : 'text-gray-400'}`} size={32} />
                  <div className="font-semibold text-gray-900">Virtual</div>
                  <div className="text-sm text-gray-600 mt-1">${virtualPrice}/hr</div>
                </button>
              </div>
            </div>

            {/* Venue Selection */}
            {sessionType === 'in-person' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Venue</h2>
                <div className="space-y-3">
                  {venues.map((venue) => (
                    <button
                      key={venue.id}
                      onClick={() => setSelectedVenue(venue.id)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        selectedVenue === venue.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{venue.name}</span>
                        {selectedVenue === venue.id && (
                          <CheckCircle className="text-primary-600" size={20} />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{venue.address}, {venue.city}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Date & Time</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-2" size={18} />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline mr-2" size={18} />
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Topic */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Topic</h2>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What would you like to discuss? What are your goals for this session?"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Session Type</span>
                  <span className="font-medium">{sessionType === 'in-person' ? 'In-Person' : 'Virtual'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">1 hour</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-medium">${price}/hr</span>
                </div>
                {sessionType === 'in-person' && discount > 0 && (
                  <div className="flex justify-between text-sm text-primary-600">
                    <span>Discount</span>
                    <span className="font-semibold">-${discount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${price}</span>
                </div>
              </div>

              {sessionType === 'in-person' && (
                <div className="bg-gold-50 border border-gold-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gold-800">
                    <strong>✨ Bonus:</strong> In-person sessions earn extra rating points!
                  </p>
                </div>
              )}

              <button
                onClick={handleBooking}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


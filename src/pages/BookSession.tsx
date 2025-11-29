import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Video, MapPin, Clock, CheckCircle, Zap } from 'lucide-react'
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

  // Generate 15-minute time slots
  const generateTimeSlots = (selectedDate: string): string[] => {
    const slots: string[] = []
    const today = new Date()
    const selected = selectedDate ? new Date(selectedDate + 'T00:00:00') : null
    const isToday = selected && selected.toDateString() === today.toDateString()

    // Start time: if today, start from next 15-minute interval after current time, otherwise 9:00 AM
    let startHour = 9
    let startMinute = 0

    if (isToday) {
      const now = new Date()
      startHour = now.getHours()
      startMinute = Math.ceil(now.getMinutes() / 15) * 15
      if (startMinute >= 60) {
        startHour += 1
        startMinute = 0
      }
      // If it's too late (after 8 PM), start from tomorrow 9 AM
      if (startHour >= 20) {
        return []
      }
    }

    // Generate slots from start time to 8:00 PM (20:00)
    for (let hour = startHour; hour < 20; hour++) {
      const minStart = hour === startHour ? startMinute : 0
      for (let minute = minStart; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }

    return slots
  }

  const timeSlots = useMemo(() => generateTimeSlots(date), [date])

  // Handle "Book Now" - complete the entire booking process immediately
  const handleBookNow = () => {
    if (!currentUser) {
      alert('Please sign in to book a session')
      return
    }

    const now = new Date()
    const today = new Date().toISOString().split('T')[0]

    // Calculate next 15-minute slot
    const nextSlot = Math.ceil(now.getMinutes() / 15) * 15
    let nextHour = now.getHours()
    let nextMin = nextSlot

    if (nextMin >= 60) {
      nextHour += 1
      nextMin = 0
    }

    let bookingDate = today
    let bookingTime = ''

    // If it's after 8 PM, set to tomorrow 9 AM
    if (nextHour >= 20) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      bookingDate = tomorrow.toISOString().split('T')[0]
      bookingTime = '09:00'
    } else {
      bookingTime = `${nextHour.toString().padStart(2, '0')}:${nextMin.toString().padStart(2, '0')}`
    }

    // Generate slots to validate the time
    const slots = generateTimeSlots(bookingDate)
    const validTime = slots.length > 0 && slots.includes(bookingTime)
      ? bookingTime
      : slots.length > 0
        ? slots[0]
        : '09:00'

    // For in-person sessions, auto-select first venue if available
    let finalVenueId = selectedVenue
    if (sessionType === 'in-person' && !finalVenueId && venues.length > 0) {
      finalVenueId = venues[0].id
    }

    // Check if we have all required fields
    if (!topic) {
      // If no topic, prompt user or use a default
      const defaultTopic = `Quick session with ${mentor.name}`
      const userTopic = prompt(`What would you like to discuss? (Leave empty for "${defaultTopic}")`)
      if (userTopic === null) {
        return // User cancelled
      }
      setTopic(userTopic || defaultTopic)
    }

    // Create the session
    const newSession = {
      id: `session-${Date.now()}`,
      mentorId: mentor.id,
      menteeId: currentUser.id,
      mentor,
      mentee: currentUser,
      type: sessionType,
      venueId: sessionType === 'in-person' ? finalVenueId : undefined,
      venue: sessionType === 'in-person' ? venues.find(v => v.id === finalVenueId) : undefined,
      date: bookingDate,
      time: validTime,
      duration: 60,
      status: 'pending' as const,
      price,
      topic: topic || `Quick session with ${mentor.name}`
    }

    addSession(newSession)
    alert('Session booked successfully!')
    navigate('/dashboard')
  }

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
              <p className="text-gray-600 mb-4">{(mentor.bio || 'No bio available').substring(0, 60)}...</p>
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
                  className={`p-4 border-2 rounded-lg transition-all ${sessionType === 'in-person'
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
                  className={`p-4 border-2 rounded-lg transition-all ${sessionType === 'virtual'
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
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${selectedVenue === venue.id
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Date & Time</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-2" size={18} />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      // Reset time when date changes to ensure valid slot
                      if (time && timeSlots.length > 0 && !timeSlots.includes(time)) {
                        setTime(timeSlots[0])
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline mr-2" size={18} />
                    Time (15-min intervals)
                  </label>
                  {timeSlots.length === 0 ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                      No available slots for this date
                    </div>
                  ) : (
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((slot) => {
                        const [hours, minutes] = slot.split(':')
                        const hour12 = parseInt(hours) % 12 || 12
                        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
                        const displayTime = `${hour12}:${minutes} ${ampm}`
                        return (
                          <option key={slot} value={slot}>
                            {displayTime}
                          </option>
                        )
                      })}
                    </select>
                  )}
                </div>
              </div>
              {date && timeSlots.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Sessions are scheduled in 15-minute intervals (e.g., 10:00, 10:15, 10:30, 10:45)
                </p>
              )}
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

              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
                >
                  <Zap size={20} />
                  Book Now
                </button>
                <button
                  onClick={handleBooking}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Schedule for Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


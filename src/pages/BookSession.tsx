import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Video, MapPin, Clock, CheckCircle, Zap } from 'lucide-react'
import * as api from '../services/api'
import { useApp } from '../context/AppContext'
import { Session, User } from '../types'
import { useToast, errorMessage } from '../components/ui/Toast'
import { toLocalDateString } from '../utils/availability'

export default function BookSession() {
  const { mentorId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { venues, addSession, currentUser, getAvailableSlotsForMentor, loadMentorAvailability } = useApp()
  const [mentor, setMentor] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // The mentor's timetable and existing bookings, so taken slots are never offered.
  useEffect(() => {
    if (mentorId) loadMentorAvailability(mentorId)
  }, [mentorId, loadMentorAvailability])

  useEffect(() => {
    const loadMentor = async () => {
      if (!mentorId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const mentorData = await api.getUser(mentorId)
        if (mentorData) {
          // Verify the user is actually a mentor
          const role = mentorData.role?.toLowerCase()
          const isMentor = role === 'mentor' || role === 'both'
          if (isMentor) {
            setMentor(mentorData)
          } else {
            console.error('User is not a mentor:', mentorData)
            setMentor(null)
          }
        } else {
          setMentor(null)
        }
      } catch (error) {
        console.error('Error loading mentor:', error)
        setMentor(null)
      } finally {
        setLoading(false)
      }
    }
    loadMentor()
  }, [mentorId])
  const [sessionType, setSessionType] = useState<'virtual' | 'in-person'>('in-person')
  const [selectedVenue, setSelectedVenue] = useState<string>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [topic, setTopic] = useState('')

  // Slots based on mentor's defined availability (and existing bookings)
  const timeSlots = useMemo(() => {
    if (!mentorId || !date) return []
    return getAvailableSlotsForMentor(mentorId, date, 60)
  }, [mentorId, date, getAvailableSlotsForMentor])

  if (loading || !mentor || !currentUser) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading mentor...</p>
          </div>
        </div>
      )
    }
    if (!mentor) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentor Not Found</h1>
            <p className="text-gray-600 mb-6">The mentor you're looking for doesn't exist or is no longer available.</p>
            <button 
              onClick={() => navigate('/mentors')} 
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse Mentors
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to book a session</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  const virtualPrice = 75
  const inPersonPrice = 50
  const price = sessionType === 'in-person' ? inPersonPrice : virtualPrice
  const inPersonSaving = virtualPrice - inPersonPrice
  const discount = sessionType === 'in-person' ? inPersonSaving : 0

  const createBooking = async (bookingDate: string, slot: string, sessionTopic: string) => {
    if (!currentUser || !mentor) return
    if (mentor.id === currentUser.id) {
      setFormError("You can't book a session with yourself.")
      return
    }
    // Re-check right before saving: someone else may have just taken the slot.
    if (!getAvailableSlotsForMentor(mentor.id, bookingDate, 60).includes(slot)) {
      setFormError('That time was just taken. Please pick another slot.')
      return
    }
    setFormError(null)
    setBooking(true)
    try {
      const newSession: Session = {
        id: '',
        mentorId: mentor.id,
        menteeId: currentUser.id,
        type: sessionType,
        venueId: sessionType === 'in-person' ? selectedVenue || undefined : undefined,
        date: new Date(`${bookingDate}T${slot}:00`).toISOString(),
        time: slot,
        duration: 60,
        status: 'PENDING',
        notes: sessionTopic,
        topic: sessionTopic
      }
      await addSession(newSession)
      toast.success(`Request sent to ${mentor.name}. You'll be notified when they confirm.`)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error booking session:', error)
      setFormError(errorMessage(error, 'Could not book the session. Please try again.'))
    } finally {
      setBooking(false)
    }
  }

  // "Book Now": the first open slot today or tomorrow.
  const handleBookNow = async () => {
    if (!currentUser || !mentor) return
    if (sessionType === 'in-person' && !selectedVenue) {
      setFormError('Choose a venue for an in-person session.')
      return
    }
    for (const offset of [0, 1]) {
      const d = new Date()
      d.setDate(d.getDate() + offset)
      const day = toLocalDateString(d)
      const slots = getAvailableSlotsForMentor(mentor.id, day, 60)
      if (slots.length > 0) {
        await createBooking(day, slots[0], topic.trim() || `Quick session with ${mentor.name}`)
        return
      }
    }
    setFormError('No open slots today or tomorrow. Use "Schedule for Later" to pick a date.')
  }

  const handleBooking = async () => {
    if (!currentUser || !mentor) return
    if (!date || !time || !topic.trim()) {
      setFormError('Choose a date and time and describe what you want to cover.')
      return
    }
    if (sessionType === 'in-person' && !selectedVenue) {
      setFormError('Choose a venue for an in-person session.')
      return
    }
    await createBooking(date, time, topic.trim())
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            {mentor.avatar ? (
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {mentor.name.charAt(0)}
              </div>
            )}
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
                    ${inPersonPrice}/hr • Save ${inPersonSaving}!
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
                    min={(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; })()}
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

              {formError && (
                <p role="alert" className="text-sm text-red-600 mb-3">{formError}</p>
              )}
              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  disabled={booking}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Zap size={20} />
                  {booking ? 'Booking…' : 'Book Now'}
                </button>
                <button
                  onClick={handleBooking}
                  disabled={booking}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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


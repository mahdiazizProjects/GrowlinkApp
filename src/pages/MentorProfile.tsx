import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, CheckCircle, Calendar, Users, Award } from 'lucide-react'
import * as api from '../services/api'
import type { User, Session } from '../types'

export default function MentorProfile() {
  const { id } = useParams()
  const [mentor, setMentor] = useState<User | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) {
        setError('No mentor ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Fetch mentor and sessions in parallel
        const [mentorData, sessionsData] = await Promise.all([
          api.getUser(id),
          api.listSessionsForUser(id, 'mentor')
        ])
        
        if (!mentorData) {
          setError('Mentor not found')
        } else if (mentorData.role !== 'MENTOR' && mentorData.role !== 'mentor' && mentorData.role !== 'BOTH') {
          setError('User is not a mentor')
        } else {
          setMentor(mentorData)
          setSessions(sessionsData || [])
        }
      } catch (err) {
        console.error('Error fetching mentor:', err)
        setError('Failed to load mentor profile')
      } finally {
        setLoading(false)
      }
    }

    fetchMentor()
  }, [id])

  // Calculate stats from sessions
  const totalSessions = sessions.length
  const inPersonSessions = sessions.filter(s => s.type === 'in-person').length
  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'COMPLETED').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentor profile...</p>
        </div>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Mentor not found'}</h1>
          <Link to="/mentors" className="text-primary-600 hover:underline">
            Back to mentors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {mentor.avatar ? (
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-primary-200">
                <span className="text-white text-4xl font-bold">{mentor.name.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{mentor.name}</h1>
                {mentor.verified && (
                  <CheckCircle className="text-primary-600" size={24} />
                )}
                {mentor.membershipTier === 'exclusive' && (
                  <span className="px-3 py-1 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-full text-sm font-semibold">
                    ✨ Exclusive
                  </span>
                )}
              </div>
              {mentor.location && (
                <div className="flex items-center space-x-1 text-gray-600 mb-3">
                  <MapPin size={18} />
                  <span>{mentor.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-4">
                {mentor.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="text-gold-500 fill-gold-500" size={20} />
                    <span className="text-xl font-semibold">{mentor.rating}</span>
                  </div>
                )}
                <span className="text-gray-600">
                  {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'}
                  {inPersonSessions > 0 && ` • ${inPersonSessions} in-person`}
                </span>
              </div>
            </div>
            <Link
              to={`/book/${mentor.id}`}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Calendar size={20} />
              <span>Book Session</span>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{mentor.bio || 'No bio available'}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Expertise</h2>
              <div className="flex flex-wrap gap-3">
                {(mentor.skills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Session Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="text-primary-600" size={20} />
                    <span className="text-sm text-gray-600">Total Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
                </div>
                <div className="bg-gold-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="text-gold-600" size={20} />
                    <span className="text-sm text-gray-600">In-Person</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{inPersonSessions}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{completedSessions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Rates</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-primary-600 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700">Virtual Session</span>
                    <span className="font-semibold text-gray-900">$75/hr</span>
                  </div>
                  <p className="text-sm text-gray-500">Video call via platform</p>
                </div>
                <div className="border-l-4 border-gold-500 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700">In-Person Session</span>
                    <span className="font-semibold text-gray-900">$50/hr</span>
                  </div>
                  <p className="text-sm text-primary-600 font-medium">
                    ✨ 33% discount at partner venues
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-primary-50 to-gold-50 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Award className="text-primary-600" size={20} />
                <span>Why In-Person?</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={16} />
                  <span>Save $25 per session</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={16} />
                  <span>Earn bonus rating points</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={16} />
                  <span>Better connection & networking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

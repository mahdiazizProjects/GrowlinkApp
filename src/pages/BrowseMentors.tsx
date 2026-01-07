import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, MapPin, CheckCircle } from 'lucide-react'
import * as api from '../services/api'
import { User } from '../types'

export default function BrowseMentors() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [mentors, setMentors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMentors = async () => {
      setLoading(true)
      try {
        const mentorsData = await api.listMentors()
        setMentors(mentorsData)
      } catch (error) {
        console.error('Error loading mentors:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMentors()
  }, [])

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mentor.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.bio || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTier = filterTier === 'all' || mentor.membershipTier === filterTier

    return matchesSearch && matchesTier
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Mentor</h1>
          <p className="text-xl text-gray-600">
            Connect with curated, verified mentors ready to guide your journey
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, skill, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Tiers</option>
                <option value="exclusive">Exclusive</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading mentors...</p>
          </div>
        )}

        {/* Mentors Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
            <Link
              key={mentor.id}
              to={`/mentors/${mentor.id}`}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">{mentor.name}</h3>
                    {mentor.verified && (
                      <CheckCircle className="text-primary-600" size={20} />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 text-sm mb-2">
                    <MapPin size={14} />
                    <span>{mentor.location}</span>
                  </div>
                  {mentor.membershipTier === 'exclusive' && (
                    <span className="inline-block px-2 py-1 bg-gold-100 text-gold-800 rounded text-xs font-semibold">
                      ✨ Exclusive
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mentor.bio || 'No bio available'}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {(mentor.skills || []).slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <Star className="text-gold-500 fill-gold-500" size={18} />
                  <span className="font-semibold text-gray-900">{mentor.rating}</span>
                  <span className="text-sm text-gray-600">({mentor.totalSessions} sessions)</span>
                </div>
                {mentor.inPersonSessions && mentor.inPersonSessions > 0 && (
                  <span className="text-xs text-primary-600 font-medium">
                    {Math.round((mentor.inPersonSessions / mentor.totalSessions!) * 100)}% in-person
                  </span>
                )}
              </div>
            </Link>
            ))}
          </div>
        )}

        {!loading && filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No mentors found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

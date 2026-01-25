import { useState, useMemo } from 'react'
import { Filter, TrendingUp, Clock, Users } from 'lucide-react'
import { Journey, User, Session } from '../../types'
import JourneyPost from './JourneyPost'

interface JourneyFeedProps {
  journeys: Journey[]
  currentUser: User
  allUsers: User[]
  sessions: Session[]
  onReact: (journeyId: string, reactionType: 'heart' | 'celebrate' | 'support') => void
  onComment: (journeyId: string, text: string) => void
}

type FilterType = 'all' | 'my-posts' | 'mentors' | 'community'
type SortType = 'recent' | 'popular'

export default function JourneyFeed({
  journeys,
  currentUser,
  allUsers,
  sessions,
  onReact,
  onComment
}: JourneyFeedProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('recent')
  const currentRole = currentUser.role?.toLowerCase()

  // Get user's mentors (for mentees)
  const mentorIds = allUsers
    .filter(u => {
      const role = u.role?.toLowerCase()
      return role === 'mentor' || role === 'both'
    })
    .map(u => u.id)

  // Get mentee IDs for current user if they're a mentor (to show their mentees' posts)
  const menteeIds = useMemo(() => {
    if (currentRole === 'mentor' || currentRole === 'both') {
      return sessions
        .filter(s => s.mentorId === currentUser.id)
        .map(s => s.menteeId)
    }
    return []
  }, [sessions, currentUser.id, currentRole])

  // Filter journeys based on visibility and user permissions
  const getVisibleJourneys = () => {
    return journeys.filter(journey => {
      // Always show user's own posts
      if (journey.userId === currentUser.id) return true

      // Private posts - only visible to owner
      if (journey.visibility === 'private') return false
      
      // Everyone visibility - show to all users (mentors can see their mentees' public posts)
      if (journey.visibility === 'everyone') return true
      
      // Selected visibility - show if current user is in selectedMentorIds
      if (journey.visibility === 'selected') {
        return journey.selectedMentorIds?.includes(currentUser.id) || false
      }
      
      // Mentors visibility - show to mentors who have a relationship with the author
      // OR if current user is a mentor and the author is their mentee
      if (journey.visibility === 'mentors') {
        const isMentor = currentRole === 'mentor' || currentRole === 'both'
        // Show if user is a mentor AND the author is their mentee
        return isMentor && menteeIds.includes(journey.userId)
      }

      return false
    })
  }

  // Apply filters
  const getFilteredJourneys = () => {
    let filtered = getVisibleJourneys()

    switch (filter) {
      case 'my-posts':
        filtered = filtered.filter(j => j.userId === currentUser.id)
        break
      case 'mentors':
        filtered = filtered.filter(j => mentorIds.includes(j.userId))
        break
      case 'community':
        filtered = filtered.filter(j => j.visibility === 'everyone')
        break
      default:
        // 'all' - no additional filtering
        break
    }

    return filtered
  }

  // Apply sorting
  const getSortedJourneys = () => {
    const filtered = getFilteredJourneys()

    switch (sort) {
      case 'popular':
        return [...filtered].sort((a, b) => {
          const aReactions = (a.reactions?.length || 0) + (a.comments?.length || 0) * 2
          const bReactions = (b.reactions?.length || 0) + (b.comments?.length || 0) * 2
          return bReactions - aReactions
        })
      case 'recent':
      default:
        return [...filtered].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }
  }

  const displayedJourneys = getSortedJourneys()

  return (
    <div>
      {/* Filter and sort controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700 mr-2">Show:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setFilter('my-posts')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'my-posts'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                My Posts
              </button>
              <button
                onClick={() => setFilter('mentors')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'mentors'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users size={14} className="inline mr-1" />
                Mentors
              </button>
              <button
                onClick={() => setFilter('community')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'community'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Community
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 mr-2">Sort by:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSort('recent')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sort === 'recent'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock size={14} className="inline mr-1" />
                Recent
              </button>
              <button
                onClick={() => setSort('popular')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sort === 'popular'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp size={14} className="inline mr-1" />
                Popular
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {displayedJourneys.length} {displayedJourneys.length === 1 ? 'journey' : 'journeys'}
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {displayedJourneys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No journeys found</h3>
              <p className="text-gray-600">
                {filter === 'my-posts'
                  ? "You haven't posted any journeys yet. Share your first thought above!"
                  : 'Try adjusting your filters to see more journeys.'}
              </p>
            </div>
          </div>
        ) : (
          displayedJourneys.map(journey => (
            <JourneyPost
              key={journey.id}
              journey={journey}
              currentUser={currentUser}
              onReact={onReact}
              onComment={onComment}
              allUsers={allUsers}
            />
          ))
        )}
      </div>
    </div>
  )
}

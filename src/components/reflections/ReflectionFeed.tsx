import { useState } from 'react'
import { Filter, TrendingUp, Clock, Users } from 'lucide-react'
import { Reflection, User } from '../../types'
import ReflectionPost from './ReflectionPost'

interface ReflectionFeedProps {
  reflections: Reflection[]
  currentUser: User
  allUsers: User[]
  onReact: (reflectionId: string, reactionType: 'heart' | 'celebrate' | 'support') => void
  onComment: (reflectionId: string, text: string) => void
}

type FilterType = 'all' | 'my-posts' | 'mentors' | 'community'
type SortType = 'recent' | 'popular'

export default function ReflectionFeed({
  reflections,
  currentUser,
  allUsers,
  onReact,
  onComment
}: ReflectionFeedProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('recent')

  // Get user's mentors (users who have mentored them)
  const mentorIds = allUsers
    .filter(u => u.role === 'MENTOR' || u.role === 'mentor' || u.role === 'BOTH')
    .map(u => u.id)

  // Filter reflections based on visibility and user permissions
  const getVisibleReflections = () => {
    return reflections.filter(reflection => {
      // Always show user's own posts
      if (reflection.userId === currentUser.id) return true

      // Check visibility settings
      if (reflection.visibility === 'private') return false
      if (reflection.visibility === 'everyone') return true
      if (reflection.visibility === 'mentors') {
        return currentUser.role === 'MENTOR' || currentUser.role === 'mentor' || currentUser.role === 'BOTH'
      }
      if (reflection.visibility === 'selected' && reflection.selectedMentorIds) {
        return reflection.selectedMentorIds.includes(currentUser.id)
      }

      return false
    })
  }

  // Apply filters
  const getFilteredReflections = () => {
    let filtered = getVisibleReflections()

    switch (filter) {
      case 'my-posts':
        filtered = filtered.filter(r => r.userId === currentUser.id)
        break
      case 'mentors':
        filtered = filtered.filter(r => mentorIds.includes(r.userId))
        break
      case 'community':
        filtered = filtered.filter(r => r.visibility === 'everyone')
        break
      default:
        // 'all' - no additional filtering
        break
    }

    return filtered
  }

  // Apply sorting
  const getSortedReflections = () => {
    const filtered = getFilteredReflections()

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

  const displayedReflections = getSortedReflections()

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
            Showing {displayedReflections.length} {displayedReflections.length === 1 ? 'reflection' : 'reflections'}
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {displayedReflections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reflections found</h3>
              <p className="text-gray-600">
                {filter === 'my-posts'
                  ? "You haven't posted any reflections yet. Share your first thought above!"
                  : 'Try adjusting your filters to see more reflections.'}
              </p>
            </div>
          </div>
        ) : (
          displayedReflections.map(reflection => (
            <ReflectionPost
              key={reflection.id}
              reflection={reflection}
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

import { useState } from 'react'
import { Heart, MessageCircle, Globe, Lock, Users, Award } from 'lucide-react'
import { Journey, User } from '../../types'
import { formatDistanceToNow } from 'date-fns'

interface ReactionTooltipProps {
  reactions: Array<{ userId: string; type: string }>
  allUsers: User[]
  reactionType: 'heart' | 'celebrate' | 'support'
  children: React.ReactNode
}

interface JourneyPostProps {
  journey: Journey
  currentUser: User
  onReact: (journeyId: string, reactionType: 'heart' | 'celebrate' | 'support') => void
  onComment: (journeyId: string, text: string) => void
  allUsers: User[]
}

const MOODS = {
  GREAT: { emoji: '😊', label: 'Great', color: 'text-green-600' },
  GOOD: { emoji: '🙂', label: 'Good', color: 'text-blue-600' },
  NEUTRAL: { emoji: '😐', label: 'Neutral', color: 'text-gray-600' },
  BAD: { emoji: '😔', label: 'Bad', color: 'text-orange-600' },
  AWFUL: { emoji: '😢', label: 'Awful', color: 'text-red-600' },
}

const VISIBILITY_ICONS = {
  everyone: <Globe size={14} />,
  mentors: <Users size={14} />,
  private: <Lock size={14} />,
  selected: <Users size={14} />
}

const VISIBILITY_LABELS = {
  everyone: 'Everyone',
  mentors: 'All Mentors',
  private: 'Private',
  selected: 'Selected Mentors'
}

function ReactionTooltip({ reactions, allUsers, reactionType, children }: ReactionTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  // Filter reactions by type (handle both uppercase and lowercase)
  const filteredReactions = reactions.filter(r => {
    if (!r || !r.type) return false
    const rType = typeof r.type === 'string' ? r.type.toLowerCase() : r.type
    return rType === reactionType.toLowerCase()
  })
  
  // Map to users
  const usersWhoReacted = filteredReactions
    .map(r => {
      if (!r || !r.userId) return null
      return allUsers.find(u => u.id === r.userId)
    })
    .filter((user): user is User => user !== null && user !== undefined)

  const reactionEmojis = {
    heart: '❤️',
    celebrate: '🎉',
    support: '🤝'
  }

  // Only show tooltip if there are reactions
  if (usersWhoReacted.length === 0) {
    return <>{children}</>
  }

  return (
    <div 
      className="relative inline-block group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[100] pointer-events-none">
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xl px-4 py-3 min-w-[220px] max-w-[280px]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
              <span className="text-lg">{reactionEmojis[reactionType]}</span>
              <span className="font-semibold text-gray-900 text-sm">
                {usersWhoReacted.length} {usersWhoReacted.length === 1 ? 'person' : 'people'} reacted
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {usersWhoReacted.map((user) => (
                <div key={user.id} className="flex items-center gap-2.5 py-1">
                  <img
                    src={user.avatar || 'https://via.placeholder.com/32'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="text-gray-800 text-sm font-medium truncate">{user.name}</span>
                </div>
              ))}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  )
}

export default function JourneyPost({
  journey,
  currentUser,
  onReact,
  onComment,
  allUsers
}: JourneyPostProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const author = journey.user || allUsers.find(u => u.id === journey.userId)
  const mood = journey.mood ? MOODS[journey.mood] : undefined

  // Get reaction counts (handle both uppercase and lowercase)
  const reactionCounts = {
    heart: journey.reactions?.filter(r => {
      const rType = typeof r.type === 'string' ? r.type.toLowerCase() : r.type
      return rType === 'heart'
    }).length || 0,
    celebrate: journey.reactions?.filter(r => {
      const rType = typeof r.type === 'string' ? r.type.toLowerCase() : r.type
      return rType === 'celebrate'
    }).length || 0,
    support: journey.reactions?.filter(r => {
      const rType = typeof r.type === 'string' ? r.type.toLowerCase() : r.type
      return rType === 'support'
    }).length || 0
  }

  const totalReactions = reactionCounts.heart + reactionCounts.celebrate + reactionCounts.support
  const hasUserReacted = journey.reactions?.some(r => r.userId === currentUser.id)

  const handleAddComment = () => {
    if (commentText.trim()) {
      onComment(journey.id, commentText)
      setCommentText('')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <img
            src={author?.avatar || 'https://via.placeholder.com/40'}
            alt={author?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{author?.name || 'Unknown User'}</h3>
              {author?.verified && (
                <Award className="text-blue-500" size={16} />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDistanceToNow(new Date(journey.createdAt), { addSuffix: true })}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {VISIBILITY_ICONS[journey.visibility]}
                <span>{VISIBILITY_LABELS[journey.visibility]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mood indicator */}
        {mood && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
            <span className="text-xl">{mood.emoji}</span>
            <span className={`text-sm font-medium ${mood.color}`}>{mood.label}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{journey.text}</p>

        {/* Tags */}
        {journey.tags && journey.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {journey.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reactions summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
          <div className="flex items-center -space-x-1">
            {reactionCounts.heart > 0 && (
              <ReactionTooltip
                reactions={journey.reactions || []}
                allUsers={allUsers}
                reactionType="heart"
              >
                <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-red-200 transition-colors">
                  ❤️
                </span>
              </ReactionTooltip>
            )}
            {reactionCounts.celebrate > 0 && (
              <ReactionTooltip
                reactions={journey.reactions || []}
                allUsers={allUsers}
                reactionType="celebrate"
              >
                <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-yellow-200 transition-colors">
                  🎉
                </span>
              </ReactionTooltip>
            )}
            {reactionCounts.support > 0 && (
              <ReactionTooltip
                reactions={journey.reactions || []}
                allUsers={allUsers}
                reactionType="support"
              >
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-blue-200 transition-colors">
                  🤝
                </span>
              </ReactionTooltip>
            )}
          </div>
          <span className="text-sm text-gray-600">
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-4 pb-3 mb-3 border-b border-gray-100">
        <button
          onClick={() => onReact(journey.id, 'heart')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            hasUserReacted
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Heart size={18} className={hasUserReacted ? 'fill-current' : ''} />
          <span className="text-sm font-medium">React</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">
            Comment {journey.comments && journey.comments.length > 0 && `(${journey.comments.length})`}
          </span>
        </button>
      </div>

      {/* Reaction options (expanded) */}
      <div className="flex items-center gap-2 mb-4">
        <ReactionTooltip
          reactions={journey.reactions || []}
          allUsers={allUsers}
          reactionType="heart"
        >
          <button
            onClick={() => onReact(journey.id, 'heart')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <span className="text-lg">❤️</span>
            {reactionCounts.heart > 0 && (
              <span className="text-xs text-gray-600">{reactionCounts.heart}</span>
            )}
          </button>
        </ReactionTooltip>
        <ReactionTooltip
          reactions={journey.reactions || []}
          allUsers={allUsers}
          reactionType="celebrate"
        >
          <button
            onClick={() => onReact(journey.id, 'celebrate')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
          >
            <span className="text-lg">🎉</span>
            {reactionCounts.celebrate > 0 && (
              <span className="text-xs text-gray-600">{reactionCounts.celebrate}</span>
            )}
          </button>
        </ReactionTooltip>
        <ReactionTooltip
          reactions={journey.reactions || []}
          allUsers={allUsers}
          reactionType="support"
        >
          <button
            onClick={() => onReact(journey.id, 'support')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span className="text-lg">🤝</span>
            {reactionCounts.support > 0 && (
              <span className="text-xs text-gray-600">{reactionCounts.support}</span>
            )}
          </button>
        </ReactionTooltip>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Existing comments */}
          {journey.comments && journey.comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {journey.comments.map(comment => {
                const commenter = comment.user || allUsers.find(u => u.id === comment.userId)
                return (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={commenter?.avatar || 'https://via.placeholder.com/32'}
                      alt={commenter?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {commenter?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add comment */}
          <div className="flex gap-3">
            <img
              src={currentUser.avatar || 'https://via.placeholder.com/32'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none text-sm"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

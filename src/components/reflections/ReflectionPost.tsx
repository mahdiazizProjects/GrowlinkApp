import { useState } from 'react'
import { Heart, MessageCircle, Globe, Lock, Users, Award } from 'lucide-react'
import { Reflection, User } from '../../types'
import { formatDistanceToNow } from 'date-fns'

interface ReflectionPostProps {
  reflection: Reflection
  currentUser: User
  onReact: (reflectionId: string, reactionType: 'heart' | 'celebrate' | 'support') => void
  onComment: (reflectionId: string, text: string) => void
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

export default function ReflectionPost({
  reflection,
  currentUser,
  onReact,
  onComment,
  allUsers
}: ReflectionPostProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const author = reflection.user || allUsers.find(u => u.id === reflection.userId)
  const mood = MOODS[reflection.mood]

  // Get reaction counts
  const reactionCounts = {
    heart: reflection.reactions?.filter(r => r.type === 'heart').length || 0,
    celebrate: reflection.reactions?.filter(r => r.type === 'celebrate').length || 0,
    support: reflection.reactions?.filter(r => r.type === 'support').length || 0
  }

  const totalReactions = reactionCounts.heart + reactionCounts.celebrate + reactionCounts.support
  const hasUserReacted = reflection.reactions?.some(r => r.userId === currentUser.id)

  const handleAddComment = () => {
    if (commentText.trim()) {
      onComment(reflection.id, commentText)
      setCommentText('')
    }
  }

  const getContentText = () => {
    if (reflection.text) return reflection.text
    if (typeof reflection.content === 'string') return reflection.content
    if (typeof reflection.content === 'object') {
      const parts = []
      if (reflection.content.whatWentWell) parts.push(`✅ ${reflection.content.whatWentWell}`)
      if (reflection.content.whatFeltHard) parts.push(`💪 ${reflection.content.whatFeltHard}`)
      if (reflection.content.insights) parts.push(`💡 ${reflection.content.insights}`)
      return parts.join('\n\n')
    }
    return ''
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
              <span>{formatDistanceToNow(new Date(reflection.createdAt), { addSuffix: true })}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {VISIBILITY_ICONS[reflection.visibility]}
                <span>{VISIBILITY_LABELS[reflection.visibility]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mood indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
          <span className="text-xl">{mood.emoji}</span>
          <span className={`text-sm font-medium ${mood.color}`}>{mood.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{getContentText()}</p>

        {/* Tags */}
        {reflection.tags && reflection.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {reflection.tags.map((tag, index) => (
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
              <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs">
                ❤️
              </span>
            )}
            {reactionCounts.celebrate > 0 && (
              <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs">
                🎉
              </span>
            )}
            {reactionCounts.support > 0 && (
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                🤝
              </span>
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
          onClick={() => onReact(reflection.id, 'heart')}
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
            Comment {reflection.comments && reflection.comments.length > 0 && `(${reflection.comments.length})`}
          </span>
        </button>
      </div>

      {/* Reaction options (expanded) */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => onReact(reflection.id, 'heart')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          title="Heart"
        >
          <span className="text-lg">❤️</span>
          {reactionCounts.heart > 0 && (
            <span className="text-xs text-gray-600">{reactionCounts.heart}</span>
          )}
        </button>
        <button
          onClick={() => onReact(reflection.id, 'celebrate')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
          title="Celebrate"
        >
          <span className="text-lg">🎉</span>
          {reactionCounts.celebrate > 0 && (
            <span className="text-xs text-gray-600">{reactionCounts.celebrate}</span>
          )}
        </button>
        <button
          onClick={() => onReact(reflection.id, 'support')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          title="Support"
        >
          <span className="text-lg">🤝</span>
          {reactionCounts.support > 0 && (
            <span className="text-xs text-gray-600">{reactionCounts.support}</span>
          )}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Existing comments */}
          {reflection.comments && reflection.comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {reflection.comments.map(comment => {
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

import { useState } from 'react'
import { Send, Globe, Lock, Users, X, Smile } from 'lucide-react'
import { User, Goal } from '../../types'

interface ReflectionComposerProps {
  currentUser: User
  mentors: User[]
  goals: Goal[]
  onSubmit: (reflection: {
    text: string
    mood: 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'AWFUL'
    visibility: 'everyone' | 'mentors' | 'private' | 'selected'
    selectedMentorIds?: string[]
    tags?: string[]
    goalId?: string
  }) => void
}

const MOODS = [
  { emoji: '😊', label: 'Great', value: 'GREAT' },
  { emoji: '🙂', label: 'Good', value: 'GOOD' },
  { emoji: '😐', label: 'Neutral', value: 'NEUTRAL' },
  { emoji: '😔', label: 'Bad', value: 'BAD' },
  { emoji: '😢', label: 'Awful', value: 'AWFUL' },
]

const VISIBILITY_OPTIONS = [
  {
    value: 'everyone',
    label: 'Everyone',
    icon: Globe,
    description: 'Visible to all community members'
  },
  {
    value: 'mentors',
    label: 'All Mentors',
    icon: Users,
    description: 'Visible to all your mentors'
  },
  {
    value: 'selected',
    label: 'Selected Mentors',
    icon: Users,
    description: 'Choose specific mentors'
  },
  {
    value: 'private',
    label: 'Private',
    icon: Lock,
    description: 'Only visible to you'
  }
]

export default function ReflectionComposer({
  currentUser,
  mentors,
  goals,
  onSubmit
}: ReflectionComposerProps) {
  const [text, setText] = useState('')
  const [selectedMood, setSelectedMood] = useState<'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'AWFUL'>('GOOD')
  const [visibility, setVisibility] = useState<'everyone' | 'mentors' | 'private' | 'selected'>('everyone')
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false)

  const handleSubmit = () => {
    if (!text.trim()) return

    onSubmit({
      text: text.trim(),
      mood: selectedMood,
      visibility,
      selectedMentorIds: visibility === 'selected' ? selectedMentorIds : undefined,
      tags: tags.length > 0 ? tags : undefined,
      goalId: selectedGoalId || undefined
    })

    // Reset form
    setText('')
    setSelectedMood('GOOD')
    setVisibility('everyone')
    setSelectedMentorIds([])
    setTags([])
    setSelectedGoalId('')
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const toggleMentorSelection = (mentorId: string) => {
    if (selectedMentorIds.includes(mentorId)) {
      setSelectedMentorIds(selectedMentorIds.filter(id => id !== mentorId))
    } else {
      setSelectedMentorIds([...selectedMentorIds, mentorId])
    }
  }

  const selectedVisibilityOption = VISIBILITY_OPTIONS.find(opt => opt.value === visibility)
  const VisibilityIcon = selectedVisibilityOption?.icon || Globe

  const activeGoals = goals.filter(g => g.status === 'active' || g.status === 'ACTIVE')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={currentUser.avatar || 'https://via.placeholder.com/48'}
          alt={currentUser.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-900">Share your journey</h3>
          <p className="text-sm text-gray-500">What's on your mind?</p>
        </div>
      </div>

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your thoughts, wins, challenges, or learnings..."
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none mb-4"
      />

      {/* Mood selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Smile className="inline mr-1" size={16} />
          How are you feeling?
        </label>
        <div className="flex items-center gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value as any)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                selectedMood === mood.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs font-medium text-gray-700">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goal selector (optional) */}
      {activeGoals.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Related Goal (Optional)
          </label>
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          >
            <option value="">None</option>
            {activeGoals.map(goal => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tags */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tags (Optional)
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag (e.g., growth, mindset)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-purple-900"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visibility selector */}
      <div className="mb-4 relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Who can see this?
        </label>
        <button
          onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <VisibilityIcon size={18} className="text-gray-600" />
            <span className="font-medium text-gray-900">{selectedVisibilityOption?.label}</span>
          </div>
          <span className="text-sm text-gray-500">{selectedVisibilityOption?.description}</span>
        </button>

        {showVisibilityMenu && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            {VISIBILITY_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setVisibility(option.value as any)
                    setShowVisibilityMenu(false)
                    if (option.value !== 'selected') {
                      setSelectedMentorIds([])
                    }
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    visibility === option.value ? 'bg-purple-50' : ''
                  }`}
                >
                  <Icon size={20} className="text-gray-600 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Mentor selection (if visibility is 'selected') */}
      {visibility === 'selected' && mentors.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Mentors
          </label>
          <div className="space-y-2">
            {mentors.map(mentor => (
              <label
                key={mentor.id}
                className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedMentorIds.includes(mentor.id)}
                  onChange={() => toggleMentorSelection(mentor.id)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <img
                  src={mentor.avatar || 'https://via.placeholder.com/32'}
                  alt={mentor.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-900">{mentor.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Submit button */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || (visibility === 'selected' && selectedMentorIds.length === 0)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
          Share Reflection
        </button>
      </div>
    </div>
  )
}

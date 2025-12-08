import { useApp } from '../context/AppContext'
import ReflectionComposer from '../components/reflections/ReflectionComposer'
import ReflectionFeed from '../components/reflections/ReflectionFeed'
import { Sparkles } from 'lucide-react'
import { Reflection, User } from '../types'
import { mockMentors, mockMentees } from '../data/mockData'

export default function Reflections() {
  const {
    currentUser,
    reflections,
    goals,
    addReflection,
    addReactionToReflection,
    addCommentToReflection
  } = useApp()

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view reflections.</p>
        </div>
      </div>
    )
  }

  // Mock users data - in production, this would come from context or API
  const mockUsers: User[] = [
    currentUser,
    ...mockMentors,
    ...mockMentees
  ]

  const mentors = mockUsers.filter(u => u.role === 'MENTOR' || u.role === 'mentor' || u.role === 'BOTH')

  const handleSubmitReflection = (reflectionData: {
    text: string
    mood: 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'AWFUL'
    visibility: 'everyone' | 'mentors' | 'private' | 'selected'
    selectedMentorIds?: string[]
    tags?: string[]
    goalId?: string
  }) => {
    const newReflection: Reflection = {
      id: `reflection-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      date: new Date().toISOString().split('T')[0],
      mood: reflectionData.mood,
      text: reflectionData.text,
      content: reflectionData.text,
      visibility: reflectionData.visibility,
      selectedMentorIds: reflectionData.selectedMentorIds,
      tags: reflectionData.tags,
      goalId: reflectionData.goalId,
      isShared: reflectionData.visibility !== 'private',
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addReflection(newReflection)
  }

  const handleReact = (reflectionId: string, reactionType: 'heart' | 'celebrate' | 'support') => {
    addReactionToReflection(reflectionId, currentUser.id, reactionType)
  }

  const handleComment = (reflectionId: string, text: string) => {
    addCommentToReflection(reflectionId, currentUser.id, text)
  }

  // Enrich reflections with user data
  const enrichedReflections = reflections.map(reflection => ({
    ...reflection,
    user: reflection.user || mockUsers.find(u => u.id === reflection.userId),
    comments: reflection.comments?.map(comment => ({
      ...comment,
      user: comment.user || mockUsers.find(u => u.id === comment.userId)
    }))
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Journeys</h1>
              <p className="text-gray-600">Share your growth, inspire others</p>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="mb-6">
          <ReflectionComposer
            currentUser={currentUser}
            mentors={mentors}
            goals={goals}
            onSubmit={handleSubmitReflection}
          />
        </div>

        {/* Feed */}
        <ReflectionFeed
          reflections={enrichedReflections}
          currentUser={currentUser}
          allUsers={mockUsers}
          onReact={handleReact}
          onComment={handleComment}
        />
      </div>
    </div>
  )
}

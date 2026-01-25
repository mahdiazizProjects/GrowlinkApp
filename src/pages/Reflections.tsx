import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import JourneyComposer from '../components/journeys/JourneyComposer'
import JourneyFeed from '../components/journeys/JourneyFeed'
import { Sparkles } from 'lucide-react'
import { Journey, User } from '../types'
import * as api from '../services/api'

export default function Reflections() {
  const {
    currentUser,
    journeys,
    goals,
    sessions,
    addJourney,
    addReactionToJourney,
    addCommentToJourney
  } = useApp()

  const [allUsers, setAllUsers] = useState<User[]>([])

  // Fetch all users for reaction tooltips
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await api.listUsers()
        setAllUsers(users)
      } catch (error) {
        console.error('Error fetching users:', error)
        // Fallback to just current user if fetch fails
        if (currentUser) {
          setAllUsers([currentUser])
        }
      }
    }
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

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

  // Ensure currentUser is in the list
  const usersWithCurrent = allUsers.length > 0 
    ? allUsers.some(u => u.id === currentUser.id) 
      ? allUsers 
      : [currentUser, ...allUsers]
    : [currentUser]

  const mentors = usersWithCurrent.filter(u => {
    const role = u.role?.toLowerCase()
    return role === 'mentor' || role === 'both'
  })

  const handleSubmitJourney = (journeyData: {
    text: string
    mood: 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'AWFUL'
    visibility: 'everyone' | 'mentors' | 'private' | 'selected'
    selectedMentorIds?: string[]
    tags?: string[]
    goalId?: string
  }) => {
    const newJourney: Journey = {
      id: `journey-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      mood: journeyData.mood,
      text: journeyData.text,
      visibility: journeyData.visibility,
      selectedMentorIds: journeyData.selectedMentorIds,
      tags: journeyData.tags,
      goalId: journeyData.goalId,
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addJourney(newJourney)
  }

  const handleReact = (journeyId: string, reactionType: 'heart' | 'celebrate' | 'support') => {
    addReactionToJourney(journeyId, currentUser.id, reactionType)
  }

  const handleComment = (journeyId: string, text: string) => {
    addCommentToJourney(journeyId, currentUser.id, text)
  }

  // Enrich journeys with user data
  const enrichedJourneys = journeys.map(journey => ({
    ...journey,
    user: journey.user || usersWithCurrent.find(u => u.id === journey.userId),
    comments: journey.comments?.map(comment => ({
      ...comment,
      user: comment.user || usersWithCurrent.find(u => u.id === comment.userId)
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
          <JourneyComposer
            currentUser={currentUser}
            mentors={mentors}
            goals={goals}
            onSubmit={handleSubmitJourney}
          />
        </div>

        {/* Feed */}
        <JourneyFeed
          journeys={enrichedJourneys}
          currentUser={currentUser}
          allUsers={usersWithCurrent}
          sessions={sessions}
          onReact={handleReact}
          onComment={handleComment}
        />
      </div>
    </div>
  )
}

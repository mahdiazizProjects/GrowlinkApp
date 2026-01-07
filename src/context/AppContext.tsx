import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Venue, Session, Event, Rating, Goal, Habit, HabitCompletion, Reflection, ReflectionComment, ReflectionReaction, Badge, SessionFeedback, MentorFeedbackStats, MentorSessionNotes, Notification, MentorStats, MenteeSummary } from '../types'
import * as api from '../services/api'

interface AppContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  loading: boolean
  venues: Venue[]
  sessions: Session[]
  events: Event[]
  ratings: Rating[]
  goals: Goal[]
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  reflections: Reflection[]
  badges: Badge[]
  sessionFeedbacks: SessionFeedback[]
  mentorSessionNotes: MentorSessionNotes[]
  notifications: Notification[]
  addSession: (session: Session) => Promise<void>
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>
  addEvent: (event: Event) => void
  addRating: (rating: Rating) => void
  addGoal: (goal: Goal) => Promise<void>
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>
  removeGoal: (goalId: string) => Promise<void>
  addHabit: (habit: Habit) => Promise<void>
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>
  toggleHabitCompletion: (habitId: string, date: string) => void
  addReflection: (reflection: Reflection) => Promise<void>
  addReactionToReflection: (reflectionId: string, userId: string, type: 'heart' | 'celebrate' | 'support') => void
  addCommentToReflection: (reflectionId: string, userId: string, text: string) => void
  addBadge: (badge: Badge) => void
  addSessionFeedback: (feedback: SessionFeedback) => Promise<void>
  getMentorFeedbackStats: (mentorId: string) => MentorFeedbackStats | null
  addMentorSessionNotes: (notes: MentorSessionNotes) => void
  updateMentorSessionNotes: (noteId: string, updates: Partial<MentorSessionNotes>) => void
  getMentorSessionNotes: (sessionId: string) => MentorSessionNotes | null
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (notificationId: string) => void
  getUnreadNotificationCount: (userId: string) => number
  getMentorStats: (mentorId: string) => MentorStats | null
  getMenteeSummaries: (mentorId: string) => MenteeSummary[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Wrapper function to sync user state with localStorage
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user)
    if (user) {
      localStorage.setItem('currentUserId', user.id)
    } else {
      localStorage.removeItem('currentUserId')
    }
  }

  // Restore user from localStorage on app load
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const storedUserId = localStorage.getItem('currentUserId')
        if (storedUserId) {
          const user = await api.getUser(storedUserId)
          if (user) {
            setCurrentUser(user)
            console.log('✓ Restored user session:', user.name)
          } else {
            // User not found, clear invalid ID
            localStorage.removeItem('currentUserId')
            setLoading(false)
          }
        } else {
          // No stored user, set loading to false
          setLoading(false)
        }
      } catch (error) {
        console.error('Error restoring user session:', error)
        localStorage.removeItem('currentUserId')
        setLoading(false)
      }
    }

    restoreUser()
  }, [])

  // Data from API
  const [venues, setVenues] = useState<Venue[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([])
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [sessionFeedbacks, setSessionFeedbacks] = useState<SessionFeedback[]>([])
  const [mentorSessionNotes, setMentorSessionNotes] = useState<MentorSessionNotes[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load initial data when user changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load venues (static for now - will be added to schema)
        setVenues([
          {
            id: '1',
            name: 'Central Library',
            type: 'library',
            address: '123 Main St',
            city: 'New York',
            capacity: 50,
            amenities: ['WiFi', 'Meeting Rooms', 'Coffee', 'Parking'],
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
            isPartner: true,
            partnershipTier: 'gold'
          },
          {
            id: '2',
            name: 'TechHub Co-working',
            type: 'co-working',
            address: '456 Innovation Ave',
            city: 'San Francisco',
            capacity: 30,
            amenities: ['WiFi', 'Phone Booths', 'Kitchen', 'Printing'],
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            isPartner: true,
            partnershipTier: 'silver'
          },
          {
            id: '3',
            name: 'Community Center Downtown',
            type: 'community-center',
            address: '789 Community Way',
            city: 'Seattle',
            capacity: 100,
            amenities: ['WiFi', 'Large Hall', 'Kitchen', 'Parking'],
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
            isPartner: true,
            partnershipTier: 'bronze'
          }
        ])

        // Load user-specific data if logged in
        if (currentUser?.id) {
          const [sessionsData, goalsData, habitsData, reflectionsData] = await Promise.all([
            Promise.all([
              api.listSessionsForUser(currentUser.id, 'mentor'),
              api.listSessionsForUser(currentUser.id, 'mentee')
            ]).then(results => results.flat()),
            api.listGoals(currentUser.id),
            api.listHabits(currentUser.id),
            api.listReflections(currentUser.id),
          ])
          
          setSessions(sessionsData)
          setGoals(goalsData)
          setHabits(habitsData)
          setReflections(reflectionsData)
        } else {
          // Load public data
          const sessionsData = await api.listSessions()
          setSessions(sessionsData)
        }

        // Load events
        const eventsData = await api.listEvents()
        setEvents(eventsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentUser?.id])

  const addSession = async (session: Session) => {
    try {
      const created = await api.createSession(session)
      if (created) {
        // Reload sessions from database to ensure we have the latest data with all relationships
        if (currentUser?.id) {
          const [mentorSessions, menteeSessions] = await Promise.all([
            api.listSessionsForUser(currentUser.id, 'mentor'),
            api.listSessionsForUser(currentUser.id, 'mentee')
          ])
          const allSessions = [...mentorSessions, ...menteeSessions]
          setSessions(allSessions)
          
          // Create notification for mentor when session is booked
          if (created.mentorId && currentUser.id !== created.mentorId) {
            // Fetch mentee name for notification
            const mentee = await api.getUser(created.menteeId)
            const notification: Notification = {
              id: `notif-${Date.now()}`,
              userId: created.mentorId,
              title: 'New Session Booked',
              message: `${mentee?.name || 'A mentee'} booked a session with you on ${new Date(created.date).toLocaleDateString()}`,
              type: 'session-booked',
              read: false,
              relatedId: created.id,
              createdAt: new Date().toISOString()
            }
            setNotifications([notification, ...notifications])
          }
        } else {
          // Fallback: just add to local state if no current user
          setSessions([...sessions, created])
        }
      }
    } catch (error) {
      console.error('Error creating session:', error)
      throw error // Re-throw so calling code can handle it
    }
  }

  const updateSession = async (sessionId: string, updates: Partial<Session>) => {
    try {
      const updated = await api.updateSession(sessionId, updates)
      if (updated) {
        setSessions(sessions.map(s => s.id === sessionId ? updated : s))
      }
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  const addEvent = (event: Event) => {
    setEvents([...events, event])
  }

  const addRating = (rating: Rating) => {
    setRatings([...ratings, rating])
  }

  const addGoal = async (goal: Goal) => {
    try {
      const created = await api.createGoal(goal)
      if (created) {
        setGoals([...goals, created])
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const updated = await api.updateGoal(goalId, updates)
      if (updated) {
        setGoals(goals.map(g => g.id === goalId ? updated : g))
      }
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const removeGoal = async (goalId: string) => {
    try {
      // Remove goal from state
      setGoals(goals.filter(g => g.id !== goalId))
      // Also remove associated habits
      setHabits(habits.filter(h => h.goalId !== goalId))
    } catch (error) {
      console.error('Error removing goal from state:', error)
    }
  }

  const addHabit = async (habit: Habit) => {
    try {
      const created = await api.createHabit(habit)
      if (created) {
        setHabits([...habits, created])
      }
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    try {
      // Note: Update habit API call needed
      setHabits(habits.map(h => h.id === habitId ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h))
    } catch (error) {
      console.error('Error updating habit:', error)
    }
  }

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const existing = habitCompletions.find(
      hc => hc.habitId === habitId && hc.date === date
    )

    if (existing) {
      setHabitCompletions(habitCompletions.filter(hc => hc.id !== existing.id))
    } else {
      const newCompletion: HabitCompletion = {
        id: `hc-${Date.now()}`,
        habitId,
        userId: currentUser?.id || '',
        date,
        completed: true,
        createdAt: new Date().toISOString()
      }
      setHabitCompletions([...habitCompletions, newCompletion])
    }
  }

  const addReflection = async (reflection: Reflection) => {
    try {
      const created = await api.createReflection(reflection)
      if (created) {
        setReflections([...reflections, created])
      }
    } catch (error) {
      console.error('Error creating reflection:', error)
    }
  }

  const addReactionToReflection = (reflectionId: string, userId: string, type: 'heart' | 'celebrate' | 'support') => {
    setReflections(reflections.map(r => {
      if (r.id !== reflectionId) return r

      // Check if user already reacted
      const existingReactions = r.reactions || []
      const userReaction = existingReactions.find(reaction => reaction.userId === userId)

      if (userReaction) {
        // If same type, remove the reaction (toggle off)
        if (userReaction.type === type) {
          return {
            ...r,
            reactions: existingReactions.filter(reaction => reaction.userId !== userId)
          }
        } else {
          // Change reaction type
          return {
            ...r,
            reactions: existingReactions.map(reaction =>
              reaction.userId === userId
                ? { ...reaction, type }
                : reaction
            )
          }
        }
      } else {
        // Add new reaction
        const newReaction: ReflectionReaction = {
          id: `reaction-${Date.now()}`,
          reflectionId,
          userId,
          type,
          createdAt: new Date().toISOString()
        }
        return {
          ...r,
          reactions: [...existingReactions, newReaction]
        }
      }
    }))
  }

  const addCommentToReflection = (reflectionId: string, userId: string, text: string) => {
    setReflections(reflections.map(r => {
      if (r.id !== reflectionId) return r

      const newComment: ReflectionComment = {
        id: `comment-${Date.now()}`,
        reflectionId,
        userId,
        text,
        createdAt: new Date().toISOString()
      }

      return {
        ...r,
        comments: [...(r.comments || []), newComment]
      }
    }))
  }

  const addBadge = (badge: Badge) => {
    setBadges([...badges, badge])
  }

  const addSessionFeedback = async (feedback: SessionFeedback) => {
    try {
      // Note: SessionFeedback API calls needed when schema is updated
      setSessionFeedbacks([...sessionFeedbacks, feedback])
      // Mark session as having feedback submitted
      setSessions(sessions.map(s =>
        s.id === feedback.sessionId
          ? { ...s, feedbackSubmitted: true, feedbackSubmittedAt: feedback.createdAt }
          : s
      ))
      // Create notification for mentor
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        userId: feedback.mentorId,
        title: 'New Feedback Received',
        message: `You received ${feedback.rating}-star feedback from a mentee`,
        type: 'feedback-received',
        read: false,
        relatedId: feedback.sessionId,
        createdAt: new Date().toISOString()
      }
      setNotifications([notification, ...notifications])
      // In a real app, you'd update the mentor's rating in the database
    } catch (error) {
      console.error('Error adding session feedback:', error)
    }
  }

  const getMentorFeedbackStats = (mentorId: string): MentorFeedbackStats | null => {
    const mentorFeedbacks = sessionFeedbacks.filter(f => f.mentorId === mentorId)
    if (mentorFeedbacks.length === 0) return null

    const averageRating = mentorFeedbacks.reduce((sum, f) => sum + f.rating, 0) / mentorFeedbacks.length
    const ratingDistribution = {
      1: mentorFeedbacks.filter(f => f.rating === 1).length,
      2: mentorFeedbacks.filter(f => f.rating === 2).length,
      3: mentorFeedbacks.filter(f => f.rating === 3).length,
      4: mentorFeedbacks.filter(f => f.rating === 4).length,
      5: mentorFeedbacks.filter(f => f.rating === 5).length,
    }
    const recentFeedbacks = mentorFeedbacks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    return {
      mentorId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalFeedbacks: mentorFeedbacks.length,
      ratingDistribution,
      recentFeedbacks
    }
  }

  const addMentorSessionNotes = (notes: MentorSessionNotes) => {
    setMentorSessionNotes([...mentorSessionNotes, notes])
  }

  const updateMentorSessionNotes = (noteId: string, updates: Partial<MentorSessionNotes>) => {
    setMentorSessionNotes(mentorSessionNotes.map(n =>
      n.id === noteId
        ? { ...n, ...updates, updatedAt: new Date().toISOString() }
        : n
    ))
  }

  const getMentorSessionNotes = (sessionId: string): MentorSessionNotes | null => {
    return mentorSessionNotes.find(n => n.sessionId === sessionId) || null
  }

  const addNotification = (notification: Notification) => {
    setNotifications([notification, ...notifications])
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const getUnreadNotificationCount = (userId: string): number => {
    return notifications.filter(n => n.userId === userId && !n.read).length
  }

  const getMentorStats = (mentorId: string): MentorStats | null => {
    const mentorSessions = sessions.filter(s => s.mentorId === mentorId)
    const mentorFeedbacks = sessionFeedbacks.filter(f => f.mentorId === mentorId)

    if (mentorSessions.length === 0) return null

    const averageRating = mentorFeedbacks.length > 0
      ? mentorFeedbacks.reduce((sum, f) => sum + f.rating, 0) / mentorFeedbacks.length
      : 0

    // Extract strength keywords from positive feedback
    const strengthKeywords: string[] = []
    mentorFeedbacks.forEach(f => {
      const words = f.whatWentWell.toLowerCase().split(/\s+/)
      strengthKeywords.push(...words.filter(w => w.length > 4))
    })

    // Extract improvement keywords
    const improvementKeywords: string[] = []
    mentorFeedbacks.forEach(f => {
      const words = f.whatToImprove.toLowerCase().split(/\s+/)
      improvementKeywords.push(...words.filter(w => w.length > 4))
    })

    // Calculate sessions per week (last 4 weeks)
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    const recentSessions = mentorSessions.filter(s => new Date(s.date) >= fourWeeksAgo)
    const sessionsPerWeek = recentSessions.length / 4

    const feedbackResponseRate = mentorSessions.length > 0
      ? (mentorFeedbacks.length / mentorSessions.filter(s => s.status === 'completed').length) * 100
      : 0

    return {
      mentorId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalSessions: mentorSessions.length,
      totalFeedbacks: mentorFeedbacks.length,
      strengthKeywords: [...new Set(strengthKeywords)].slice(0, 10),
      improvementKeywords: [...new Set(improvementKeywords)].slice(0, 10),
      sessionsPerWeek: Math.round(sessionsPerWeek * 10) / 10,
      feedbackResponseRate: Math.round(feedbackResponseRate),
      lastUpdated: new Date().toISOString()
    }
  }

  const getMenteeSummaries = (mentorId: string): MenteeSummary[] => {
    const mentorSessions = sessions.filter(s => s.mentorId === mentorId)
    const menteeIds = [...new Set(mentorSessions.map(s => s.menteeId))]

    return menteeIds.map(menteeId => {
      const menteeSessions = mentorSessions.filter(s => s.menteeId === menteeId)
      const completedSessions = menteeSessions.filter(s => s.status === 'completed')
      const menteeFeedbacks = sessionFeedbacks.filter(f => f.menteeId === menteeId && f.mentorId === mentorId)

      const averageRating = menteeFeedbacks.length > 0
        ? menteeFeedbacks.reduce((sum, f) => sum + f.rating, 0) / menteeFeedbacks.length
        : 0

      const lastSession = completedSessions.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]

      const mentee = menteeSessions[0]?.mentee

      return {
        menteeId,
        mentee: mentee || { id: menteeId, username: 'unknown', name: 'Unknown', email: '', role: 'mentee', avatar: '', bio: '', location: '', skills: [], membershipTier: 'standard', verified: false, createdAt: '' },
        totalSessions: menteeSessions.length,
        completedSessions: completedSessions.length,
        averageRating: Math.round(averageRating * 10) / 10,
        lastSessionDate: lastSession?.date
      }
    })
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      loading,
      venues,
      sessions,
      events,
      ratings,
      goals,
      habits,
      habitCompletions,
      reflections,
      badges,
      sessionFeedbacks,
      mentorSessionNotes,
      notifications,
      addSession,
      updateSession,
      addEvent,
      addRating,
      addGoal,
      updateGoal,
      removeGoal,
      addHabit,
      updateHabit,
      toggleHabitCompletion,
      addReflection,
      addReactionToReflection,
      addCommentToReflection,
      addBadge,
      addSessionFeedback,
      getMentorFeedbackStats,
      addMentorSessionNotes,
      updateMentorSessionNotes,
      getMentorSessionNotes,
      addNotification,
      markNotificationAsRead,
      getUnreadNotificationCount,
      getMentorStats,
      getMenteeSummaries
    }}>
      {children}
    </AppContext.Provider>
  )
}



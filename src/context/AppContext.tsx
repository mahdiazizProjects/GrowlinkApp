import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react'
import { User, Venue, Session, Event, Goal, Habit, HabitCompletion, Reflection, Journey, JourneyComment, Badge, SessionFeedback, MentorFeedbackStats, MentorSessionNotes, Notification, MentorStats, MenteeSummary, ReactionType, MentorAvailability, MentorshipRequest } from '../types'
import * as api from '../services/api'
import * as auth from '../services/auth'
import { getSessionDateTime } from '../utils/sessionTime'
import { computeAvailableSlots, DEFAULT_AVAILABILITY_SLOTS } from '../utils/availability'
import { computeBadges } from '../utils/badges'
import { DEMO_VENUES } from '../data/demoData'
import { useToast, errorMessage } from '../components/ui/Toast'

interface AppContextType {
  currentUser: User | null
  /** Member of the ADMIN group: may review applications and manage venues and events. */
  isAdmin: boolean
  setCurrentUser: (user: User | null) => void
  refreshCurrentUser: () => Promise<User | null>
  logout: () => Promise<void>
  /** True while the signed-in user is being resolved or their data is loading. */
  loading: boolean
  /** True until the first check for an existing sign-in has finished. */
  authLoading: boolean
  venues: Venue[]
  sessions: Session[]
  events: Event[]
  goals: Goal[]
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  reflections: Reflection[]
  journeys: Journey[]
  badges: Badge[]
  sessionFeedbacks: SessionFeedback[]
  mentorSessionNotes: MentorSessionNotes[]
  notifications: Notification[]
  savedMentorIds: string[]
  mentorshipRequests: MentorshipRequest[]
  addSession: (session: Session) => Promise<void>
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>
  toggleEventAttendance: (eventId: string) => Promise<void>
  addGoal: (goal: Goal) => Promise<Goal | null>
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>
  removeGoal: (goalId: string) => Promise<boolean>
  addHabit: (habit: Habit) => Promise<Habit | null>
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>
  removeHabit: (habitId: string) => Promise<void>
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>
  addReflection: (reflection: Reflection) => Promise<boolean>
  addJourney: (journey: Journey) => Promise<boolean>
  removeJourney: (journeyId: string) => Promise<void>
  addReactionToJourney: (journeyId: string, userId: string, type: ReactionType) => Promise<void>
  addCommentToJourney: (journeyId: string, userId: string, text: string) => Promise<void>
  addSessionFeedback: (feedback: SessionFeedback) => Promise<boolean>
  getMentorFeedbackStats: (mentorId: string) => MentorFeedbackStats | null
  addMentorSessionNotes: (notes: MentorSessionNotes) => Promise<void>
  updateMentorSessionNotes: (noteId: string, updates: Partial<MentorSessionNotes>) => Promise<void>
  getMentorSessionNotes: (sessionId: string) => MentorSessionNotes | null
  markNotificationAsRead: (notificationId: string) => void
  getUnreadNotificationCount: (userId: string) => number
  getMentorStats: (mentorId: string) => MentorStats | null
  getMenteeSummaries: (mentorId: string) => MenteeSummary[]
  getMentorAvailability: (mentorId: string) => MentorAvailability
  loadMentorAvailability: (mentorId: string) => Promise<void>
  updateMentorAvailability: (mentorId: string, availability: MentorAvailability) => Promise<void>
  getAvailableSlotsForMentor: (mentorId: string, date: string, durationMinutes?: number) => string[]
  toggleSavedMentor: (mentorId: string) => Promise<void>
  requestMentorship: (mentor: User, message: string) => Promise<boolean>
  respondToMentorshipRequest: (requestId: string, status: 'ACCEPTED' | 'DECLINED') => Promise<void>
  /** Re-reads venues and events (after an admin changes them). */
  reloadCatalog: () => Promise<void>
  /** Sends an in-app notification to another user; never throws. */
  notifyUser: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

const isMentorRole = (role?: string) => {
  const r = (role || '').toLowerCase()
  return r === 'mentor' || r === 'both'
}

/** Built-in partner venues, shown until venues are added to the backend's Venue table. */
const FALLBACK_VENUES: Venue[] = DEMO_VENUES.map(v => ({
  id: v.id as string,
  name: v.name as string,
  type: (v.type as string).toLowerCase().replace(/_/g, '-') as Venue['type'],
  address: v.address as string,
  city: v.city as string,
  capacity: v.capacity as number,
  amenities: v.amenities as string[],
  image: v.image as string,
  isPartner: true,
  partnershipTier: (v.partnershipTier as string).toLowerCase() as Venue['partnershipTier']
}))

/** Resolves to `fallback` instead of rejecting, so one failing query cannot blank the whole app. */
async function safe<T>(label: string, promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise
  } catch (error) {
    console.error(`Could not load ${label}:`, error)
    return fallback
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)

  const [venues, setVenues] = useState<Venue[]>(FALLBACK_VENUES)
  const [sessions, setSessions] = useState<Session[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([])
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [sessionFeedbacks, setSessionFeedbacks] = useState<SessionFeedback[]>([])
  const [mentorSessionNotes, setMentorSessionNotes] = useState<MentorSessionNotes[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [mentorAvailabilities, setMentorAvailabilities] = useState<Record<string, MentorAvailability>>({})
  const [savedMentorIds, setSavedMentorIds] = useState<string[]>([])
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([])
  // Other people's bookings with a mentor. Only used to block taken slots, never shown.
  const [mentorBookings, setMentorBookings] = useState<Record<string, Session[]>>({})

  // Latest values for callbacks that must not be re-created on every state change.
  const stateRef = useRef({ currentUser, sessions, journeys, habitCompletions, savedMentorIds })
  stateRef.current = { currentUser, sessions, journeys, habitCompletions, savedMentorIds }

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user)
  }, [])

  const refreshCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const identity = await auth.getIdentity()
      if (!identity) {
        setCurrentUserState(null)
        setIsAdmin(false)
        return null
      }
      setIsAdmin(identity.isAdmin)
      const email = identity.email || ''
      let dbUser = await api.getUser(identity.userId)
      if (!dbUser) {
        dbUser = await api.createUser({
          id: identity.userId,
          email,
          name: identity.name || email.split('@')[0] || 'New User',
          username: email.split('@')[0] || identity.userId,
          role: 'MENTEE'
        })
      }
      setCurrentUserState(dbUser)
      return dbUser
    } catch (error) {
      console.error('Could not restore the signed-in user:', error)
      setCurrentUserState(null)
      return null
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await auth.signOut()
    } finally {
      setIsAdmin(false)
      setCurrentUserState(null)
    }
  }, [])

  // Restore the signed-in user on app load
  useEffect(() => {
    refreshCurrentUser()
  }, [refreshCurrentUser])

  /** Best-effort notification for another user; never blocks or fails the action that triggered it. */
  const notifyUser = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    api.createNotification(n).then(
      created => {
        if (created.userId === stateRef.current.currentUser?.id) setNotifications(prev => [created, ...prev])
      },
      error => console.error('Could not create notification:', error)
    )
  }, [])

  const reloadCatalog = useCallback(async () => {
    const [venuesData, eventsData] = await Promise.all([
      safe('venues', api.listVenues(), [] as Venue[]),
      safe('events', api.listEvents(), [] as Event[])
    ])
    setVenues(venuesData.length > 0 ? venuesData : FALLBACK_VENUES)
    setEvents(eventsData)
  }, [])

  // Public data: venues and events. Reloaded after sign-in/out because the caller's access changes.
  useEffect(() => {
    if (!authLoading) reloadCatalog()
  }, [authLoading, currentUser?.id, reloadCatalog])

  // User-specific data
  const userId = currentUser?.id
  const userIsMentor = isMentorRole(currentUser?.role)
  useEffect(() => {
    let cancelled = false
    const reset = () => {
      setSessions([]); setGoals([]); setHabits([]); setHabitCompletions([]); setReflections([])
      setSessionFeedbacks([]); setMentorSessionNotes([]); setNotifications([]); setSavedMentorIds([])
      setMentorshipRequests([]); setMentorAvailabilities({})
    }

    const loadData = async () => {
      if (!userId) {
        reset()
        setJourneys(await safe('journeys', api.listJourneys(), [] as Journey[]))
        return
      }
      setDataLoading(true)
      try {
        const [sessionsData, goalsData, habitsData, completionsData, reflectionsData, journeysData, feedbackData, notesData, notificationsData, savedData, requestsData] = await Promise.all([
          safe('sessions', api.listAllSessionsForUser(userId), [] as Session[]),
          safe('goals', api.listGoals(userId), [] as Goal[]),
          safe('habits', api.listHabits(userId), [] as Habit[]),
          safe('habit completions', api.listHabitCompletions(userId), [] as HabitCompletion[]),
          safe('reflections', api.listReflections(userId), [] as Reflection[]),
          safe('journeys', api.listJourneys(), [] as Journey[]),
          safe('feedback', api.listSessionFeedbackForUser(userId), [] as SessionFeedback[]),
          userIsMentor ? safe('session notes', api.listMentorSessionNotes(userId), [] as MentorSessionNotes[]) : Promise.resolve([] as MentorSessionNotes[]),
          safe('notifications', api.listNotifications(userId), [] as Notification[]),
          safe('saved mentors', api.listSavedMentorIds(userId), [] as string[]),
          safe('mentorship requests', api.listMentorshipRequests(userId), [] as MentorshipRequest[])
        ])
        if (cancelled) return

        // Pending requests whose time has passed can no longer be approved.
        const expired = sessionsData.filter(s => {
          const dt = getSessionDateTime(s)
          return s.status === 'PENDING' && !!dt && dt.getTime() < Date.now()
        })
        const expiredResults = await Promise.all(expired.map(s =>
          api.updateSession(s.id, { status: 'CANCELLED', cancelledAt: new Date().toISOString(), cancelledBy: 'system' }).catch(() => null)
        ))
        if (cancelled) return
        const expiredMap = new Map(expiredResults.filter((s): s is Session => s != null).map(s => [s.id, s]))
        const finalSessions = sessionsData.map(s => expiredMap.get(s.id) ?? s)

        const feedbackSessionIds = new Set(feedbackData.map(f => f.sessionId))
        setSessions(finalSessions.map(s => feedbackSessionIds.has(s.id) && !s.feedbackSubmitted ? { ...s, feedbackSubmitted: true } : s))
        setGoals(goalsData)
        setHabits(habitsData)
        setHabitCompletions(completionsData)
        setReflections(reflectionsData)
        setJourneys(journeysData)
        setSessionFeedbacks(feedbackData)
        setMentorSessionNotes(notesData)
        setSavedMentorIds(savedData)
        setMentorshipRequests(requestsData)

        // Session requests created before notifications were stored still deserve a bell entry.
        const notified = new Set(notificationsData.map(n => n.relatedId).filter(Boolean))
        const legacyPending: Notification[] = finalSessions
          .filter(s => s.mentorId === userId && s.status === 'PENDING' && !notified.has(s.id))
          .map(s => ({
            id: `notif-pending-${s.id}`,
            userId,
            title: 'New Session Request',
            message: `${s.mentee?.name || 'A mentee'} requested a session. Approve or reject from your dashboard.`,
            type: 'session-booked' as const,
            read: false,
            relatedId: s.id,
            createdAt: new Date().toISOString()
          }))
        setNotifications([...legacyPending, ...notificationsData])

        // One-off data upgrades for records created before the public slot/rating tables existed.
        api.ensureBookedSlots(finalSessions).catch(() => undefined)
        api.ensureMentorRatings(feedbackData.filter(f => f.menteeId === userId)).catch(() => undefined)

        const mentorIds = new Set<string>(finalSessions.map(s => s.mentorId))
        if (userIsMentor) mentorIds.add(userId)
        const availabilities = await Promise.all(
          Array.from(mentorIds).map(id => safe('availability', api.getMentorAvailability(id), null))
        )
        if (cancelled) return
        const avMap: Record<string, MentorAvailability> = {}
        availabilities.forEach(a => { if (a) avMap[a.mentorId] = a })
        setMentorAvailabilities(prev => ({ ...prev, ...avMap }))
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [userId, userIsMentor])

  const addSession = useCallback(async (session: Session) => {
    const created = await api.createSession(session)
    setSessions(prev => [...prev.filter(s => s.id !== created.id), created])
    const me = stateRef.current.currentUser
    if (created.mentorId && me?.id !== created.mentorId) {
      const when = getSessionDateTime(created)
      notifyUser({
        userId: created.mentorId,
        title: 'New Session Request',
        message: `${created.mentee?.name || me?.name || 'A mentee'} requested a session${when ? ` on ${when.toLocaleDateString()} at ${created.time}` : ''}. Approve or decline from your dashboard.`,
        type: 'session-booked',
        relatedId: created.id
      })
    }
  }, [notifyUser])

  const updateSession = useCallback(async (sessionId: string, updates: Partial<Session>) => {
    const before = stateRef.current.sessions.find(s => s.id === sessionId)
    const updated = await api.updateSession(sessionId, updates)
    if (!updated) return
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...updated, feedbackSubmitted: updated.feedbackSubmitted ?? s.feedbackSubmitted } : s))

    // Tell the other participant what changed.
    const me = stateRef.current.currentUser
    if (!me) return
    const otherId = me.id === updated.mentorId ? updated.menteeId : updated.mentorId
    if (!otherId || otherId === me.id) return
    const when = getSessionDateTime(updated)
    const label = when ? ` on ${when.toLocaleDateString()}` : ''
    let message: string | null = null
    if (updates.cancellationRequestedAt) {
      message = `${me.name} asked to cancel your session${label}. Reason: ${updates.cancellationReason || 'not given'}. Please accept or reject it from your dashboard.`
    } else if (updates.status && updates.status !== before?.status) {
      if (updates.status === 'CONFIRMED') message = `${me.name} confirmed your session${label}.`
      else if (updates.status === 'CANCELLED') message = `${me.name} cancelled your session${label}.${updates.cancellationReason ? ` Reason: ${updates.cancellationReason}` : ''}`
      else if (updates.status === 'COMPLETED') message = `Your session${label} was marked complete. Share your feedback from the dashboard.`
    } else if (updates.meetingLink && updates.meetingLink !== before?.meetingLink) {
      message = `${me.name} added the video call link for your session${label}. Open the session from your dashboard to join.`
    } else if (updates.menteeAcceptedCancellation === false) {
      message = `${me.name} did not accept the cancellation, so the session${label} is still on.`
    }
    if (message) notifyUser({ userId: otherId, title: 'Session update', message, type: 'session-update', relatedId: sessionId })
  }, [notifyUser])

  const toggleEventAttendance = useCallback(async (eventId: string) => {
    const me = stateRef.current.currentUser
    if (!me) return
    try {
      const event = await api.listEvents().then(list => list.find(e => e.id === eventId))
      const attending = !!event?.attendees.includes(me.id)
      const updated = await api.setEventAttendance(eventId, me.id, !attending)
      setEvents(prev => prev.map(e => e.id === eventId ? updated : e))
      toast.success(attending ? 'You are no longer attending this event.' : 'You are in! See you there.')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update your attendance.'))
    }
  }, [toast])

  const addGoal = useCallback(async (goal: Goal): Promise<Goal | null> => {
    try {
      const created = await api.createGoal(goal)
      setGoals(prev => [...prev, created])
      return created
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your goal.'))
      return null
    }
  }, [toast])

  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    try {
      const updated = await api.updateGoal(goalId, updates)
      if (updated) setGoals(prev => prev.map(g => g.id === goalId ? updated : g))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update your goal.'))
    }
  }, [toast])

  const removeHabit = useCallback(async (habitId: string) => {
    await api.deleteHabit(habitId)
    setHabits(prev => prev.filter(h => h.id !== habitId))
    setHabitCompletions(prev => prev.filter(c => c.habitId !== habitId))
  }, [])

  const removeGoal = useCallback(async (goalId: string): Promise<boolean> => {
    try {
      const goalHabits = await api.listHabits(stateRef.current.currentUser?.id || '').then(all => all.filter(h => h.goalId === goalId))
      await Promise.all(goalHabits.map(h => api.deleteHabit(h.id)))
      const ok = await api.deleteGoal(goalId)
      if (!ok) throw new Error('The goal could not be deleted.')
      const removedHabitIds = new Set(goalHabits.map(h => h.id))
      setGoals(prev => prev.filter(g => g.id !== goalId))
      setHabits(prev => prev.filter(h => h.goalId !== goalId))
      setHabitCompletions(prev => prev.filter(c => !removedHabitIds.has(c.habitId)))
      return true
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete the goal.'))
      return false
    }
  }, [toast])

  const addHabit = useCallback(async (habit: Habit): Promise<Habit | null> => {
    try {
      const created = await api.createHabit({ ...habit, userId: habit.userId || stateRef.current.currentUser?.id })
      setHabits(prev => [...prev, created])
      return created
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save the habit.'))
      return null
    }
  }, [toast])

  const updateHabit = useCallback(async (habitId: string, updates: Partial<Habit>) => {
    try {
      const updated = await api.updateHabit(habitId, updates)
      if (updated) setHabits(prev => prev.map(h => h.id === habitId ? updated : h))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the habit.'))
    }
  }, [toast])

  const toggleHabitCompletion = useCallback(async (habitId: string, date: string) => {
    const me = stateRef.current.currentUser
    if (!me) return
    const existing = stateRef.current.habitCompletions.find(hc => hc.habitId === habitId && hc.date === date)
    if (existing) {
      // Optimistic removal, restored if the server rejects it.
      setHabitCompletions(prev => prev.filter(hc => hc.id !== existing.id))
      try {
        if (!existing.id.startsWith('pending-')) await api.deleteHabitCompletion(existing.id)
      } catch (error) {
        setHabitCompletions(prev => [...prev, existing])
        toast.error(errorMessage(error, 'Could not update the habit.'))
      }
      return
    }
    const pendingId = `pending-${habitId}-${date}`
    const optimistic: HabitCompletion = { id: pendingId, habitId, userId: me.id, date, completed: true, createdAt: new Date().toISOString() }
    setHabitCompletions(prev => [...prev, optimistic])
    try {
      const created = await api.createHabitCompletion({ habitId, userId: me.id, date })
      setHabitCompletions(prev => prev.map(hc => hc.id === pendingId ? created : hc))
    } catch (error) {
      setHabitCompletions(prev => prev.filter(hc => hc.id !== pendingId))
      toast.error(errorMessage(error, 'Could not record the habit.'))
    }
  }, [toast])

  const addReflection = useCallback(async (reflection: Reflection): Promise<boolean> => {
    try {
      const created = await api.createReflection(reflection)
      setReflections(prev => [...prev, created])
      return true
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your reflection.'))
      return false
    }
  }, [toast])

  const addJourney = useCallback(async (journey: Journey): Promise<boolean> => {
    try {
      const created = await api.createJourney(journey)
      setJourneys(prev => [created, ...prev])
      return true
    } catch (error) {
      toast.error(errorMessage(error, 'Could not share your journey.'))
      return false
    }
  }, [toast])

  const removeJourney = useCallback(async (journeyId: string) => {
    try {
      await api.deleteJourney(journeyId)
      setJourneys(prev => prev.filter(j => j.id !== journeyId))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete the post.'))
    }
  }, [toast])

  const addReactionToJourney = useCallback(async (journeyId: string, reactingUserId: string, type: ReactionType) => {
    try {
      const journey = stateRef.current.journeys.find(j => j.id === journeyId)
      if (!journey) return
      const wanted = type.toUpperCase()
      const userReaction = (journey.reactions || []).find(r => r.userId === reactingUserId)

      if (userReaction?.id) await api.deleteJourneyReaction(userReaction.id)
      // Same type again toggles the reaction off; a different type replaces it.
      if (!userReaction || userReaction.type.toUpperCase() !== wanted) {
        await api.createJourneyReaction({ journeyId, userId: reactingUserId, type })
      }

      // Refetch so reactions from other people are included.
      const updatedJourney = await api.getJourney(journeyId)
      if (updatedJourney) setJourneys(prev => prev.map(j => j.id === journeyId ? updatedJourney : j))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your reaction.'))
    }
  }, [toast])

  const addCommentToJourney = useCallback(async (journeyId: string, commentingUserId: string, text: string) => {
    try {
      const newComment = await api.createJourneyComment({ journeyId, userId: commentingUserId, text })
      if (newComment) {
        setJourneys(prev => prev.map(j =>
          j.id === journeyId
            ? { ...j, comments: [...(j.comments || []), newComment as JourneyComment] }
            : j
        ))
      }
    } catch (error) {
      toast.error(errorMessage(error, 'Could not post your comment.'))
    }
  }, [toast])

  const addSessionFeedback = useCallback(async (feedback: SessionFeedback): Promise<boolean> => {
    try {
      const created = await api.createSessionFeedback(feedback)
      setSessionFeedbacks(prev => [...prev, created])
      setSessions(prev => prev.map(s =>
        s.id === created.sessionId ? { ...s, feedbackSubmitted: true, feedbackSubmittedAt: created.createdAt } : s
      ))
      // Not critical: the feedback record itself is the source of truth.
      api.updateSession(created.sessionId, { feedbackSubmitted: true, feedbackSubmittedAt: created.createdAt })
        .catch(error => console.error('Could not flag session feedback:', error))
      notifyUser({
        userId: created.mentorId,
        title: 'New Feedback Received',
        message: `You received ${created.rating}-star feedback from a mentee.`,
        type: 'feedback-received',
        relatedId: created.sessionId
      })
      toast.success('Thanks! Your feedback was sent.')
      return true
    } catch (error) {
      toast.error(errorMessage(error, 'Could not submit your feedback.'))
      return false
    }
  }, [notifyUser, toast])

  const getMentorFeedbackStats = useCallback((mentorId: string): MentorFeedbackStats | null => {
    const mentorFeedbacks = sessionFeedbacks.filter(f => f.mentorId === mentorId)
    if (mentorFeedbacks.length === 0) return null

    const averageRating = mentorFeedbacks.reduce((sum, f) => sum + f.rating, 0) / mentorFeedbacks.length
    const count = (rating: number) => mentorFeedbacks.filter(f => f.rating === rating).length
    const recentFeedbacks = [...mentorFeedbacks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    return {
      mentorId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalFeedbacks: mentorFeedbacks.length,
      ratingDistribution: { 1: count(1), 2: count(2), 3: count(3), 4: count(4), 5: count(5) },
      recentFeedbacks
    }
  }, [sessionFeedbacks])

  const addMentorSessionNotes = useCallback(async (notes: MentorSessionNotes) => {
    try {
      const created = await api.createMentorSessionNotes(notes)
      setMentorSessionNotes(prev => [...prev.filter(n => n.sessionId !== created.sessionId), created])
      toast.success('Session notes saved.')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your notes.'))
    }
  }, [toast])

  const updateMentorSessionNotes = useCallback(async (noteId: string, updates: Partial<MentorSessionNotes>) => {
    try {
      const updated = await api.updateMentorSessionNotes(noteId, updates)
      setMentorSessionNotes(prev => prev.map(n => n.id === noteId ? updated : n))
      toast.success('Session notes saved.')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your notes.'))
    }
  }, [toast])

  const getMentorSessionNotes = useCallback((sessionId: string): MentorSessionNotes | null => {
    return mentorSessionNotes.find(n => n.sessionId === sessionId) || null
  }, [mentorSessionNotes])

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
    // Legacy in-memory entries have no stored record.
    if (!notificationId.startsWith('notif-pending-')) {
      api.markNotificationRead(notificationId).catch(error => console.error('Could not mark notification read:', error))
    }
  }, [])

  const getUnreadNotificationCount = useCallback((forUserId: string): number => {
    return notifications.filter(n => n.userId === forUserId && !n.read).length
  }, [notifications])

  const getMentorStats = useCallback((mentorId: string): MentorStats | null => {
    const mentorSessions = sessions.filter(s => s.mentorId === mentorId)
    const mentorFeedbacks = sessionFeedbacks.filter(f => f.mentorId === mentorId)

    if (mentorSessions.length === 0) return null

    const averageRating = mentorFeedbacks.length > 0
      ? mentorFeedbacks.reduce((sum, f) => sum + f.rating, 0) / mentorFeedbacks.length
      : 0

    const keywords = (texts: string[]) => {
      const words = texts.flatMap(t => (t || '').toLowerCase().split(/[^a-z0-9']+/)).filter(w => w.length > 4)
      return [...new Set(words)].slice(0, 10)
    }

    // Sessions per week over the last 4 weeks
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    const recentSessions = mentorSessions.filter(s => {
      const dt = getSessionDateTime(s)
      return !!dt && dt >= fourWeeksAgo && dt.getTime() <= Date.now() && s.status !== 'CANCELLED'
    })

    const completedCount = mentorSessions.filter(s => s.status === 'COMPLETED').length
    const feedbackResponseRate = completedCount > 0
      ? Math.min(100, (mentorFeedbacks.length / completedCount) * 100)
      : 0

    return {
      mentorId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalSessions: mentorSessions.length,
      totalFeedbacks: mentorFeedbacks.length,
      strengthKeywords: keywords(mentorFeedbacks.map(f => f.whatWentWell)),
      improvementKeywords: keywords(mentorFeedbacks.map(f => f.whatToImprove)),
      sessionsPerWeek: Math.round((recentSessions.length / 4) * 10) / 10,
      feedbackResponseRate: Math.round(feedbackResponseRate),
      lastUpdated: new Date().toISOString()
    }
  }, [sessions, sessionFeedbacks])

  const getMentorAvailability = useCallback((mentorId: string): MentorAvailability => {
    const stored = mentorAvailabilities[mentorId]
    if (stored && stored.slots.length > 0) {
      return stored
    }
    return {
      mentorId,
      slots: DEFAULT_AVAILABILITY_SLOTS,
      updatedAt: undefined
    }
  }, [mentorAvailabilities])

  /** Loads a mentor's timetable and existing bookings so slot suggestions are accurate for any mentor. */
  const loadMentorAvailability = useCallback(async (mentorId: string) => {
    const [availability, mentorSessions] = await Promise.all([
      safe('availability', api.getMentorAvailability(mentorId), null),
      // Public slot markers: other people's bookings without any of their details.
      safe('booked slots', api.listBookedSlotsForMentor(mentorId), [] as Awaited<ReturnType<typeof api.listBookedSlotsForMentor>>)
    ])
    if (availability) setMentorAvailabilities(prev => ({ ...prev, [mentorId]: availability }))
    setMentorBookings(prev => ({ ...prev, [mentorId]: mentorSessions as Session[] }))
  }, [])

  const updateMentorAvailability = useCallback(async (mentorId: string, availability: MentorAvailability) => {
    const updated = { ...availability, mentorId, updatedAt: new Date().toISOString() }
    const saved = await api.updateMentorAvailability(mentorId, updated)
    setMentorAvailabilities(prev => ({ ...prev, [mentorId]: saved }))
  }, [])

  const getAvailableSlotsForMentor = useCallback((mentorId: string, dateStr: string, durationMinutes = 60): string[] => {
    // Own sessions are the freshest copy; the rest come from the mentor's full booking list.
    const own = sessions.filter(s => s.mentorId === mentorId)
    const ownIds = new Set(own.map(s => s.id))
    const others = (mentorBookings[mentorId] || []).filter(s => !ownIds.has(s.id))
    return computeAvailableSlots(getMentorAvailability(mentorId), [...own, ...others], dateStr, durationMinutes)
  }, [getMentorAvailability, sessions, mentorBookings])

  const getMenteeSummaries = useCallback((mentorId: string): MenteeSummary[] => {
    const mentorSessions = sessions.filter(s => s.mentorId === mentorId)
    const menteeIds = [...new Set(mentorSessions.map(s => s.menteeId))]

    return menteeIds.map(menteeId => {
      const menteeSessions = mentorSessions.filter(s => s.menteeId === menteeId)
      const completedSessions = menteeSessions.filter(s => s.status === 'COMPLETED')
      const menteeFeedbacks = sessionFeedbacks.filter(f => f.menteeId === menteeId && f.mentorId === mentorId)

      const averageRating = menteeFeedbacks.length > 0
        ? menteeFeedbacks.reduce((sum, f) => sum + f.rating, 0) / menteeFeedbacks.length
        : 0

      const lastSession = [...completedSessions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]

      const mentee = menteeSessions.find(s => s.mentee)?.mentee

      return {
        menteeId,
        mentee: mentee || { id: menteeId, username: 'unknown', name: 'Unknown', email: '', role: 'mentee', avatar: '', bio: '', location: '', skills: [], membershipTier: 'standard', verified: false, createdAt: '' },
        totalSessions: menteeSessions.length,
        completedSessions: completedSessions.length,
        averageRating: Math.round(averageRating * 10) / 10,
        lastSessionDate: lastSession?.date
      }
    })
  }, [sessions, sessionFeedbacks])

  const toggleSavedMentor = useCallback(async (mentorId: string) => {
    const me = stateRef.current.currentUser
    if (!me) {
      toast.info('Sign in to save mentors.')
      return
    }
    const wasSaved = stateRef.current.savedMentorIds.includes(mentorId)
    setSavedMentorIds(prev => wasSaved ? prev.filter(id => id !== mentorId) : [...prev, mentorId])
    try {
      await api.setMentorSaved(me.id, mentorId, !wasSaved)
    } catch (error) {
      setSavedMentorIds(prev => wasSaved ? [...prev, mentorId] : prev.filter(id => id !== mentorId))
      toast.error(errorMessage(error, 'Could not update your saved mentors.'))
    }
  }, [toast])

  const requestMentorship = useCallback(async (mentor: User, message: string): Promise<boolean> => {
    const me = stateRef.current.currentUser
    if (!me) {
      toast.info('Sign in to request mentorship.')
      return false
    }
    try {
      const request = await api.createMentorshipRequest({ menteeId: me.id, mentorId: mentor.id, message })
      setMentorshipRequests(prev => [request, ...prev])
      notifyUser({
        userId: mentor.id,
        title: 'New mentorship request',
        message: `${me.name} would like you to mentor them: "${message.slice(0, 200)}"`,
        type: 'mentorship-request',
        relatedId: request.id
      })
      toast.success(`Request sent to ${mentor.name}.`)
      return true
    } catch (error) {
      toast.error(errorMessage(error, 'Could not send your request.'))
      return false
    }
  }, [notifyUser, toast])

  const respondToMentorshipRequest = useCallback(async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    const me = stateRef.current.currentUser
    try {
      const updated = await api.updateMentorshipRequest(requestId, status)
      setMentorshipRequests(prev => prev.map(r => r.id === requestId ? updated : r))
      notifyUser({
        userId: updated.menteeId,
        title: status === 'ACCEPTED' ? 'Mentorship request accepted' : 'Mentorship request declined',
        message: status === 'ACCEPTED'
          ? `${me?.name || 'Your mentor'} accepted your mentorship request. Book a session to get started.`
          : `${me?.name || 'The mentor'} is not able to take on your request right now.`,
        type: 'mentorship-request',
        relatedId: requestId
      })
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the request.'))
    }
  }, [notifyUser, toast])

  const badges = useMemo(
    () => (userId ? computeBadges(userId, { completions: habitCompletions, reflections, journeys }) : []),
    [userId, habitCompletions, reflections, journeys]
  )

  const loading = authLoading || dataLoading

  return (
    <AppContext.Provider value={{
      currentUser,
      isAdmin,
      setCurrentUser,
      refreshCurrentUser,
      logout,
      loading,
      authLoading,
      venues,
      sessions,
      events,
      goals,
      habits,
      habitCompletions,
      reflections,
      journeys,
      badges,
      sessionFeedbacks,
      mentorSessionNotes,
      notifications,
      savedMentorIds,
      mentorshipRequests,
      addSession,
      updateSession,
      toggleEventAttendance,
      addGoal,
      updateGoal,
      removeGoal,
      addHabit,
      updateHabit,
      removeHabit,
      toggleHabitCompletion,
      addReflection,
      addJourney,
      removeJourney,
      addReactionToJourney,
      addCommentToJourney,
      addSessionFeedback,
      getMentorFeedbackStats,
      addMentorSessionNotes,
      updateMentorSessionNotes,
      getMentorSessionNotes,
      markNotificationAsRead,
      getUnreadNotificationCount,
      getMentorStats,
      getMenteeSummaries,
      getMentorAvailability,
      loadMentorAvailability,
      updateMentorAvailability,
      getAvailableSlotsForMentor,
      toggleSavedMentor,
      requestMentorship,
      respondToMentorshipRequest,
      reloadCatalog,
      notifyUser
    }}>
      {children}
    </AppContext.Provider>
  )
}

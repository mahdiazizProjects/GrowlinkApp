import { createContext, useContext, useState, ReactNode } from 'react'
import { User, Venue, Session, Event, Rating, Goal, Habit, HabitCompletion, Reflection, Badge } from '../types'

interface AppContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  venues: Venue[]
  sessions: Session[]
  events: Event[]
  ratings: Rating[]
  goals: Goal[]
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  reflections: Reflection[]
  badges: Badge[]
  addSession: (session: Session) => void
  addEvent: (event: Event) => void
  addRating: (rating: Rating) => void
  addGoal: (goal: Goal) => void
  updateGoal: (goalId: string, updates: Partial<Goal>) => void
  addHabit: (habit: Habit) => void
  updateHabit: (habitId: string, updates: Partial<Habit>) => void
  toggleHabitCompletion: (habitId: string, date: string) => void
  addReflection: (reflection: Reflection) => void
  addBadge: (badge: Badge) => void
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
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  // Mock data - in real app, this would come from API
  const [venues] = useState<Venue[]>([
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

  const [sessions, setSessions] = useState<Session[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([])
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [badges, setBadges] = useState<Badge[]>([])

  const addSession = (session: Session) => {
    setSessions([...sessions, session])
  }

  const addEvent = (event: Event) => {
    setEvents([...events, event])
  }

  const addRating = (rating: Rating) => {
    setRatings([...ratings, rating])
  }

  const addGoal = (goal: Goal) => {
    setGoals([...goals, goal])
  }

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
  }

  const addHabit = (habit: Habit) => {
    setHabits([...habits, habit])
  }

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits(habits.map(h => h.id === habitId ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h))
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

  const addReflection = (reflection: Reflection) => {
    setReflections([...reflections, reflection])
  }

  const addBadge = (badge: Badge) => {
    setBadges([...badges, badge])
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      venues,
      sessions,
      events,
      ratings,
      goals,
      habits,
      habitCompletions,
      reflections,
      badges,
      addSession,
      addEvent,
      addRating,
      addGoal,
      updateGoal,
      addHabit,
      updateHabit,
      toggleHabitCompletion,
      addReflection,
      addBadge
    }}>
      {children}
    </AppContext.Provider>
  )
}



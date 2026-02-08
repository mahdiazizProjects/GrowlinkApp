// API service module
// Uses in-memory store populated from mock data when no backend is configured.
// To use server data: put JSON in public/server-data.json or call loadServerData(url).

import { User, Session, Goal, Habit, Reflection, Journey, Event, ActionPlan, ActionItem, MentorAvailability } from '../types'
import { mockMentors, mockMentees, mockEvents } from '../data/mockData'

export interface CreateUserParams {
  id?: string;
  email: string;
  name: string;
  username: string;
  role: 'MENTOR' | 'MENTEE' | 'BOTH' | 'mentor' | 'mentee';
  [key: string]: any;
}

// In-memory store (used when no real backend)
const store = {
  users: [...mockMentors, ...mockMentees] as User[],
  sessions: [] as Session[],
  goals: [] as Goal[],
  habits: [] as Habit[],
  reflections: [] as Reflection[],
  journeys: [] as Journey[],
  events: [...mockEvents] as Event[],
  mentorAvailabilities: {} as Record<string, MentorAvailability>
}

function attachSessionUsers(s: Session): Session {
  const mentor = store.users.find(u => u.id === s.mentorId)
  const mentee = store.users.find(u => u.id === s.menteeId)
  return { ...s, mentor, mentee }
}

export async function getUser(userId: string): Promise<User | null> {
  return store.users.find(u => u.id === userId) ?? null
}

export async function createUser(params: CreateUserParams | Partial<User>): Promise<User> {
  const p = params as Record<string, unknown>
  const id = (p.id as string) || `user-${Date.now()}`
  if (store.users.some(u => u.id === id)) {
    return store.users.find(u => u.id === id)!
  }
  const user: User = {
    id,
    email: (p.email as string) || '',
    name: (p.name as string) || '',
    username: (p.username as string) || (p.email as string)?.toString().split('@')[0] || 'user',
    role: (p.role as User['role']) || 'MENTEE',
    createdAt: (p.createdAt as string) || new Date().toISOString()
  }
  if (p.avatar != null) user.avatar = p.avatar as string
  if (p.bio != null) user.bio = p.bio as string
  if (p.location != null) user.location = p.location as string
  if (p.skills != null) user.skills = p.skills as string[]
  if (p.interests != null) user.interests = p.interests as string[]
  store.users.push(user)
  return user
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  const i = store.users.findIndex(u => u.id === userId)
  if (i === -1) return null
  store.users[i] = { ...store.users[i], ...updates }
  return store.users[i]
}

export async function listUsers(): Promise<User[]> {
  return [...store.users]
}

export async function listMentors(): Promise<User[]> {
  return store.users.filter(u => {
    const r = (u.role || '').toLowerCase()
    return r === 'mentor' || r === 'both'
  })
}

export async function createSession(session: Session): Promise<Session> {
  const id = (session as { id?: string }).id || `session-${Date.now()}`
  const date = typeof session.date === 'string' ? session.date : new Date(session.date).toISOString()
  const time = (session as { time?: string }).time ?? date.slice(11, 16)
  const s: Session = {
    ...session,
    id,
    date,
    time,
    duration: session.duration ?? 60
  }
  store.sessions.push(s)
  return attachSessionUsers(s)
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
  const i = store.sessions.findIndex(s => s.id === sessionId)
  if (i === -1) return null
  store.sessions[i] = { ...store.sessions[i], ...updates }
  return attachSessionUsers(store.sessions[i])
}

export async function listSessions(): Promise<Session[]> {
  return store.sessions.map(attachSessionUsers)
}

export async function listSessionsForUser(userId: string, role: 'mentor' | 'mentee'): Promise<Session[]> {
  const list = store.sessions.filter(s =>
    role === 'mentor' ? s.mentorId === userId : s.menteeId === userId
  )
  return list.map(attachSessionUsers)
}

export async function getMentorAvailability(mentorId: string): Promise<MentorAvailability | null> {
  return store.mentorAvailabilities[mentorId] ?? null
}

export async function updateMentorAvailability(mentorId: string, availability: MentorAvailability): Promise<MentorAvailability> {
  const updated = { ...availability, mentorId, updatedAt: new Date().toISOString() }
  store.mentorAvailabilities[mentorId] = updated
  return updated
}

export async function createGoal(goal: Goal): Promise<Goal> {
  const g = { ...goal, id: goal.id || `goal-${Date.now()}` }
  store.goals.push(g)
  return g
}

export async function updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
  const i = store.goals.findIndex(g => g.id === goalId)
  if (i === -1) return null
  store.goals[i] = { ...store.goals[i], ...updates }
  return store.goals[i]
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  const i = store.goals.findIndex(g => g.id === goalId)
  if (i === -1) return false
  store.goals.splice(i, 1)
  return true
}

export async function listGoals(userId: string): Promise<Goal[]> {
  return store.goals.filter(g => g.userId === userId)
}

export async function createHabit(habit: Habit): Promise<Habit> {
  const h = { ...habit, id: habit.id || `habit-${Date.now()}` }
  store.habits.push(h)
  return h
}

export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit | null> {
  const i = store.habits.findIndex(h => h.id === habitId)
  if (i === -1) return null
  store.habits[i] = { ...store.habits[i], ...updates }
  return store.habits[i]
}

export async function listHabits(userId: string): Promise<Habit[]> {
  return store.habits.filter(h => {
    const goal = store.goals.find(g => g.id === h.goalId)
    return goal?.userId === userId
  })
}

export async function createReflection(reflection: Reflection): Promise<Reflection> {
  const r = { ...reflection, id: reflection.id || `reflection-${Date.now()}` }
  store.reflections.push(r)
  return r
}

export async function listReflections(userId: string): Promise<Reflection[]> {
  return store.reflections.filter(r => r.userId === userId)
}

export async function createJourney(journey: Journey): Promise<Journey> {
  const j = { ...journey, id: journey.id || `journey-${Date.now()}` }
  store.journeys.push(j)
  return j
}

export async function getJourney(journeyId: string): Promise<Journey | null> {
  return store.journeys.find(j => j.id === journeyId) ?? null
}

export async function listJourneys(): Promise<Journey[]> {
  return [...store.journeys]
}

export async function createJourneyReaction(_params: { journeyId: string; userId: string; type: string }): Promise<any> {
  // In-memory: would need to update store.journeys[].reactions
  return null;
}

export async function deleteJourneyReaction(_reactionId: string): Promise<boolean> {
  return false;
}

export async function createJourneyComment(_params: { journeyId: string; userId: string; text: string }): Promise<any> {
  return null;
}

export async function listEvents(): Promise<Event[]> {
  return [...store.events]
}

/**
 * Load server JSON into the in-memory store.
 * Put your server export in public/server-data.json (see server-data.example.json for shape).
 * Optional: only used when file exists; app works with mock data otherwise.
 */
export async function loadServerData(url: string): Promise<void> {
  try {
    const res = await fetch(url)
    if (!res.ok) return
    const data = await res.json()
    if (Array.isArray(data.users)) store.users = data.users
    if (Array.isArray(data.sessions)) store.sessions = data.sessions
    if (Array.isArray(data.goals)) store.goals = data.goals
    if (Array.isArray(data.reflections)) store.reflections = data.reflections
    if (Array.isArray(data.journeys)) store.journeys = data.journeys
    if (Array.isArray(data.events)) store.events = data.events
    if (data.mentorAvailabilities && typeof data.mentorAvailabilities === 'object') {
      store.mentorAvailabilities = { ...store.mentorAvailabilities, ...data.mentorAvailabilities }
    }
  } catch (e) {
    console.warn('loadServerData failed:', e)
  }
}

export async function createActionPlan(params: any): Promise<ActionPlan> {
  // TODO: Implement actual API call
  return params;
}

export async function listActionPlans(_creatorId: string, _assigneeId: string): Promise<ActionPlan[]> {
  // TODO: Implement actual API call
  return [];
}

export async function deleteActionPlan(_planId: string): Promise<boolean> {
  // TODO: Implement actual API call
  return false;
}

export async function createActionItem(params: any): Promise<ActionItem> {
  // TODO: Implement actual API call
  return params;
}

export async function updateActionItem(_itemId: string, _updates: any): Promise<ActionItem | null> {
  // TODO: Implement actual API call
  return null;
}

export async function listActionItems(_planId: string): Promise<ActionItem[]> {
  // TODO: Implement actual API call
  return [];
}

export async function deleteActionItem(_itemId: string): Promise<boolean> {
  // TODO: Implement actual API call
  return false;
}

// API service module – uses Amplify Data (AppSync) from your backend. No mock data.

import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import type {
  User,
  Session,
  Goal,
  Habit,
  Reflection,
  Journey,
  Event,
  ActionPlan,
  ActionItem,
  MentorAvailability
} from '../types'

export interface CreateUserParams {
  id?: string
  email: string
  name: string
  username: string
  role: 'MENTOR' | 'MENTEE' | 'BOTH' | 'mentor' | 'mentee'
  [key: string]: unknown
}

let _client: ReturnType<typeof generateClient<Schema>> | null = null
function getClient() {
  if (!_client) _client = generateClient<Schema>()
  return _client
}

const mentorAvailabilityCache: Record<string, MentorAvailability> = {}

function toAppUser(r: Record<string, unknown> | null): User | null {
  if (!r || !r.id) return null
  const role = (r.role as string) || 'MENTEE'
  return {
    id: r.id as string,
    username: (r.username as string) || '',
    email: (r.email as string) || '',
    name: (r.name as string) || '',
    title: r.title as string | undefined,
    role: role as User['role'],
    avatar: r.avatar as string | undefined,
    bio: r.bio as string | undefined,
    location: r.location as string | undefined,
    skills: r.skills as string[] | undefined,
    interests: r.interests as string[] | undefined,
    createdAt: (r.createdAt as string) || new Date().toISOString()
  }
}

function toLocalISOString(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${mo}-${da}T${h}:${mi}:${s}`
}

function toAppSession(r: Record<string, unknown> | null, mentor?: User | null, mentee?: User | null): Session | null {
  if (!r || !r.id) return null
  const rawDateStr = (r.date as string) || ''
  const isFullIso = rawDateStr.length >= 16 || rawDateStr.includes('T')
  const localDateStr = isFullIso ? toLocalISOString(new Date(rawDateStr)) : rawDateStr
  const time = isFullIso ? localDateStr.slice(11, 16) : ''
  const status = ((r.status as string) ?? 'PENDING').toUpperCase() as Session['status']
  const notes = r.notes as string | undefined
  const meetingLink = r.meetingLink as string | undefined
  return {
    id: r.id as string,
    mentorId: r.mentorId as string,
    menteeId: r.menteeId as string,
    mentor: mentor ?? undefined,
    mentee: mentee ?? undefined,
    type: meetingLink ? 'virtual' : 'in-person',
    date: localDateStr,
    time,
    duration: (r.duration as number) ?? 60,
    status,
    notes,
    topic: notes || undefined,
    meetingLink,
    ...(r.cancelledAt != null && { cancelledAt: r.cancelledAt as string }),
    ...(r.cancelledBy != null && { cancelledBy: r.cancelledBy as Session['cancelledBy'] })
  }
}

function toAppGoal(r: Record<string, unknown> | null): Goal | null {
  if (!r || !r.id) return null
  return {
    id: r.id as string,
    userId: r.userId as string,
    title: r.title as string,
    description: r.description as string | undefined,
    category: r.category as string | undefined,
    progress: r.progress as number | undefined,
    dueDate: r.dueDate as string | undefined,
    status: (r.status as Goal['status']) ?? 'active'
  }
}

function toAppReflection(r: Record<string, unknown> | null): Reflection | null {
  if (!r || !r.id) return null
  return {
    id: r.id as string,
    userId: r.userId as string,
    date: r.date as string,
    mood: (r.mood as Reflection['mood']) ?? 'NEUTRAL',
    moodScore: r.moodScore as number | undefined,
    text: r.text as string | undefined,
    isShared: !!r.sharedWithMentorId,
    sharedWithMentorId: r.sharedWithMentorId as string | undefined,
    mentorFeedback: r.mentorFeedback as string | undefined,
    createdAt: (r.createdAt as string) || new Date().toISOString(),
    updatedAt: r.updatedAt as string | undefined
  }
}

function toAppJourney(
  r: Record<string, unknown> | null,
  reactions?: Journey['reactions'],
  comments?: Journey['comments']
): Journey | null {
  if (!r || !r.id) return null
  return {
    id: r.id as string,
    userId: r.userId as string,
    goalId: r.goalId as string | undefined,
    mood: r.mood as Journey['mood'] | undefined,
    text: (r.text as string) || '',
    visibility: ((r.visibility as string) ?? 'everyone').toLowerCase() as Journey['visibility'],
    selectedMentorIds: r.selectedMentorIds as string[] | undefined,
    tags: r.tags as string[] | undefined,
    reactions: reactions ?? [],
    comments: comments ?? [],
    createdAt: (r.createdAt as string) || new Date().toISOString(),
    updatedAt: r.updatedAt as string | undefined
  }
}

export async function getUser(userId: string): Promise<User | null> {
  const { data } = await getClient().models.User.get({ id: userId })
  return toAppUser(data as Record<string, unknown> | null)
}

export async function createUser(params: CreateUserParams | Partial<User>): Promise<User> {
  const p = params as Record<string, unknown>
  const id = (p.id as string) || crypto.randomUUID?.() || `user-${Date.now()}`
  const role = ((p.role as string) || 'MENTEE').toUpperCase()
  const validRole = role === 'MENTOR' || role === 'MENTEE' || role === 'BOTH' ? role : 'MENTEE'
  const { data, errors } = await getClient().models.User.create({
    id,
    username: (p.username as string) || (p.email as string)?.toString().split('@')[0] || 'user',
    email: (p.email as string) || '',
    name: (p.name as string) || '',
    title: p.title as string | undefined,
    role: validRole as 'MENTOR' | 'MENTEE' | 'BOTH',
    bio: p.bio as string | undefined,
    avatar: p.avatar as string | undefined,
    location: p.location as string | undefined,
    skills: p.skills as string[] | undefined,
    interests: p.interests as string[] | undefined
  })
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '))
  return toAppUser(data as Record<string, unknown>)!
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  const u = updates as Record<string, unknown>
  const { data, errors } = await getClient().models.User.update({
    id: userId,
    ...(u.username != null && { username: u.username as string }),
    ...(u.email != null && { email: u.email as string }),
    ...(u.name != null && { name: u.name as string }),
    ...(u.title !== undefined && { title: u.title as string }),
    ...(u.role != null && { role: (u.role as string).toUpperCase() as 'MENTOR' | 'MENTEE' | 'BOTH' }),
    ...(u.bio !== undefined && { bio: u.bio as string }),
    ...(u.avatar !== undefined && { avatar: u.avatar as string }),
    ...(u.location !== undefined && { location: u.location as string }),
    ...(u.skills !== undefined && { skills: u.skills as string[] }),
    ...(u.interests !== undefined && { interests: u.interests as string[] })
  })
  if (errors?.length) return null
  return toAppUser(data as Record<string, unknown>)
}

export async function listUsers(): Promise<User[]> {
  const { data } = await getClient().models.User.list()
  return (data || []).map(d => toAppUser(d as Record<string, unknown>)).filter((u): u is User => u != null)
}

export async function listMentors(): Promise<User[]> {
  const all = await listUsers()
  return all.filter(u => {
    const r = (u.role || '').toString().toLowerCase()
    return r === 'mentor' || r === 'both'
  })
}

export async function createSession(session: Session): Promise<Session> {
  const dateStr = typeof session.date === 'string' ? session.date : new Date(session.date).toISOString()
  const { data, errors } = await getClient().models.Session.create({
    mentorId: session.mentorId,
    menteeId: session.menteeId,
    date: dateStr,
    duration: session.duration ?? 60,
    status: (session.status?.toUpperCase() as 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') || 'PENDING',
    notes: session.notes ?? session.topic ?? undefined,
    meetingLink: session.meetingLink
  })
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '))
  const [mentor, mentee] = await Promise.all([getUser(session.mentorId), getUser(session.menteeId)])
  return toAppSession(data as Record<string, unknown>, mentor, mentee)!
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
  const u = updates as Record<string, unknown>
  const payload: { id: string; status?: string; notes?: string; meetingLink?: string } = { id: sessionId }
  if (u.status != null) payload.status = (u.status as string).toUpperCase()
  if (u.notes !== undefined) payload.notes = u.notes as string
  if (u.meetingLink !== undefined) payload.meetingLink = u.meetingLink as string
  const statusPayload = payload.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | undefined
  const { data, errors } = await getClient().models.Session.update({
    id: sessionId,
    ...(statusPayload && { status: statusPayload }),
    ...(payload.notes !== undefined && { notes: payload.notes }),
    ...(payload.meetingLink !== undefined && { meetingLink: payload.meetingLink })
  })
  if (errors?.length) {
    const msg = errors.map((e: { message?: string }) => e.message || String(e)).join(', ')
    throw new Error(msg || 'Failed to update session')
  }
  const d = data as Record<string, unknown>
  const [mentor, mentee] = await Promise.all([getUser(d.mentorId as string), getUser(d.menteeId as string)])
  const session = toAppSession(d, mentor, mentee)
  if (!session) return null
  const merged = { ...session, ...updates }
  if (merged.status) merged.status = (merged.status as string).toUpperCase() as Session['status']
  return merged
}

export async function listSessions(): Promise<Session[]> {
  const { data } = await getClient().models.Session.list()
  const users = new Map<string, User>()
  const load = async (id: string) => { if (!users.has(id)) users.set(id, (await getUser(id))!) }
  for (const s of data || []) {
    const r = s as Record<string, unknown>
    await load(r.mentorId as string)
    await load(r.menteeId as string)
  }
  return (data || []).map(s => toAppSession(
    s as Record<string, unknown>,
    users.get((s as Record<string, unknown>).mentorId as string),
    users.get((s as Record<string, unknown>).menteeId as string)
  )).filter((x): x is Session => x != null)
}

export async function listSessionsForUser(userId: string, role: 'mentor' | 'mentee'): Promise<Session[]> {
  const filterField = role === 'mentor' ? 'mentorId' : 'menteeId'
  const { data } = await getClient().models.Session.list({ filter: { [filterField]: { eq: userId } } })
  const users = new Map<string, User>()
  const load = async (id: string) => { if (!users.has(id)) users.set(id, (await getUser(id))!) }
  for (const s of data || []) {
    const r = s as Record<string, unknown>
    await load(r.mentorId as string)
    await load(r.menteeId as string)
  }
  return (data || []).map(s => toAppSession(
    s as Record<string, unknown>,
    users.get((s as Record<string, unknown>).mentorId as string),
    users.get((s as Record<string, unknown>).menteeId as string)
  )).filter((x): x is Session => x != null)
}

export async function getMentorAvailability(mentorId: string): Promise<MentorAvailability | null> {
  if (mentorAvailabilityCache[mentorId]) return mentorAvailabilityCache[mentorId]
  const { data } = await getClient().models.MentorAvailability.list({ filter: { mentorId: { eq: mentorId } } })
  const record = (data || [])[0] as Record<string, unknown> | undefined
  if (!record) return null
  const parsed: MentorAvailability = {
    mentorId: record.mentorId as string,
    slots: JSON.parse((record.slots as string) || '[]'),
    timezone: record.timezone as string | undefined,
    updatedAt: record.updatedAt as string | undefined
  }
  mentorAvailabilityCache[mentorId] = parsed
  return parsed
}

export async function updateMentorAvailability(mentorId: string, availability: MentorAvailability): Promise<MentorAvailability> {
  const updated = { ...availability, mentorId, updatedAt: new Date().toISOString() }
  const slotsJson = JSON.stringify(updated.slots)
  const { data: existing } = await getClient().models.MentorAvailability.list({ filter: { mentorId: { eq: mentorId } } })
  const existingRecord = (existing || [])[0] as Record<string, unknown> | undefined
  if (existingRecord?.id) {
    await getClient().models.MentorAvailability.update({
      id: existingRecord.id as string,
      slots: slotsJson,
      timezone: updated.timezone
    })
  } else {
    await getClient().models.MentorAvailability.create({
      mentorId,
      slots: slotsJson,
      timezone: updated.timezone
    })
  }
  mentorAvailabilityCache[mentorId] = updated
  return updated
}

export async function createGoal(goal: Goal): Promise<Goal> {
  const { data, errors } = await getClient().models.Goal.create({
    userId: goal.userId,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    progress: goal.progress,
    dueDate: goal.dueDate
  })
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '))
  return toAppGoal(data as Record<string, unknown>)!
}

export async function updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
  const u = updates as Record<string, unknown>
  const { data, errors } = await getClient().models.Goal.update({
    id: goalId,
    ...(u.title != null && { title: u.title as string }),
    ...(u.description !== undefined && { description: u.description as string }),
    ...(u.category !== undefined && { category: u.category as string }),
    ...(u.progress !== undefined && { progress: u.progress as number }),
    ...(u.dueDate !== undefined && { dueDate: u.dueDate as string })
  })
  if (errors?.length) return null
  return toAppGoal(data as Record<string, unknown>)
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  const { errors } = await getClient().models.Goal.delete({ id: goalId })
  return !errors?.length
}

export async function listGoals(userId: string): Promise<Goal[]> {
  const { data } = await getClient().models.Goal.list({ filter: { userId: { eq: userId } } })
  return (data || []).map(d => toAppGoal(d as Record<string, unknown>)).filter((g): g is Goal => g != null)
}

export async function createHabit(habit: Habit): Promise<Habit> {
  // Backend has ActionItem, not Habit. Return habit as-is for now; consider mapping to ActionItem later.
  return { ...habit, id: habit.id || `habit-${Date.now()}` }
}

export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit | null> {
  return { id: habitId, ...updates } as Habit
}

export async function listHabits(_userId: string): Promise<Habit[]> {
  return []
}

export async function createReflection(reflection: Reflection): Promise<Reflection> {
  const { data, errors } = await getClient().models.Reflection.create({
    userId: reflection.userId,
    date: reflection.date,
    mood: reflection.mood,
    moodScore: reflection.moodScore,
    text: reflection.text ?? reflection.content as string ?? '',
    sharedWithMentorId: reflection.sharedWithMentorId,
    mentorFeedback: typeof reflection.mentorFeedback === 'string' ? reflection.mentorFeedback : undefined
  })
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '))
  return toAppReflection(data as Record<string, unknown>)!
}

export async function listReflections(userId: string): Promise<Reflection[]> {
  const { data } = await getClient().models.Reflection.list({ filter: { userId: { eq: userId } } })
  return (data || []).map(d => toAppReflection(d as Record<string, unknown>)).filter((r): r is Reflection => r != null)
}

export async function createJourney(journey: Journey): Promise<Journey> {
  const { data, errors } = await getClient().models.Journey.create({
    userId: journey.userId,
    goalId: journey.goalId,
    mood: journey.mood,
    text: journey.text,
    visibility: (journey.visibility?.toUpperCase() as 'EVERYONE' | 'MENTORS' | 'PRIVATE' | 'SELECTED') || 'EVERYONE',
    selectedMentorIds: journey.selectedMentorIds,
    tags: journey.tags
  })
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '))
  return toAppJourney(data as Record<string, unknown>)!
}

async function listJourneyReactionsByJourneyId(journeyId: string): Promise<Journey['reactions']> {
  const { data } = await getClient().models.JourneyReaction.list({ filter: { journeyId: { eq: journeyId } } })
  return ((data || []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    userId: d.userId as string,
    type: ((d.type as string)?.toUpperCase() || 'HEART') as 'HEART' | 'CELEBRATE' | 'SUPPORT'
  })) as Journey['reactions'])
}

async function listJourneyCommentsByJourneyId(journeyId: string): Promise<Journey['comments']> {
  const { data } = await getClient().models.JourneyComment.list({ filter: { journeyId: { eq: journeyId } } })
  return (data || []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    userId: d.userId as string,
    text: (d.text as string) || '',
    createdAt: (d.createdAt as string) || new Date().toISOString()
  }))
}

export async function getJourney(journeyId: string): Promise<Journey | null> {
  const { data } = await getClient().models.Journey.get({ id: journeyId })
  if (!data) return null
  const [reactions, comments] = await Promise.all([
    listJourneyReactionsByJourneyId(journeyId),
    listJourneyCommentsByJourneyId(journeyId)
  ])
  return toAppJourney(data as Record<string, unknown>, reactions, comments)
}

export async function listJourneys(): Promise<Journey[]> {
  const { data } = await getClient().models.Journey.list()
  const list = data || []
  if (list.length === 0) return []
  const ids = list.map((d: Record<string, unknown>) => d.id as string)
  const [allReactions, allComments] = await Promise.all([
    Promise.all(ids.map(id => listJourneyReactionsByJourneyId(id))),
    Promise.all(ids.map(id => listJourneyCommentsByJourneyId(id)))
  ])
  const reactionsByJourney = Object.fromEntries(ids.map((id, i) => [id, allReactions[i]]))
  const commentsByJourney = Object.fromEntries(ids.map((id, i) => [id, allComments[i]]))
  return list.map((d: Record<string, unknown>) => {
    const id = d.id as string
    return toAppJourney(d, reactionsByJourney[id], commentsByJourney[id])
  }).filter((j): j is Journey => j != null)
}

export async function createJourneyReaction(params: { journeyId: string; userId: string; type: string }): Promise<unknown> {
  const type = (params.type?.toUpperCase() || 'HEART') as 'HEART' | 'CELEBRATE' | 'SUPPORT'
  const { data, errors } = await getClient().models.JourneyReaction.create({
    journeyId: params.journeyId,
    userId: params.userId,
    type
  })
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '))
  return data
}

export async function deleteJourneyReaction(reactionId: string): Promise<boolean> {
  const { errors } = await getClient().models.JourneyReaction.delete({ id: reactionId })
  return !errors?.length
}

export async function createJourneyComment(params: { journeyId: string; userId: string; text: string }): Promise<unknown> {
  const { data, errors } = await getClient().models.JourneyComment.create({
    journeyId: params.journeyId,
    userId: params.userId,
    text: params.text
  })
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '))
  return data
}

export async function listEvents(): Promise<Event[]> {
  return []
}

export async function loadServerData(_url: string): Promise<void> {
  // No-op: data comes from Amplify backend only.
}

export async function createActionPlan(params: Partial<ActionPlan> & { creatorId: string; assigneeId: string; title: string }): Promise<ActionPlan> {
  const { data, errors } = await getClient().models.ActionPlan.create({
    creatorId: params.creatorId,
    assigneeId: params.assigneeId,
    title: params.title,
    description: params.description,
    startDate: params.startDate,
    endDate: params.endDate,
    status: (params.status as ActionPlan['status']) ?? 'ACTIVE'
  })
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '))
  return { ...params, id: (data as { id: string }).id } as ActionPlan
}

export async function listActionPlans(creatorId: string, assigneeId: string): Promise<ActionPlan[]> {
  const { data: byCreator } = await getClient().models.ActionPlan.list({ filter: { creatorId: { eq: creatorId } } })
  const { data: byAssignee } = await getClient().models.ActionPlan.list({ filter: { assigneeId: { eq: assigneeId } } })
  const seen = new Set<string>()
  const out: ActionPlan[] = []
  for (const d of [...(byCreator || []), ...(byAssignee || [])]) {
    const r = d as Record<string, unknown>
    if (r.id && !seen.has(r.id as string)) {
      seen.add(r.id as string)
      out.push({
        id: r.id as string,
        creatorId: r.creatorId as string,
        assigneeId: r.assigneeId as string,
        title: r.title as string,
        description: r.description as string,
        startDate: r.startDate as string,
        endDate: r.endDate as string,
        status: (r.status as string) as ActionPlan['status']
      })
    }
  }
  return out
}

export async function deleteActionPlan(planId: string): Promise<boolean> {
  const items = await listActionItems(planId)
  for (const item of items) {
    await getClient().models.ActionItem.delete({ id: item.id })
  }
  const { errors } = await getClient().models.ActionPlan.delete({ id: planId })
  return !errors?.length
}

export async function createActionItem(params: Partial<ActionItem> & { planId: string; title: string }): Promise<ActionItem> {
  const { data, errors } = await getClient().models.ActionItem.create({
    planId: params.planId,
    title: params.title,
    description: params.description,
    type: params.type ?? 'DO',
    frequency: params.frequency ?? 'DAILY',
    status: params.status ?? 'ACTIVE'
  })
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '))
  const r = data as Record<string, unknown>
  return {
    id: r.id as string,
    planId: r.planId as string,
    title: r.title as string,
    description: r.description as string,
    type: (r.type as ActionItem['type']) ?? 'DO',
    frequency: (r.frequency as ActionItem['frequency']) ?? 'DAILY',
    status: (r.status as ActionItem['status']) ?? 'ACTIVE'
  }
}

export async function updateActionItem(itemId: string, updates: Partial<ActionItem>): Promise<ActionItem | null> {
  const u = updates as Record<string, unknown>
  const { data, errors } = await getClient().models.ActionItem.update({
    id: itemId,
    ...(u.title != null && { title: u.title as string }),
    ...(u.description !== undefined && { description: u.description as string }),
    ...(u.type !== undefined && { type: u.type as 'DO' | 'AVOID' }),
    ...(u.frequency !== undefined && { frequency: u.frequency as 'DAILY' | 'WEEKLY' | 'ONE_TIME' }),
    ...(u.status !== undefined && { status: u.status as 'ACTIVE' | 'PAUSED' | 'COMPLETED' })
  })
  if (errors?.length) return null
  const r = data as Record<string, unknown>
  return r ? {
    id: r.id as string,
    planId: r.planId as string,
    title: r.title as string,
    description: r.description as string,
    type: (r.type as ActionItem['type']) ?? 'DO',
    frequency: (r.frequency as ActionItem['frequency']) ?? 'DAILY',
    status: (r.status as ActionItem['status']) ?? 'ACTIVE'
  } : null
}

export async function listActionItems(planId: string): Promise<ActionItem[]> {
  const { data } = await getClient().models.ActionItem.list({ filter: { planId: { eq: planId } } })
  return (data || []).map(d => {
    const r = d as Record<string, unknown>
    return {
      id: r.id as string,
      planId: r.planId as string,
      title: r.title as string,
      description: r.description as string,
      type: (r.type as ActionItem['type']) ?? 'DO',
      frequency: (r.frequency as ActionItem['frequency']) ?? 'DAILY',
      status: (r.status as ActionItem['status']) ?? 'ACTIVE'
    }
  })
}

export async function deleteActionItem(itemId: string): Promise<boolean> {
  const { errors } = await getClient().models.ActionItem.delete({ id: itemId })
  return !errors?.length
}

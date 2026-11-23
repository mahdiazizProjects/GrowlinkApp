// API service module.
// In cloud mode this talks to Amplify Data (AppSync/DynamoDB). In local mode (no
// amplify_outputs.json) the same calls are served from the browser's localStorage, see backend.ts.

import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { getSignedInUserId, isCloudBackend } from './backend'
import { localClient } from './localStore'
import './localSeed'
import type {
  User,
  Session,
  Goal,
  Habit,
  HabitCompletion,
  Reflection,
  Journey,
  Event,
  Venue,
  Todo,
  ActionPlan,
  ActionItem,
  MentorAvailability,
  SessionFeedback,
  MentorSessionNotes,
  Notification,
  MentorshipRequest
} from '../types'

export interface CreateUserParams {
  id?: string
  email: string
  name: string
  username: string
  role: 'MENTOR' | 'MENTEE' | 'BOTH' | 'mentor' | 'mentee'
  [key: string]: unknown
}

type Rec = Record<string, unknown>
type DataClient = ReturnType<typeof generateClient<Schema>>

let _userClient: DataClient | null = null
let _publicClient: DataClient | null = null

/**
 * The data client for the current caller: Cognito-signed when someone is signed in (so owner rules
 * apply), the public API key otherwise. Local mode has a single in-browser client.
 */
function getClient(): DataClient {
  if (!isCloudBackend) return localClient as unknown as DataClient
  if (getSignedInUserId()) {
    return (_userClient ||= generateClient<Schema>({ authMode: 'userPool' }))
  }
  return (_publicClient ||= generateClient<Schema>({ authMode: 'apiKey' }))
}

/** Profile fields anyone may read. `email` is restricted to the account owner and admins. */
const PUBLIC_USER_FIELDS = [
  'id', 'username', 'name', 'title', 'role', 'bio', 'avatar', 'location', 'skills', 'interests', 'createdAt', 'updatedAt'
] as const

interface ListResult { data?: unknown[] | null; nextToken?: string | null; errors?: { message?: string }[] }
interface LooseModel { list: (options?: Rec) => Promise<ListResult> }

/**
 * Lists every record of a model, following pagination. DynamoDB applies filters after reading a
 * page, so a single `list({ filter })` call can silently miss matches once a table grows.
 */
async function listAll(modelName: string, filter?: Rec, selectionSet?: readonly string[]): Promise<Rec[]> {
  const model = (getClient().models as unknown as Record<string, LooseModel | undefined>)[modelName]
  if (!model) {
    throw new Error(`The "${modelName}" model is not available. Redeploy the Amplify backend so it matches amplify/data/resource.ts.`)
  }
  const out: Rec[] = []
  let nextToken: string | null | undefined
  let pages = 0
  do {
    const res = await model.list({
      ...(filter && { filter }),
      ...(nextToken && { nextToken }),
      ...(selectionSet && isCloudBackend && { selectionSet }),
      limit: 1000
    })
    if (res.errors?.length) throw new Error(res.errors.map(e => e.message || String(e)).join(', '))
    out.push(...((res.data || []).filter(Boolean) as Rec[]))
    nextToken = res.nextToken
    pages++
  } while (nextToken && pages < 100)
  return out
}

function fail(errors: { message?: string }[] | undefined, fallback: string): never {
  throw new Error(errors?.map(e => e.message || String(e)).join(', ') || fallback)
}

const upper = (v: unknown): string | undefined =>
  typeof v === 'string' && v ? v.toUpperCase().replace(/-/g, '_') : undefined
const lower = (v: unknown): string | undefined =>
  typeof v === 'string' && v ? v.toLowerCase().replace(/_/g, '-') : undefined
const nowIso = () => new Date().toISOString()

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
  const notes = (r.notes as string | null) ?? undefined
  const meetingLink = (r.meetingLink as string | null) ?? undefined
  const storedType = lower(r.type) as Session['type'] | undefined
  return {
    id: r.id as string,
    mentorId: r.mentorId as string,
    menteeId: r.menteeId as string,
    mentor: mentor ?? undefined,
    mentee: mentee ?? undefined,
    // Records created before `type` existed fall back to the old heuristic.
    type: storedType ?? (meetingLink ? 'virtual' : 'in-person'),
    ...(r.venueId != null && { venueId: r.venueId as string }),
    date: localDateStr,
    time,
    duration: (r.duration as number) ?? 60,
    status,
    notes,
    topic: (r.topic as string | null) || notes || undefined,
    meetingLink,
    ...(r.cancelledAt != null && { cancelledAt: r.cancelledAt as string }),
    ...(r.cancelledBy != null && { cancelledBy: lower(r.cancelledBy) as Session['cancelledBy'] }),
    ...(r.cancellationReason != null && { cancellationReason: r.cancellationReason as string }),
    ...(r.cancellationRequestedAt != null && { cancellationRequestedAt: r.cancellationRequestedAt as string }),
    ...(r.menteeAcceptedCancellation != null && { menteeAcceptedCancellation: r.menteeAcceptedCancellation as boolean }),
    ...(r.feedbackSubmitted != null && { feedbackSubmitted: r.feedbackSubmitted as boolean }),
    ...(r.feedbackSubmittedAt != null && { feedbackSubmittedAt: r.feedbackSubmittedAt as string })
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
    // Goals saved before `status` was stored are treated as active.
    status: (lower(r.status) as Goal['status']) ?? 'active',
    identity: (r.identity as string | null) ?? undefined,
    mentorId: (r.mentorId as string | null) ?? undefined,
    createdAt: r.createdAt as string | undefined,
    updatedAt: r.updatedAt as string | undefined
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
  // Only the owner (or an admin) may read `email`; asking for it on someone else's profile is an error.
  const own = userId === getSignedInUserId()
  const { data } = own || !isCloudBackend
    ? await getClient().models.User.get({ id: userId })
    : await getClient().models.User.get({ id: userId }, { selectionSet: PUBLIC_USER_FIELDS })
  const user = toAppUser(data as Record<string, unknown> | null)
  // Local mode stores everything together; keep other people's email out of the UI there too.
  return user && !own ? { ...user, email: '' } : user
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
  if (errors?.length) fail(errors, 'Failed to update profile')
  return toAppUser(data as Record<string, unknown>)
}

export async function listUsers(): Promise<User[]> {
  const me = getSignedInUserId()
  const data = await listAll('User', undefined, PUBLIC_USER_FIELDS)
  return data
    .map(d => toAppUser(d))
    .filter((u): u is User => u != null)
    .map(u => (u.id === me ? u : { ...u, email: '' }))
}

/** Loads several users at once, skipping ids that no longer exist. */
async function loadUsers(ids: Iterable<string>): Promise<Map<string, User>> {
  const unique = [...new Set([...ids].filter(Boolean))]
  const loaded = await Promise.all(unique.map(id => getUser(id).catch(() => null)))
  const map = new Map<string, User>()
  loaded.forEach((u, i) => { if (u) map.set(unique[i], u) })
  return map
}

/** Mentors, with rating and session count computed from real feedback (never stored or invented). */
export async function listMentors(): Promise<User[]> {
  const [all, ratings] = await Promise.all([
    listUsers(),
    getMentorRatings().catch(() => ({} as Record<string, { rating: number; count: number }>))
  ])
  return all
    .filter(u => {
      const r = (u.role || '').toString().toLowerCase()
      return r === 'mentor' || r === 'both'
    })
    .map(u => (ratings[u.id] ? { ...u, rating: ratings[u.id].rating, reviewCount: ratings[u.id].count } : u))
}

type SessionStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export async function createSession(session: Session): Promise<Session> {
  const dateStr = new Date(session.date).toISOString()
  const { data, errors } = await getClient().models.Session.create({
    mentorId: session.mentorId,
    menteeId: session.menteeId,
    date: dateStr,
    duration: session.duration ?? 60,
    status: (upper(session.status) as SessionStatus) || 'PENDING',
    notes: session.notes ?? session.topic ?? undefined,
    topic: session.topic ?? undefined,
    meetingLink: session.meetingLink,
    type: session.type === 'virtual' ? 'VIRTUAL' : 'IN_PERSON',
    venueId: session.venueId
  })
  if (errors?.length || !data) fail(errors, 'Failed to create session')
  const created = data as Rec
  // Public marker so other mentees can't book the same time; holds no private details.
  try {
    await getClient().models.BookedSlot.create({
      sessionId: created.id as string,
      mentorId: session.mentorId,
      menteeId: session.menteeId,
      startsAt: dateStr,
      duration: session.duration ?? 60
    })
  } catch (error) {
    console.error('Could not reserve the booked slot:', error)
  }
  const users = await loadUsers([session.mentorId, session.menteeId])
  return toAppSession(created, users.get(session.mentorId), users.get(session.menteeId))!
}

/**
 * Backfills public slot markers for upcoming sessions booked before markers existed, so they block
 * other bookings. Safe to call repeatedly; failures are ignored.
 */
export async function ensureBookedSlots(sessions: Session[]): Promise<void> {
  const upcoming = sessions.filter(s =>
    (s.status === 'PENDING' || s.status === 'CONFIRMED') && !s.cancelledAt && new Date(s.date).getTime() > Date.now()
  )
  if (upcoming.length === 0) return
  const mentorIds = [...new Set(upcoming.map(s => s.mentorId))]
  const existing = new Set(
    (await Promise.all(mentorIds.map(id => listAll('BookedSlot', { mentorId: { eq: id } }).catch(() => [] as Rec[]))))
      .flat()
      .map(r => r.sessionId as string)
  )
  await Promise.all(upcoming.filter(s => !existing.has(s.id)).map(s =>
    getClient().models.BookedSlot.create({
      sessionId: s.id,
      mentorId: s.mentorId,
      menteeId: s.menteeId,
      startsAt: new Date(s.date).toISOString(),
      duration: s.duration ?? 60
    }).catch(() => null)
  ))
}

/** Publishes anonymous ratings for feedback given before public ratings existed. */
export async function ensureMentorRatings(feedback: SessionFeedback[]): Promise<void> {
  await Promise.all(feedback.map(async f => {
    try {
      const { data } = await getClient().models.MentorRating.get({ id: f.sessionId })
      if (!data) await getClient().models.MentorRating.create({ id: f.sessionId, mentorId: f.mentorId, rating: f.rating })
    } catch {
      // Best effort only.
    }
  }))
}

/** Releases a session's public slot marker once it can no longer take place. */
async function releaseBookedSlot(sessionId: string): Promise<void> {
  const slots = await listAll('BookedSlot', { sessionId: { eq: sessionId } }).catch(() => [])
  await Promise.all(slots.map(s => getClient().models.BookedSlot.delete({ id: s.id as string }).catch(() => null)))
}

/**
 * A mentor's taken times as session-shaped records, for slot calculations. Works for any caller,
 * including people who are not part of those sessions.
 */
export async function listBookedSlotsForMentor(mentorId: string): Promise<Pick<Session, 'id' | 'date' | 'time' | 'duration' | 'status'>[]> {
  const rows = await listAll('BookedSlot', { mentorId: { eq: mentorId } })
  return rows.map(r => {
    const start = new Date(r.startsAt as string)
    return {
      id: r.sessionId as string,
      date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T00:00:00`,
      time: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
      duration: (r.duration as number) ?? 60,
      status: 'CONFIRMED' as const
    }
  })
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
  const u = updates as Rec
  // `undefined` leaves a field alone; an explicit `undefined` key for the cancellation fields means "clear it".
  const has = (k: string) => Object.prototype.hasOwnProperty.call(u, k)
  const clearable = (k: string) => (has(k) ? { [k]: (u[k] as string | boolean | undefined) ?? null } : {})
  const { data, errors } = await getClient().models.Session.update({
    id: sessionId,
    ...(u.status != null && { status: upper(u.status) as SessionStatus }),
    ...(u.notes !== undefined && { notes: u.notes as string }),
    ...(u.topic !== undefined && { topic: u.topic as string }),
    ...(u.meetingLink !== undefined && { meetingLink: u.meetingLink as string }),
    ...(u.venueId !== undefined && { venueId: u.venueId as string }),
    ...(u.cancelledBy != null && { cancelledBy: upper(u.cancelledBy) as 'MENTOR' | 'MENTEE' | 'SYSTEM' }),
    ...clearable('cancelledAt'),
    ...clearable('cancellationReason'),
    ...clearable('cancellationRequestedAt'),
    ...clearable('menteeAcceptedCancellation'),
    ...(u.feedbackSubmitted !== undefined && { feedbackSubmitted: u.feedbackSubmitted as boolean }),
    ...(u.feedbackSubmittedAt !== undefined && { feedbackSubmittedAt: u.feedbackSubmittedAt as string })
  } as Parameters<DataClient['models']['Session']['update']>[0])
  if (errors?.length || !data) fail(errors, 'Failed to update session')
  const d = data as Rec
  if (d.status === 'CANCELLED') await releaseBookedSlot(sessionId)
  const users = await loadUsers([d.mentorId as string, d.menteeId as string])
  return toAppSession(d, users.get(d.mentorId as string), users.get(d.menteeId as string))
}

async function hydrateSessions(rows: Rec[]): Promise<Session[]> {
  const users = await loadUsers(rows.flatMap(r => [r.mentorId as string, r.menteeId as string]))
  return rows
    .map(r => toAppSession(r, users.get(r.mentorId as string), users.get(r.menteeId as string)))
    .filter((x): x is Session => x != null)
}

export async function listSessions(): Promise<Session[]> {
  return hydrateSessions(await listAll('Session'))
}

export async function listSessionsForUser(userId: string, role: 'mentor' | 'mentee'): Promise<Session[]> {
  const filterField = role === 'mentor' ? 'mentorId' : 'menteeId'
  return hydrateSessions(await listAll('Session', { [filterField]: { eq: userId } }))
}

/** Every session the user takes part in, as mentor or mentee, without duplicates. */
export async function listAllSessionsForUser(userId: string): Promise<Session[]> {
  const [asMentor, asMentee] = await Promise.all([
    listSessionsForUser(userId, 'mentor'),
    listSessionsForUser(userId, 'mentee')
  ])
  const seen = new Set<string>()
  return [...asMentor, ...asMentee].filter(s => (seen.has(s.id) ? false : (seen.add(s.id), true)))
}

export async function getMentorAvailability(mentorId: string): Promise<MentorAvailability | null> {
  if (mentorAvailabilityCache[mentorId]) return mentorAvailabilityCache[mentorId]
  const record = (await listAll('MentorAvailability', { mentorId: { eq: mentorId } }))[0]
  if (!record) return null
  let slots: MentorAvailability['slots'] = []
  try {
    const raw = JSON.parse((record.slots as string) || '[]')
    if (Array.isArray(raw)) slots = raw
  } catch {
    slots = []
  }
  const parsed: MentorAvailability = {
    mentorId: record.mentorId as string,
    slots,
    timezone: record.timezone as string | undefined,
    updatedAt: record.updatedAt as string | undefined
  }
  mentorAvailabilityCache[mentorId] = parsed
  return parsed
}

export async function updateMentorAvailability(mentorId: string, availability: MentorAvailability): Promise<MentorAvailability> {
  const updated = { ...availability, mentorId, updatedAt: new Date().toISOString() }
  const slotsJson = JSON.stringify(updated.slots)
  const existingRecord = (await listAll('MentorAvailability', { mentorId: { eq: mentorId } }))[0]
  const { errors } = existingRecord?.id
    ? await getClient().models.MentorAvailability.update({
        id: existingRecord.id as string,
        slots: slotsJson,
        timezone: updated.timezone
      })
    : await getClient().models.MentorAvailability.create({
        mentorId,
        slots: slotsJson,
        timezone: updated.timezone
      })
  if (errors?.length) fail(errors, 'Failed to save availability')
  mentorAvailabilityCache[mentorId] = updated
  return updated
}

type GoalStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

export async function createGoal(goal: Goal): Promise<Goal> {
  const { data, errors } = await getClient().models.Goal.create({
    userId: goal.userId,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    progress: goal.progress,
    dueDate: goal.dueDate,
    status: (upper(goal.status) as GoalStatus) || 'ACTIVE',
    identity: goal.identity,
    mentorId: goal.mentorId
  })
  if (errors?.length || !data) fail(errors, 'Failed to create goal')
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
    ...(u.dueDate !== undefined && { dueDate: u.dueDate as string }),
    ...(u.status != null && { status: upper(u.status) as GoalStatus }),
    ...(u.identity !== undefined && { identity: u.identity as string }),
    ...(u.mentorId !== undefined && { mentorId: u.mentorId as string })
  })
  if (errors?.length) fail(errors, 'Failed to update goal')
  return toAppGoal(data as Record<string, unknown>)
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  const { errors } = await getClient().models.Goal.delete({ id: goalId })
  return !errors?.length
}

export async function listGoals(userId: string): Promise<Goal[]> {
  const data = await listAll('Goal', { userId: { eq: userId } })
  return data.map(d => toAppGoal(d)).filter((g): g is Goal => g != null)
}

// ---------------------------------------------------------------------------
// Habits and completions
// ---------------------------------------------------------------------------

function toAppHabit(r: Rec | null): Habit | null {
  if (!r || !r.id) return null
  return {
    id: r.id as string,
    goalId: r.goalId as string,
    userId: r.userId as string | undefined,
    title: (r.title as string) || '',
    description: (r.description as string | null) ?? undefined,
    frequency: (lower(r.frequency) as Habit['frequency']) ?? 'daily',
    duration: (r.duration as number | null) ?? 0,
    cue: {
      time: (r.cueTime as string | null) ?? undefined,
      place: (r.cuePlace as string | null) ?? undefined,
      context: (r.cueContext as string | null) ?? undefined
    },
    reward: (r.reward as string | null) ?? undefined,
    status: (lower(r.status) as Habit['status']) ?? 'active',
    createdAt: (r.createdAt as string) || nowIso(),
    updatedAt: (r.updatedAt as string) || nowIso()
  }
}

export async function createHabit(habit: Habit & { userId?: string }): Promise<Habit> {
  if (!habit.userId) throw new Error('A habit needs an owner')
  const { data, errors } = await getClient().models.Habit.create({
    userId: habit.userId,
    goalId: habit.goalId,
    title: habit.title,
    description: habit.description,
    frequency: habit.frequency === 'weekly' ? 'WEEKLY' : 'DAILY',
    duration: habit.duration,
    cueTime: habit.cue?.time,
    cuePlace: habit.cue?.place,
    cueContext: habit.cue?.context,
    reward: habit.reward,
    status: (upper(habit.status) as 'ACTIVE' | 'PAUSED' | 'COMPLETED') || 'ACTIVE'
  })
  if (errors?.length || !data) fail(errors, 'Failed to create habit')
  return toAppHabit(data as Rec)!
}

export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit | null> {
  const { data, errors } = await getClient().models.Habit.update({
    id: habitId,
    ...(updates.title != null && { title: updates.title }),
    ...(updates.description !== undefined && { description: updates.description }),
    ...(updates.frequency != null && { frequency: updates.frequency === 'weekly' ? 'WEEKLY' as const : 'DAILY' as const }),
    ...(updates.duration != null && { duration: updates.duration }),
    ...(updates.cue && { cueTime: updates.cue.time, cuePlace: updates.cue.place, cueContext: updates.cue.context }),
    ...(updates.reward !== undefined && { reward: updates.reward }),
    ...(updates.status != null && { status: upper(updates.status) as 'ACTIVE' | 'PAUSED' | 'COMPLETED' })
  })
  if (errors?.length) fail(errors, 'Failed to update habit')
  return toAppHabit(data as Rec | null)
}

export async function deleteHabit(habitId: string): Promise<boolean> {
  const completions = await listAll('HabitCompletion', { habitId: { eq: habitId } })
  await Promise.all(completions.map(c => getClient().models.HabitCompletion.delete({ id: c.id as string })))
  const { errors } = await getClient().models.Habit.delete({ id: habitId })
  return !errors?.length
}

export async function listHabits(userId: string): Promise<Habit[]> {
  const data = await listAll('Habit', { userId: { eq: userId } })
  return data.map(toAppHabit).filter((h): h is Habit => h != null)
}

function toAppHabitCompletion(r: Rec): HabitCompletion {
  return {
    id: r.id as string,
    habitId: r.habitId as string,
    userId: r.userId as string,
    date: r.date as string,
    completed: (r.completed as boolean | null) ?? true,
    notes: (r.notes as string | null) ?? undefined,
    createdAt: (r.createdAt as string) || nowIso()
  }
}

export async function listHabitCompletions(userId: string): Promise<HabitCompletion[]> {
  return (await listAll('HabitCompletion', { userId: { eq: userId } })).map(toAppHabitCompletion)
}

export async function createHabitCompletion(params: { habitId: string; userId: string; date: string; notes?: string }): Promise<HabitCompletion> {
  const { data, errors } = await getClient().models.HabitCompletion.create({
    habitId: params.habitId,
    userId: params.userId,
    date: params.date,
    completed: true,
    notes: params.notes
  })
  if (errors?.length || !data) fail(errors, 'Failed to record habit completion')
  return toAppHabitCompletion(data as Rec)
}

export async function deleteHabitCompletion(completionId: string): Promise<boolean> {
  const { errors } = await getClient().models.HabitCompletion.delete({ id: completionId })
  return !errors?.length
}

// ---------------------------------------------------------------------------
// Todos
// ---------------------------------------------------------------------------

function toAppTodo(r: Rec): Todo {
  return {
    id: r.id as string,
    userId: r.userId as string,
    goalId: (r.goalId as string | null) ?? undefined,
    text: (r.text as string) || '',
    done: !!r.done,
    dueDate: (r.dueDate as string | null) ?? undefined,
    createdAt: r.createdAt as string | undefined
  }
}

export async function listTodos(userId: string): Promise<Todo[]> {
  const rows = await listAll('Todo', { userId: { eq: userId } })
  return rows.map(toAppTodo).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
}

export async function createTodo(params: { userId: string; text: string; goalId?: string; dueDate?: string }): Promise<Todo> {
  const { data, errors } = await getClient().models.Todo.create({
    userId: params.userId,
    text: params.text,
    goalId: params.goalId,
    dueDate: params.dueDate,
    done: false
  })
  if (errors?.length || !data) fail(errors, 'Failed to add todo')
  return toAppTodo(data as Rec)
}

export async function updateTodo(todoId: string, updates: { text?: string; done?: boolean }): Promise<Todo> {
  const { data, errors } = await getClient().models.Todo.update({
    id: todoId,
    ...(updates.text != null && { text: updates.text }),
    ...(updates.done != null && { done: updates.done })
  })
  if (errors?.length || !data) fail(errors, 'Failed to update todo')
  return toAppTodo(data as Rec)
}

export async function deleteTodo(todoId: string): Promise<boolean> {
  const { errors } = await getClient().models.Todo.delete({ id: todoId })
  return !errors?.length
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
  const data = await listAll('Reflection', { userId: { eq: userId } })
  return data.map(d => toAppReflection(d)).filter((r): r is Reflection => r != null)
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
  const data = await listAll('JourneyReaction', { journeyId: { eq: journeyId } })
  return (data.map((d: Record<string, unknown>) => ({
    id: d.id as string,
    userId: d.userId as string,
    type: ((d.type as string)?.toUpperCase() || 'HEART') as 'HEART' | 'CELEBRATE' | 'SUPPORT'
  })) as Journey['reactions'])
}

async function listJourneyCommentsByJourneyId(journeyId: string): Promise<Journey['comments']> {
  const data = await listAll('JourneyComment', { journeyId: { eq: journeyId } })
  return data.map((d: Record<string, unknown>) => ({
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
  const list = await listAll('Journey')
  if (list.length === 0) return []
  // Two table reads instead of two per journey.
  const [reactions, comments] = await Promise.all([listAll('JourneyReaction'), listAll('JourneyComment')])
  const reactionsByJourney: Record<string, NonNullable<Journey['reactions']>> = {}
  for (const d of reactions) {
    (reactionsByJourney[d.journeyId as string] ||= []).push({
      id: d.id as string,
      userId: d.userId as string,
      type: (upper(d.type) || 'HEART') as 'HEART' | 'CELEBRATE' | 'SUPPORT'
    })
  }
  const commentsByJourney: Record<string, NonNullable<Journey['comments']>> = {}
  for (const d of comments) {
    (commentsByJourney[d.journeyId as string] ||= []).push({
      id: d.id as string,
      userId: d.userId as string,
      text: (d.text as string) || '',
      createdAt: (d.createdAt as string) || nowIso()
    })
  }
  Object.values(commentsByJourney).forEach(c => c.sort((x, y) => x.createdAt.localeCompare(y.createdAt)))
  return list
    .map(d => toAppJourney(d, reactionsByJourney[d.id as string], commentsByJourney[d.id as string]))
    .filter((j): j is Journey => j != null)
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt))
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

export async function deleteJourney(journeyId: string): Promise<boolean> {
  const [reactions, comments] = await Promise.all([
    listAll('JourneyReaction', { journeyId: { eq: journeyId } }),
    listAll('JourneyComment', { journeyId: { eq: journeyId } })
  ])
  await Promise.all([
    ...reactions.map(r => getClient().models.JourneyReaction.delete({ id: r.id as string })),
    ...comments.map(c => getClient().models.JourneyComment.delete({ id: c.id as string }))
  ])
  const { errors } = await getClient().models.Journey.delete({ id: journeyId })
  return !errors?.length
}

// ---------------------------------------------------------------------------
// Venues and events
// ---------------------------------------------------------------------------

function toAppVenue(r: Rec): Venue {
  return {
    id: r.id as string,
    name: (r.name as string) || '',
    type: (lower(r.type) as Venue['type']) ?? 'library',
    address: (r.address as string) || '',
    city: (r.city as string) || '',
    capacity: (r.capacity as number) ?? 0,
    amenities: (r.amenities as string[] | null) ?? [],
    image: (r.image as string) || '',
    isPartner: r.isPartner !== false,
    partnershipTier: (lower(r.partnershipTier) as Venue['partnershipTier']) ?? 'bronze'
  }
}

export async function listVenues(): Promise<Venue[]> {
  return (await listAll('Venue')).map(toAppVenue).sort((a, b) => a.name.localeCompare(b.name))
}

function toAppEvent(r: Rec, host?: User): Event {
  return {
    id: r.id as string,
    title: (r.title as string) || '',
    description: (r.description as string) || '',
    type: (lower(r.type) as Event['type']) ?? 'hangout',
    venueId: (r.venueId as string | null) ?? undefined,
    hostId: (r.hostId as string) || '',
    host,
    date: (r.date as string) || '',
    time: (r.time as string) || '',
    duration: (r.duration as number) ?? 60,
    maxAttendees: (r.maxAttendees as number) ?? 0,
    attendees: ((r.attendees as (string | null)[] | null) ?? []).filter((a): a is string => !!a),
    isVirtual: !!r.isVirtual,
    price: (r.price as number) ?? 0,
    tags: ((r.tags as (string | null)[] | null) ?? []).filter((t): t is string => !!t),
    image: (r.image as string | null) ?? undefined
  }
}

/** Attendee ids per event, from the EventAttendance table plus the legacy `attendees` array. */
async function loadAttendance(): Promise<Record<string, string[]>> {
  const rows = await listAll('EventAttendance').catch(() => [] as Rec[])
  const byEvent: Record<string, string[]> = {}
  for (const r of rows) (byEvent[r.eventId as string] ||= []).push(r.userId as string)
  return byEvent
}

function withAttendees(r: Rec, attendance: Record<string, string[]>): Rec {
  const legacy = ((r.attendees as (string | null)[] | null) ?? []).filter((a): a is string => !!a)
  return { ...r, attendees: [...new Set([...legacy, ...(attendance[r.id as string] || [])])] }
}

export async function listEvents(): Promise<Event[]> {
  const [rows, attendance] = await Promise.all([listAll('Event'), loadAttendance()])
  const hosts = await loadUsers(rows.map(r => r.hostId as string))
  return rows
    .map(r => toAppEvent(withAttendees(r, attendance), hosts.get(r.hostId as string)))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
}

type EventType = 'HANGOUT' | 'WORKSHOP' | 'NETWORKING' | 'CASUAL_MEETUP'

export async function createEvent(event: Omit<Event, 'id' | 'attendees' | 'host'>): Promise<Event> {
  const { data, errors } = await getClient().models.Event.create({
    title: event.title,
    description: event.description,
    type: (upper(event.type) as EventType) || 'HANGOUT',
    venueId: event.venueId,
    hostId: event.hostId,
    date: event.date,
    time: event.time,
    duration: event.duration,
    maxAttendees: event.maxAttendees,
    isVirtual: event.isVirtual,
    price: event.price,
    tags: event.tags,
    image: event.image
  })
  if (errors?.length || !data) fail(errors, 'Failed to create event')
  const host = event.hostId ? await getUser(event.hostId).catch(() => null) : null
  return toAppEvent({ ...(data as Rec), attendees: [] }, host ?? undefined)
}

export async function deleteEvent(eventId: string): Promise<void> {
  const rows = await listAll('EventAttendance', { eventId: { eq: eventId } }).catch(() => [] as Rec[])
  await Promise.all(rows.map(r => getClient().models.EventAttendance.delete({ id: r.id as string }).catch(() => null)))
  const { errors } = await getClient().models.Event.delete({ id: eventId })
  if (errors?.length) fail(errors, 'Failed to delete event')
}

/** Adds or removes the user as an attendee. Throws when the event is full. */
export async function setEventAttendance(eventId: string, userId: string, attending: boolean): Promise<Event> {
  const { data: current } = await getClient().models.Event.get({ id: eventId })
  if (!current) throw new Error('This event no longer exists')
  const c = current as Rec
  const mine = await listAll('EventAttendance', { eventId: { eq: eventId }, userId: { eq: userId } })
  if (attending && mine.length === 0) {
    const all = await listAll('EventAttendance', { eventId: { eq: eventId } })
    const max = (c.maxAttendees as number | null) ?? 0
    const legacy = ((c.attendees as (string | null)[] | null) ?? []).filter(Boolean).length
    if (max > 0 && all.length + legacy >= max) throw new Error('This event is full')
    const { errors } = await getClient().models.EventAttendance.create({ eventId, userId })
    if (errors?.length) fail(errors, 'Failed to join the event')
  } else if (!attending) {
    await Promise.all(mine.map(r => getClient().models.EventAttendance.delete({ id: r.id as string })))
  }
  const attendance = await loadAttendance()
  const host = c.hostId ? await getUser(c.hostId as string).catch(() => null) : null
  return toAppEvent(withAttendees(c, attendance), host ?? undefined)
}

type VenueType = 'LIBRARY' | 'CO_WORKING' | 'CAFE' | 'COMMUNITY_CENTER'

export async function createVenue(venue: Omit<Venue, 'id'>): Promise<Venue> {
  const { data, errors } = await getClient().models.Venue.create({
    name: venue.name,
    type: upper(venue.type) as VenueType,
    address: venue.address,
    city: venue.city,
    capacity: venue.capacity,
    amenities: venue.amenities,
    image: venue.image,
    isPartner: venue.isPartner,
    partnershipTier: upper(venue.partnershipTier) as 'BRONZE' | 'SILVER' | 'GOLD'
  })
  if (errors?.length || !data) fail(errors, 'Failed to create venue')
  return toAppVenue(data as Rec)
}

export async function deleteVenue(venueId: string): Promise<void> {
  const { errors } = await getClient().models.Venue.delete({ id: venueId })
  if (errors?.length) fail(errors, 'Failed to delete venue')
}

// ---------------------------------------------------------------------------
// Session feedback and mentor notes
// ---------------------------------------------------------------------------

function toAppFeedback(r: Rec): SessionFeedback {
  return {
    id: r.id as string,
    sessionId: r.sessionId as string,
    menteeId: r.menteeId as string,
    mentorId: r.mentorId as string,
    rating: (r.rating as number) ?? 0,
    growthArea: (r.growthArea as string) || '',
    growthIdea: (r.growthIdea as string) || '',
    whatWentWell: (r.whatWentWell as string) || '',
    whatToImprove: (r.whatToImprove as string) || '',
    additionalComments: (r.additionalComments as string | null) ?? undefined,
    isAnonymous: !!r.isAnonymous,
    createdAt: (r.createdAt as string) || nowIso(),
    updatedAt: (r.updatedAt as string) || nowIso()
  }
}

export async function createSessionFeedback(feedback: Omit<SessionFeedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<SessionFeedback> {
  const { data, errors } = await getClient().models.SessionFeedback.create({
    sessionId: feedback.sessionId,
    menteeId: feedback.menteeId,
    mentorId: feedback.mentorId,
    rating: feedback.rating,
    growthArea: feedback.growthArea,
    growthIdea: feedback.growthIdea,
    whatWentWell: feedback.whatWentWell,
    whatToImprove: feedback.whatToImprove,
    additionalComments: feedback.additionalComments,
    isAnonymous: feedback.isAnonymous ?? false
  })
  if (errors?.length || !data) fail(errors, 'Failed to submit feedback')
  // Public, anonymous copy of the score. Keyed by session id so a session can only count once.
  const { errors: ratingErrors } = await getClient().models.MentorRating.create({
    id: feedback.sessionId,
    mentorId: feedback.mentorId,
    rating: feedback.rating
  })
  if (ratingErrors?.length) console.error('Could not publish the rating:', ratingErrors)
  return toAppFeedback(data as Rec)
}

/** Feedback the user gave (as mentee) or received (as mentor). */
export async function listSessionFeedbackForUser(userId: string): Promise<SessionFeedback[]> {
  const [given, received] = await Promise.all([
    listAll('SessionFeedback', { menteeId: { eq: userId } }),
    listAll('SessionFeedback', { mentorId: { eq: userId } })
  ])
  const seen = new Set<string>()
  return [...given, ...received]
    .filter(r => (seen.has(r.id as string) ? false : (seen.add(r.id as string), true)))
    .map(toAppFeedback)
}

export async function listSessionFeedbackForMentor(mentorId: string): Promise<SessionFeedback[]> {
  return (await listAll('SessionFeedback', { mentorId: { eq: mentorId } })).map(toAppFeedback)
}

/** Public rating summary for one mentor (no feedback text). */
export async function getMentorRating(mentorId: string): Promise<{ rating: number; count: number } | null> {
  const rows = await listAll('MentorRating', { mentorId: { eq: mentorId } })
  if (rows.length === 0) return null
  const sum = rows.reduce((t, r) => t + ((r.rating as number) || 0), 0)
  return { rating: Math.round((sum / rows.length) * 10) / 10, count: rows.length }
}

/** Average rating and feedback count per mentor, for listings. */
export async function getMentorRatings(): Promise<Record<string, { rating: number; count: number }>> {
  const rows = await listAll('MentorRating')
  const totals: Record<string, { sum: number; count: number }> = {}
  for (const r of rows) {
    const t = (totals[r.mentorId as string] ||= { sum: 0, count: 0 })
    t.sum += (r.rating as number) || 0
    t.count += 1
  }
  return Object.fromEntries(
    Object.entries(totals).map(([id, t]) => [id, { rating: Math.round((t.sum / t.count) * 10) / 10, count: t.count }])
  )
}

function toAppMentorNotes(r: Rec): MentorSessionNotes {
  return {
    id: r.id as string,
    sessionId: r.sessionId as string,
    mentorId: r.mentorId as string,
    summary: (r.summary as string) || '',
    followUps: (r.followUps as string) || '',
    growthFocus: (r.growthFocus as string | null) ?? undefined,
    privateNotes: (r.privateNotes as string | null) ?? undefined,
    createdAt: (r.createdAt as string) || nowIso(),
    updatedAt: (r.updatedAt as string) || nowIso()
  }
}

export async function listMentorSessionNotes(mentorId: string): Promise<MentorSessionNotes[]> {
  return (await listAll('MentorSessionNote', { mentorId: { eq: mentorId } })).map(toAppMentorNotes)
}

export async function createMentorSessionNotes(notes: Omit<MentorSessionNotes, 'id' | 'createdAt' | 'updatedAt'>): Promise<MentorSessionNotes> {
  const { data, errors } = await getClient().models.MentorSessionNote.create({
    sessionId: notes.sessionId,
    mentorId: notes.mentorId,
    summary: notes.summary,
    followUps: notes.followUps,
    growthFocus: notes.growthFocus,
    privateNotes: notes.privateNotes
  })
  if (errors?.length || !data) fail(errors, 'Failed to save notes')
  return toAppMentorNotes(data as Rec)
}

export async function updateMentorSessionNotes(noteId: string, updates: Partial<MentorSessionNotes>): Promise<MentorSessionNotes> {
  const { data, errors } = await getClient().models.MentorSessionNote.update({
    id: noteId,
    ...(updates.summary !== undefined && { summary: updates.summary }),
    ...(updates.followUps !== undefined && { followUps: updates.followUps }),
    ...(updates.growthFocus !== undefined && { growthFocus: updates.growthFocus }),
    ...(updates.privateNotes !== undefined && { privateNotes: updates.privateNotes })
  })
  if (errors?.length || !data) fail(errors, 'Failed to save notes')
  return toAppMentorNotes(data as Rec)
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

function toAppNotification(r: Rec): Notification {
  return {
    id: r.id as string,
    userId: r.userId as string,
    title: (r.title as string) || '',
    message: (r.message as string) || '',
    type: ((r.type as string) || 'admin-update') as Notification['type'],
    read: !!r.read,
    relatedId: (r.relatedId as string | null) ?? undefined,
    createdAt: (r.createdAt as string) || nowIso()
  }
}

export async function listNotifications(userId: string): Promise<Notification[]> {
  return (await listAll('Notification', { userId: { eq: userId } }))
    .map(toAppNotification)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function createNotification(n: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
  const { data, errors } = await getClient().models.Notification.create({
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    read: false,
    relatedId: n.relatedId
  })
  if (errors?.length || !data) fail(errors, 'Failed to create notification')
  return toAppNotification(data as Rec)
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const { errors } = await getClient().models.Notification.update({ id: notificationId, read: true })
  if (errors?.length) fail(errors, 'Failed to update notification')
}

// ---------------------------------------------------------------------------
// Saved mentors, mentorship requests, applications and contact messages
// ---------------------------------------------------------------------------

export async function listSavedMentorIds(userId: string): Promise<string[]> {
  return (await listAll('SavedMentor', { userId: { eq: userId } })).map(r => r.mentorId as string)
}

export async function setMentorSaved(userId: string, mentorId: string, saved: boolean): Promise<void> {
  const existing = await listAll('SavedMentor', { userId: { eq: userId }, mentorId: { eq: mentorId } })
  if (saved && existing.length === 0) {
    const { errors } = await getClient().models.SavedMentor.create({ userId, mentorId })
    if (errors?.length) fail(errors, 'Failed to save mentor')
  } else if (!saved) {
    await Promise.all(existing.map(r => getClient().models.SavedMentor.delete({ id: r.id as string })))
  }
}

function toAppMentorshipRequest(r: Rec): MentorshipRequest {
  return {
    id: r.id as string,
    menteeId: r.menteeId as string,
    mentorId: r.mentorId as string,
    message: (r.message as string) || '',
    status: ((r.status as string) || 'PENDING') as MentorshipRequest['status'],
    createdAt: (r.createdAt as string) || nowIso()
  }
}

export async function createMentorshipRequest(params: { menteeId: string; mentorId: string; message: string }): Promise<MentorshipRequest> {
  const { data, errors } = await getClient().models.MentorshipRequest.create({ ...params, status: 'PENDING' })
  if (errors?.length || !data) fail(errors, 'Failed to send request')
  return toAppMentorshipRequest(data as Rec)
}

export async function listMentorshipRequests(userId: string): Promise<MentorshipRequest[]> {
  const [sent, received] = await Promise.all([
    listAll('MentorshipRequest', { menteeId: { eq: userId } }),
    listAll('MentorshipRequest', { mentorId: { eq: userId } })
  ])
  const seen = new Set<string>()
  return [...sent, ...received]
    .filter(r => (seen.has(r.id as string) ? false : (seen.add(r.id as string), true)))
    .map(toAppMentorshipRequest)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function updateMentorshipRequest(requestId: string, status: 'ACCEPTED' | 'DECLINED'): Promise<MentorshipRequest> {
  const { data, errors } = await getClient().models.MentorshipRequest.update({ id: requestId, status })
  if (errors?.length || !data) fail(errors, 'Failed to update request')
  return toAppMentorshipRequest(data as Rec)
}

export async function createMentorApplication(params: { userId?: string; name: string; email: string; details: Record<string, unknown> }): Promise<void> {
  const { errors } = await getClient().models.MentorApplication.create({
    userId: params.userId,
    name: params.name,
    email: params.email,
    details: JSON.stringify(params.details),
    status: 'SUBMITTED'
  })
  if (errors?.length) fail(errors, 'Failed to submit application')
}

export interface MentorApplicationRecord {
  id: string
  userId?: string
  name: string
  email: string
  details: Record<string, unknown>
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export async function listMentorApplications(): Promise<MentorApplicationRecord[]> {
  const rows = await listAll('MentorApplication')
  return rows
    .map(r => {
      let details: Record<string, unknown> = {}
      try {
        details = typeof r.details === 'string' ? JSON.parse(r.details) : ((r.details as Record<string, unknown>) || {})
      } catch {
        details = {}
      }
      return {
        id: r.id as string,
        userId: (r.userId as string | null) ?? undefined,
        name: (r.name as string) || '',
        email: (r.email as string) || '',
        details,
        status: ((r.status as string) || 'SUBMITTED') as MentorApplicationRecord['status'],
        createdAt: (r.createdAt as string) || nowIso()
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function setMentorApplicationStatus(applicationId: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
  const { errors } = await getClient().models.MentorApplication.update({ id: applicationId, status })
  if (errors?.length) fail(errors, 'Failed to update the application')
}

export interface ContactMessageRecord {
  id: string
  userId?: string
  name: string
  email: string
  subject?: string
  message: string
  createdAt: string
}

export async function listContactMessages(): Promise<ContactMessageRecord[]> {
  return (await listAll('ContactMessage'))
    .map(r => ({
      id: r.id as string,
      userId: (r.userId as string | null) ?? undefined,
      name: (r.name as string) || '',
      email: (r.email as string) || '',
      subject: (r.subject as string | null) ?? undefined,
      message: (r.message as string) || '',
      createdAt: (r.createdAt as string) || nowIso()
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function deleteContactMessage(messageId: string): Promise<void> {
  const { errors } = await getClient().models.ContactMessage.delete({ id: messageId })
  if (errors?.length) fail(errors, 'Failed to delete the message')
}

export async function createContactMessage(params: { userId?: string; name: string; email: string; subject?: string; message: string }): Promise<void> {
  const { errors } = await getClient().models.ContactMessage.create(params)
  if (errors?.length) fail(errors, 'Failed to send message')
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
  const [byCreator, byAssignee] = await Promise.all([
    listAll('ActionPlan', { creatorId: { eq: creatorId } }),
    listAll('ActionPlan', { assigneeId: { eq: assigneeId } })
  ])
  const seen = new Set<string>()
  const out: ActionPlan[] = []
  for (const r of [...byCreator, ...byAssignee]) {
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
  const data = await listAll('ActionItem', { planId: { eq: planId } })
  return data.map(r => {
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

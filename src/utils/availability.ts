import type { MentorAvailability, Session } from '../types'

export const SLOT_STEP_MINUTES = 15
/** Minimum lead time for booking a slot on the current day. */
export const SAME_DAY_LEAD_MINUTES = 15

export const DEFAULT_AVAILABILITY_SLOTS: MentorAvailability['slots'] = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
]

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

const toLabel = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export const toLocalDateString = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/**
 * Start times ("HH:mm") a mentee can book on `dateStr` (local "YYYY-MM-DD") for a session of
 * `durationMinutes`: inside the mentor's weekly availability, not in the past, and not
 * overlapping any pending or confirmed session.
 */
export function computeAvailableSlots(
  availability: Pick<MentorAvailability, 'slots'>,
  mentorSessions: Pick<Session, 'date' | 'time' | 'duration' | 'status' | 'cancelledAt'>[],
  dateStr: string,
  durationMinutes = 60,
  now: Date = new Date()
): string[] {
  const dayOfWeek = new Date(`${dateStr}T00:00:00`).getDay()
  if (Number.isNaN(dayOfWeek)) return []
  const today = toLocalDateString(now)
  if (dateStr < today) return []
  const earliest = dateStr === today ? now.getHours() * 60 + now.getMinutes() + SAME_DAY_LEAD_MINUTES : 0

  const busy = mentorSessions
    .filter(s => (s.status === 'CONFIRMED' || s.status === 'PENDING') && !s.cancelledAt)
    .filter(s => s.date.slice(0, 10) === dateStr)
    .map(s => {
      const start = toMinutes(s.time && s.time.length >= 5 ? s.time.slice(0, 5) : s.date.slice(11, 16))
      return { start, end: start + (s.duration ?? 60) }
    })

  const starts = new Set<number>()
  for (const range of availability.slots.filter(s => s.dayOfWeek === dayOfWeek)) {
    const end = toMinutes(range.endTime)
    for (let start = toMinutes(range.startTime); start + durationMinutes <= end; start += SLOT_STEP_MINUTES) {
      if (start < earliest) continue
      const overlaps = busy.some(b => start < b.end && b.start < start + durationMinutes)
      if (!overlaps) starts.add(start)
    }
  }
  return [...starts].sort((a, b) => a - b).map(toLabel)
}

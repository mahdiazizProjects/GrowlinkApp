import { isValid } from 'date-fns'
import { Session } from '../types'

/** Single source of truth for session moment. session.date is stored as local ISO (no Z suffix) by toAppSession. */
export function getSessionDateTime(session: Session): Date | null {
  if (!session?.date) return null
  const dateStr = session.date
  if (dateStr.length >= 16 || dateStr.includes('T')) {
    const d = new Date(dateStr)
    return isValid(d) ? d : null
  }
  // Date-only (YYYY-MM-DD): combine with session.time as local time
  const timePart = session.time && session.time.length >= 4 ? session.time.slice(0, 5) : ''
  if (timePart) {
    const normalized = timePart.includes(':') ? timePart : `${timePart}:00`
    const combined = `${dateStr.slice(0, 10)}T${normalized}:00`
    const d = new Date(combined)
    return isValid(d) ? d : null
  }
  const d = new Date(dateStr + 'T00:00:00')
  return isValid(d) ? d : null
}

export function isUpcomingSession(session: Session, now = new Date()): boolean {
  const sessionDateTime = getSessionDateTime(session)
  return !!sessionDateTime && sessionDateTime.getTime() >= now.getTime()
}





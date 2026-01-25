import { isValid, parse } from 'date-fns'
import { Session } from '../types'

export function getSessionDateTime(session: Session): Date | null {
  if (session.date) {
    const fromIso = new Date(session.date)
    if (isValid(fromIso)) return fromIso
  }
  if (session.date && session.time) {
    const parsed = parse(`${session.date} ${session.time}`, 'yyyy-MM-dd h:mm a', new Date())
    if (isValid(parsed)) return parsed
  }
  return null
}

export function isUpcomingSession(session: Session, now = new Date()): boolean {
  const sessionDateTime = getSessionDateTime(session)
  return !!sessionDateTime && sessionDateTime.getTime() >= now.getTime()
}


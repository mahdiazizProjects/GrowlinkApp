import { isValid } from 'date-fns'
import { Session } from '../types'

/** Single place to derive session datetime: uses date (YYYY-MM-DD part) + time (HH:mm) when present, else full date string. */
export function getSessionDateTime(session: Session): Date | null {
  if (!session?.date) return null
  const datePart = session.date.slice(0, 10)
  const timePart = session.time && session.time.length >= 4 ? session.time.slice(0, 5) : ''
  if (timePart) {
    const normalized = timePart.includes(':') ? timePart : `${timePart}:00`
    const combined = `${datePart}T${normalized}:00`
    const d = new Date(combined)
    return isValid(d) ? d : null
  }
  const fromIso = new Date(session.date)
  return isValid(fromIso) ? fromIso : null
}

export function isUpcomingSession(session: Session, now = new Date()): boolean {
  const sessionDateTime = getSessionDateTime(session)
  return !!sessionDateTime && sessionDateTime.getTime() >= now.getTime()
}





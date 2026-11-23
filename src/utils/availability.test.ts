import { describe, expect, it } from 'vitest'
import { computeAvailableSlots, toLocalDateString } from './availability'

// 2030-01-07 is a Monday (dayOfWeek 1).
const MONDAY = '2030-01-07'
const weekday = { slots: [{ dayOfWeek: 1, startTime: '09:00', endTime: '11:00' }] }
const longAgo = new Date('2020-01-01T08:00:00')

describe('computeAvailableSlots', () => {
  it('offers 15-minute starts that fit inside the window', () => {
    expect(computeAvailableSlots(weekday, [], MONDAY, 60, longAgo)).toEqual([
      '09:00', '09:15', '09:30', '09:45', '10:00'
    ])
  })

  it('returns nothing on days without availability', () => {
    expect(computeAvailableSlots(weekday, [], '2030-01-08', 60, longAgo)).toEqual([])
  })

  it('never offers a slot that overlaps a pending or confirmed booking', () => {
    const booked = [{ date: `${MONDAY}T09:30:00`, time: '09:30', duration: 60, status: 'CONFIRMED' as const }]
    // 09:00 would run until 10:00 and collide with 09:30-10:30; 10:30 would not fit before 11:00.
    expect(computeAvailableSlots(weekday, booked, MONDAY, 60, longAgo)).toEqual([])
  })

  it('ignores cancelled and completed sessions', () => {
    const sessions = [
      { date: `${MONDAY}T09:00:00`, time: '09:00', duration: 60, status: 'CANCELLED' as const },
      { date: `${MONDAY}T10:00:00`, time: '10:00', duration: 60, status: 'COMPLETED' as const }
    ]
    expect(computeAvailableSlots(weekday, sessions, MONDAY, 60, longAgo)).toHaveLength(5)
  })

  it('treats a pending request that was cancelled as free', () => {
    const sessions = [{ date: `${MONDAY}T09:00:00`, time: '09:00', duration: 60, status: 'PENDING' as const, cancelledAt: '2029-12-01T00:00:00Z' }]
    expect(computeAvailableSlots(weekday, sessions, MONDAY, 60, longAgo)).toContain('09:00')
  })

  it('does not offer past dates', () => {
    expect(computeAvailableSlots(weekday, [], MONDAY, 60, new Date('2030-01-08T08:00:00'))).toEqual([])
  })

  it('applies a lead time on the current day', () => {
    const now = new Date(`${MONDAY}T09:20:00`)
    // Earliest bookable start is 09:35, so the first 15-minute step is 09:45.
    expect(computeAvailableSlots(weekday, [], MONDAY, 60, now)).toEqual(['09:45', '10:00'])
  })

  it('merges overlapping windows without duplicates', () => {
    const av = { slots: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '10:00' },
      { dayOfWeek: 1, startTime: '09:00', endTime: '10:30' }
    ] }
    expect(computeAvailableSlots(av, [], MONDAY, 60, longAgo)).toEqual(['09:00', '09:15', '09:30'])
  })
})

describe('toLocalDateString', () => {
  it('uses the local calendar day, not UTC', () => {
    expect(toLocalDateString(new Date(2030, 0, 7, 23, 30))).toBe('2030-01-07')
  })
})

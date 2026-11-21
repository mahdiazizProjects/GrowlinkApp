import { describe, expect, it } from 'vitest'
import { computeBadges, currentStreak, longestStreak } from './badges'
import type { HabitCompletion } from '../types'

const now = new Date(2030, 0, 10, 20, 0) // Jan 10, 8pm local

describe('currentStreak', () => {
  it('counts back from today', () => {
    expect(currentStreak(['2030-01-08', '2030-01-09', '2030-01-10'], now)).toBe(3)
  })

  it('keeps yesterday\'s streak alive until today ends', () => {
    expect(currentStreak(['2030-01-08', '2030-01-09'], now)).toBe(2)
  })

  it('resets after a missed day', () => {
    expect(currentStreak(['2030-01-07', '2030-01-08'], now)).toBe(0)
  })

  it('ignores duplicate entries on the same day', () => {
    expect(currentStreak(['2030-01-10', '2030-01-10', '2030-01-09'], now)).toBe(2)
  })
})

describe('longestStreak', () => {
  it('finds the longest run anywhere in history', () => {
    expect(longestStreak(['2030-01-01', '2030-01-02', '2030-01-05', '2030-01-06', '2030-01-07'])).toBe(3)
  })

  it('handles month boundaries', () => {
    expect(longestStreak(['2030-01-31', '2030-02-01'])).toBe(2)
  })
})

describe('computeBadges', () => {
  const completion = (date: string, userId = 'u1'): HabitCompletion => ({
    id: date + userId, habitId: 'h', userId, date, completed: true, createdAt: `${date}T10:00:00Z`
  })

  it('awards nothing without activity', () => {
    expect(computeBadges('u1', { completions: [], reflections: [], journeys: [] })).toEqual([])
  })

  it('awards first-step and 3-day streak badges', () => {
    const titles = computeBadges('u1', {
      completions: ['2030-01-01', '2030-01-02', '2030-01-03'].map(d => completion(d)),
      reflections: [],
      journeys: []
    }).map(b => b.title)
    expect(titles).toEqual(['First Step', '3-Day Streak'])
  })

  it('only counts the given user\'s activity', () => {
    const badges = computeBadges('u1', { completions: [completion('2030-01-01', 'someone-else')], reflections: [], journeys: [] })
    expect(badges).toEqual([])
  })
})

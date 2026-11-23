import type { Badge, HabitCompletion, Journey, Reflection } from '../types'
import { toLocalDateString } from './availability'

/** Longest run of consecutive calendar days present in `dates` ("YYYY-MM-DD"). */
export function longestStreak(dates: string[]): number {
  const days = [...new Set(dates.map(d => d.slice(0, 10)))].sort()
  let best = 0
  let run = 0
  let prev: number | null = null
  for (const d of days) {
    const t = Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10))
    run = prev !== null && t - prev === 86400000 ? run + 1 : 1
    best = Math.max(best, run)
    prev = t
  }
  return best
}

/** Consecutive days with at least one entry, counting back from today (or yesterday). */
export function currentStreak(dates: string[], now: Date = new Date()): number {
  const set = new Set(dates.map(d => d.slice(0, 10)))
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!set.has(toLocalDateString(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (set.has(toLocalDateString(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Badges are derived from real activity rather than stored, so they can never drift out of sync. */
export function computeBadges(
  userId: string,
  data: { completions: HabitCompletion[]; reflections: Reflection[]; journeys: Journey[] }
): Badge[] {
  const completions = data.completions.filter(c => c.userId === userId && c.completed)
  const reflections = data.reflections.filter(r => r.userId === userId)
  const journeys = data.journeys.filter(j => j.userId === userId)
  const badges: Badge[] = []
  const add = (type: Badge['type'], key: string, title: string, description: string, icon: string, earnedAt?: string) =>
    badges.push({ id: `${userId}-${key}`, userId, type, title, description, icon, earnedAt: earnedAt || new Date().toISOString() })

  const byDate = [...completions].sort((a, b) => a.date.localeCompare(b.date))
  if (completions.length >= 1) add('milestone', 'first-habit', 'First Step', 'Completed your first habit', '🌱', byDate[0]?.createdAt)
  if (completions.length >= 25) add('milestone', 'habits-25', '25 Reps', 'Completed 25 habit check-ins', '💪', byDate[24]?.createdAt)
  const streak = longestStreak(completions.map(c => c.date))
  if (streak >= 3) add('streak', 'streak-3', '3-Day Streak', 'Kept a habit going three days in a row', '🔥')
  if (streak >= 7) add('consistency', 'streak-7', 'One Week Strong', 'Seven days in a row', '🏅')
  if (streak >= 30) add('consistency', 'streak-30', '30-Day Streak', 'A full month of consistency', '🏆')
  if (reflections.length >= 1) add('reflection', 'first-reflection', 'Reflector', 'Wrote your first reflection', '📝', reflections[0]?.createdAt)
  if (reflections.length >= 10) add('reflection', 'reflections-10', 'Deep Thinker', 'Wrote ten reflections', '🧠')
  if (journeys.length >= 1) add('identity-builder', 'first-journey', 'Storyteller', 'Shared your first journey post', '✨', journeys[journeys.length - 1]?.createdAt)
  return badges
}

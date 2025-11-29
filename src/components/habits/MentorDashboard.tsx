import { useMemo } from 'react'
import { Users, TrendingUp, MessageSquare, Target } from 'lucide-react'
import { Goal, Habit, HabitCompletion, Reflection, User } from '../../types'
import ProgressRingChart from './ProgressRingChart'
import { startOfWeek, endOfWeek, parseISO } from 'date-fns'

interface MentorDashboardProps {
  mentees: User[]
  goals: Goal[]
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  reflections: Reflection[]
}

export default function MentorDashboard({
  mentees,
  goals,
  habits,
  habitCompletions,
  reflections
}: MentorDashboardProps) {
  const menteeStats = useMemo(() => {
    return mentees.map(mentee => {
      const menteeGoals = goals.filter(g => g.userId === mentee.id && g.status === 'active')
      const menteeHabits = habits.filter(h => menteeGoals.some(g => g.id === h.goalId))
      const menteeCompletions = habitCompletions.filter(c => c.userId === mentee.id && c.completed)

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

      const weekCompletions = menteeCompletions.filter(c => {
        const completionDate = parseISO(c.date)
        return completionDate >= weekStart && completionDate <= weekEnd
      }).length

      const totalDays = menteeHabits.length * 7
      const completionRate = totalDays > 0 ? (weekCompletions / totalDays) * 100 : 0

      const menteeReflections = reflections.filter(r => r.userId === mentee.id)
      const recentReflections = menteeReflections.slice(-3)

      return {
        mentee,
        goals: menteeGoals.length,
        habits: menteeHabits.length,
        completionRate,
        weekCompletions,
        totalCompletions: menteeCompletions.length,
        reflections: menteeReflections.length,
        recentReflections
      }
    })
  }, [mentees, goals, habits, habitCompletions, reflections])

  const overallStats = useMemo(() => {
    const totalMentees = mentees.length
    const totalGoals = goals.filter(g => g.status === 'active').length
    const totalHabits = habits.filter(h => h.status === 'active').length
    const avgCompletionRate = menteeStats.length > 0
      ? menteeStats.reduce((sum, s) => sum + s.completionRate, 0) / menteeStats.length
      : 0
    const pendingReflections = reflections.filter(r => !r.mentorFeedback).length

    return {
      totalMentees,
      totalGoals,
      totalHabits,
      avgCompletionRate,
      pendingReflections
    }
  }, [mentees, goals, habits, reflections, menteeStats])

  const getReflectionContent = (reflection: Reflection) => {
    if (!reflection.content) return 'No content'
    if (typeof reflection.content === 'string') return reflection.content
    return reflection.content.whatWentWell || reflection.content.insights || 'No content'
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-primary-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">{overallStats.totalMentees}</div>
              <div className="text-sm text-gray-600">Active Mentees</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-green-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">{overallStats.totalGoals}</div>
              <div className="text-sm text-gray-600">Active Goals</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(overallStats.avgCompletionRate)}%</div>
              <div className="text-sm text-gray-600">Avg Completion</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-purple-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">{overallStats.pendingReflections}</div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mentee Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mentee Overview</h2>
        <div className="space-y-4">
          {menteeStats.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No mentees yet</p>
          ) : (
            menteeStats.map(({ mentee, goals, habits, completionRate, weekCompletions, reflections, recentReflections }) => (
              <div key={mentee.id} className="border-2 border-gray-200 rounded-lg p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                      {mentee.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mentee.name}</h3>
                      <p className="text-sm text-gray-600">{mentee.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <ProgressRingChart progress={completionRate} size={60} />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Goals</p>
                    <p className="text-lg font-semibold text-gray-900">{goals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Habits</p>
                    <p className="text-lg font-semibold text-gray-900">{habits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-lg font-semibold text-gray-900">{weekCompletions} completed</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reflections</p>
                    <p className="text-lg font-semibold text-gray-900">{reflections}</p>
                  </div>
                </div>

                {recentReflections.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Recent Reflections:</p>
                    <div className="space-y-2">
                      {recentReflections.map(reflection => (
                        <div key={reflection.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {getReflectionContent(reflection)}
                          </p>
                          {!reflection.mentorFeedback && (
                            <button className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-semibold">
                              Add Feedback →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 AI Insights</h3>
        <p className="text-gray-700">
          {overallStats.avgCompletionRate > 70
            ? "Great progress! Your mentees are maintaining strong consistency. Consider suggesting new challenges."
            : overallStats.avgCompletionRate > 40
              ? "Good momentum! Some mentees may benefit from habit adjustments or additional support."
              : "Early stage. Focus on building foundational habits and providing encouragement."}
        </p>
      </div>
    </div>
  )
}

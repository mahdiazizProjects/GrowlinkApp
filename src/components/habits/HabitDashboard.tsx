import { useState, useMemo } from 'react'
import { Check, X, TrendingUp, Flame, Target } from 'lucide-react'
import { Habit, HabitCompletion } from '../../types'
import ProgressRingChart from './ProgressRingChart'
import { format, isToday, parseISO, startOfWeek, endOfWeek } from 'date-fns'

interface HabitDashboardProps {
  habits: Habit[]
  completions: HabitCompletion[]
  onToggleCompletion: (habitId: string, date: string) => void
}

export default function HabitDashboard({ habits, completions, onToggleCompletion }: HabitDashboardProps) {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0])
  
  const activeHabits = habits.filter(h => h.status === 'active')
  const today = new Date().toISOString().split('T')[0]

  // Calculate progress for each habit
  const habitProgress = useMemo(() => {
    return activeHabits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id && c.completed)
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
      
      const weekCompletions = habitCompletions.filter(c => {
        const completionDate = parseISO(c.date)
        return completionDate >= weekStart && completionDate <= weekEnd
      }).length

      const totalDays = habit.frequency === 'daily' ? 7 : 1
      const completionRate = totalDays > 0 ? (weekCompletions / totalDays) * 100 : 0

      // Calculate streak
      const sortedCompletions = habitCompletions
        .map(c => c.date)
        .sort()
        .reverse()
      
      let currentStreak = 0
      let checkDate = new Date()
      
      if (sortedCompletions.length > 0) {
        const lastDate = parseISO(sortedCompletions[0])
        if (isToday(lastDate) || lastDate < checkDate) {
          for (let i = 0; i < sortedCompletions.length; i++) {
            const completionDate = parseISO(sortedCompletions[i])
            const expectedDate = new Date(checkDate)
            expectedDate.setDate(expectedDate.getDate() - i)
            
            if (format(completionDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
              currentStreak++
            } else {
              break
            }
          }
        }
      }

      return {
        habit,
        completionRate,
        weekCompletions,
        currentStreak,
        totalCompletions: habitCompletions.length
      }
    })
  }, [activeHabits, completions])

  const isCompleted = (habitId: string, date: string) => {
    return completions.some(c => c.habitId === habitId && c.date === date && c.completed)
  }

  const overallProgress = habitProgress.length > 0
    ? habitProgress.reduce((sum, p) => sum + p.completionRate, 0) / habitProgress.length
    : 0

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border-2 border-primary-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">1% Growth Dashboard</h2>
            <p className="text-gray-600">Small steps, big progress</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary-700">{Math.round(overallProgress)}%</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
        </div>
        <ProgressRingChart progress={overallProgress} size={120} />
        <div className="mt-4 text-sm text-gray-700">
          <p className="font-semibold">💡 Compound Growth:</p>
          <p>+1% per day = 37x improvement per year!</p>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {activeHabits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Target className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Habits Yet</h3>
            <p className="text-gray-600">Create your first 1% action plan to get started!</p>
          </div>
        ) : (
          habitProgress.map(({ habit, completionRate, currentStreak, weekCompletions }) => {
            const completed = isCompleted(habit.id, selectedDate)
            const isSelectedToday = selectedDate === today

            return (
              <div key={habit.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{habit.title}</h3>
                      {currentStreak > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          <Flame size={14} />
                          {currentStreak} day streak
                        </div>
                      )}
                    </div>
                    {habit.description && (
                      <p className="text-sm text-gray-600 mb-2">{habit.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{habit.frequency === 'daily' ? 'Daily' : 'Weekly'}</span>
                      <span>•</span>
                      <span>{habit.duration} min</span>
                      {habit.cue?.time && (
                        <>
                          <span>•</span>
                          <span>⏰ {habit.cue.time}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <ProgressRingChart progress={completionRate} size={60} />
                  </div>
                </div>

                {/* Completion Toggle */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        {isSelectedToday ? 'Today' : format(parseISO(selectedDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {weekCompletions} of {habit.frequency === 'daily' ? 7 : 1} completed this week
                      </p>
                    </div>
                    <button
                      onClick={() => onToggleCompletion(habit.id, selectedDate)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                        completed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {completed ? (
                        <>
                          <Check size={18} />
                          Completed
                        </>
                      ) : (
                        <>
                          <X size={18} />
                          Mark Complete
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Cue Display */}
                {(habit.cue?.time || habit.cue?.place || habit.cue?.context) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Cue:</p>
                    <p className="text-sm text-blue-800">
                      {[habit.cue.time, habit.cue.place, habit.cue.context]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Motivation Widget */}
      {activeHabits.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Keep Going!</h3>
          </div>
          <p className="text-gray-700">
            You're making progress. Every small action compounds into meaningful change. 
            Consistency beats intensity every time.
          </p>
        </div>
      )}
    </div>
  )
}


import { Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext'
import HabitDashboard from '../components/habits/HabitDashboard'

export default function Habits() {
  const { currentUser, goals, habits, habitCompletions, toggleHabitCompletion } = useApp()

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to track your habits.</p>
        </div>
      </div>
    )
  }

  // Get habits for user's goals
  const userGoals = goals.filter(g => g.userId === currentUser.id)
  const userHabits = habits.filter(h => userGoals.some(g => g.id === h.goalId))
  const userCompletions = habitCompletions.filter(c => c.userId === currentUser.id)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-primary-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Habit Tracker</h1>
          </div>
          <p className="text-gray-600">Track your 1% improvements daily</p>
        </div>

        <HabitDashboard
          habits={userHabits}
          completions={userCompletions}
          onToggleCompletion={toggleHabitCompletion}
        />
      </div>
    </div>
  )
}


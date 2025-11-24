import { useState } from 'react'
import { Plus, Target, CheckCircle, Clock, Edit } from 'lucide-react'
import { useApp } from '../context/AppContext'
import IdentityBuilderModal from '../components/habits/IdentityBuilderModal'
import ActionPlanBuilder from '../components/habits/ActionPlanBuilder'
import { Goal, Habit } from '../types'

export default function Goals() {
  const { currentUser, goals, habits, addGoal, updateGoal, addHabit } = useApp()
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showActionPlan, setShowActionPlan] = useState(false)

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view your goals.</p>
        </div>
      </div>
    )
  }

  const userGoals = goals.filter(g => g.userId === currentUser.id)
  const activeGoals = userGoals.filter(g => g.status === 'active')
  const draftGoals = userGoals.filter(g => g.status === 'draft')
  const pendingGoals = userGoals.filter(g => g.status === 'pending-approval')

  const handleCreateGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addGoal(newGoal)
  }

  const handleSaveActionPlan = (habitsData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    habitsData.forEach(habitData => {
      const newHabit: Habit = {
        ...habitData,
        id: `habit-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      addHabit(newHabit)
    })
    
    if (selectedGoal) {
      updateGoal(selectedGoal.id, { status: 'active' })
    }
    setShowActionPlan(false)
    setSelectedGoal(null)
  }

  const handleCreateActionPlan = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowActionPlan(true)
  }

  const getGoalHabits = (goalId: string) => {
    return habits.filter(h => h.goalId === goalId)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Goals</h1>
            <p className="text-gray-600">Identity-based goals for meaningful growth</p>
          </div>
          <button
            onClick={() => setIsIdentityModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            New Goal
          </button>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={24} />
              Active Goals
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {activeGoals.map(goal => {
                const goalHabits = getGoalHabits(goal.id)
                return (
                  <div key={goal.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-primary-700 italic mb-3">{goal.identity}</p>
                      {goal.description && (
                        <p className="text-gray-600 text-sm">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        {goalHabits.length} habit{goalHabits.length !== 1 ? 's' : ''} defined
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreateActionPlan(goal)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                        >
                          Manage Habits
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pending Approval */}
        {pendingGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="text-amber-600" size={24} />
              Pending Mentor Approval
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pendingGoals.map(goal => (
                <div key={goal.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-primary-700 italic">{goal.identity}</p>
                  </div>
                  <p className="text-sm text-gray-600">Waiting for mentor review...</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draft Goals */}
        {draftGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Edit className="text-gray-600" size={24} />
              Draft Goals
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {draftGoals.map(goal => {
                const goalHabits = getGoalHabits(goal.id)
                return (
                  <div key={goal.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          Draft
                        </span>
                      </div>
                      <p className="text-sm text-primary-700 italic mb-3">{goal.identity}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        {goalHabits.length === 0 ? 'No habits yet' : `${goalHabits.length} habit${goalHabits.length !== 1 ? 's' : ''}`}
                      </div>
                      <div className="flex gap-2">
                        {goalHabits.length === 0 ? (
                          <button
                            onClick={() => handleCreateActionPlan(goal)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                          >
                            Create Action Plan
                          </button>
                        ) : (
                          <button
                            onClick={() => updateGoal(goal.id, { status: 'pending-approval' })}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                          >
                            Submit for Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userGoals.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Target className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Goals Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your journey by defining who you want to become
            </p>
            <button
              onClick={() => setIsIdentityModalOpen(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}

        {/* Modals */}
        <IdentityBuilderModal
          isOpen={isIdentityModalOpen}
          onClose={() => setIsIdentityModalOpen(false)}
          onSubmit={handleCreateGoal}
        />

        {selectedGoal && showActionPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="max-w-4xl w-full my-8">
              <ActionPlanBuilder
                goal={selectedGoal}
                existingHabits={getGoalHabits(selectedGoal.id)}
                onSave={handleSaveActionPlan}
                onClose={() => {
                  setShowActionPlan(false)
                  setSelectedGoal(null)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { Plus, Target, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'
import IdentityBuilderModal from '../components/habits/IdentityBuilderModal'
import ActionPlanBuilder from '../components/habits/ActionPlanBuilder'
import { Goal, Habit } from '../types'
import { useToast, errorMessage } from '../components/ui/Toast'

type HabitDraft = Omit<Habit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; actionItemId?: string }

export default function Goals() {
  const { currentUser, goals, habits, addGoal, updateGoal, removeGoal, addHabit, updateHabit, removeHabit } = useApp()
  const toast = useToast()
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showActionPlan, setShowActionPlan] = useState(false)
  const [goalActionPlans, setGoalActionPlans] = useState<Record<string, string>>({}) // goalId -> actionPlanId

  // Fetch action plans for user's goals
  useEffect(() => {
    const fetchActionPlans = async () => {
      if (!currentUser?.id) return
      
      try {
        const actionPlans = await api.listActionPlans(currentUser.id, currentUser.id)
        const plansMap: Record<string, string> = {}
        const unmatchedPlans: Array<{ plan: { id: string }; items: { title: string }[] }> = []
        
        // First pass: Match action plans to goals by title pattern
        for (const plan of actionPlans) {
          const match = plan.title?.match(/Action Plan for: (.+)/)
          if (match) {
            const goalTitle = match[1]
            const goal = goals.find(g => g.title === goalTitle && g.userId === currentUser.id)
            if (goal) {
              plansMap[goal.id] = plan.id
            } else {
              // Plan doesn't match by title, store for fallback matching
              try {
                const items = await api.listActionItems(plan.id)
                unmatchedPlans.push({ plan, items })
              } catch (error) {
                console.error('Error fetching items for plan:', plan.id, error)
              }
            }
          } else {
            // Plan title doesn't match pattern, store for fallback matching
            try {
              const items = await api.listActionItems(plan.id)
              unmatchedPlans.push({ plan, items })
            } catch (error) {
              console.error('Error fetching items for plan:', plan.id, error)
            }
          }
        }
        
        // Fallback: For goals with habits but no matched action plan, 
        // try to find action plans by checking their action items
        for (const goal of goals) {
          if (!plansMap[goal.id] && goal.userId === currentUser.id) {
            const goalHabits = habits.filter(h => h.goalId === goal.id)
            if (goalHabits.length > 0) {
              // Try to find an action plan by checking if any plan's items match this goal's habits
              for (const { plan, items } of unmatchedPlans) {
                if (!plansMap[goal.id]) {
                  const hasMatchingItems = items.some(item => 
                    goalHabits.some(habit => habit.title === item.title)
                  )
                  if (hasMatchingItems) {
                    plansMap[goal.id] = plan.id
                    break // Found a match, move to next goal
                  }
                }
              }
            }
          }
        }
        
        setGoalActionPlans(plansMap)
      } catch (error) {
        console.error('Error fetching action plans:', error)
      }
    }
    
    fetchActionPlans()
  }, [currentUser?.id, goals, habits])

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

  const handleCreateGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await addGoal({ ...goalData, id: '', userId: currentUser.id })
    if (created) toast.success('Goal created. Add an action plan to make it active.')
  }

  const forgetPlan = (goalId: string) => {
    setGoalActionPlans(prev => {
      const updated = { ...prev }
      delete updated[goalId]
      return updated
    })
  }

  /** Keeps the goal's ActionPlan/ActionItems in step with its habits. Returns the plan id, if one remains. */
  const syncActionPlan = async (goal: Goal, habitsData: HabitDraft[], existingActionPlanId?: string): Promise<string | undefined> => {
    const toItem = (h: HabitDraft) => ({
      title: h.title,
      description: h.description,
      type: 'DO' as const,
      frequency: h.frequency === 'weekly' ? 'WEEKLY' as const : 'DAILY' as const,
      status: 'ACTIVE' as const
    })

    if (habitsData.length === 0) {
      if (existingActionPlanId) await api.deleteActionPlan(existingActionPlanId)
      return undefined
    }

    if (!existingActionPlanId) {
      const plan = await api.createActionPlan({
        creatorId: currentUser.id,
        assigneeId: currentUser.id,
        title: `Action Plan for: ${goal.title}`,
        description: `Action plan for goal: ${goal.title}`,
        status: 'ACTIVE'
      })
      await Promise.all(habitsData.map(h => api.createActionItem({ planId: plan.id, ...toItem(h) })))
      return plan.id
    }

    const existingItems = await api.listActionItems(existingActionPlanId)
    const kept = new Set<string>()
    for (const h of habitsData) {
      const match =
        existingItems.find(i => i.id === h.actionItemId && !kept.has(i.id)) ||
        existingItems.find(i => i.title === h.title && !kept.has(i.id))
      if (match) {
        kept.add(match.id)
        await api.updateActionItem(match.id, toItem(h))
      } else {
        await api.createActionItem({ planId: existingActionPlanId, ...toItem(h) })
      }
    }
    await Promise.all(existingItems.filter(i => !kept.has(i.id)).map(i => api.deleteActionItem(i.id)))
    return existingActionPlanId
  }

  const handleSaveActionPlan = async (habitsData: HabitDraft[], existingActionPlanId?: string) => {
    if (!selectedGoal) return
    const goal = selectedGoal
    if (habitsData.length === 0 && !existingActionPlanId && getGoalHabits(goal.id).length === 0) {
      toast.error('Add at least one habit with a title and duration.')
      return
    }

    try {
      // 1. Habit records are what the habit tracker reads.
      const current = getGoalHabits(goal.id)
      const kept = new Set<string>()
      for (const h of habitsData) {
        const { id, actionItemId: _actionItemId, ...fields } = h
        const match =
          current.find(c => c.id === id && !kept.has(c.id)) ||
          current.find(c => c.title === h.title && !kept.has(c.id))
        if (match) {
          kept.add(match.id)
          await updateHabit(match.id, fields)
        } else {
          const created = await addHabit({ ...fields, userId: currentUser.id, id: '', createdAt: '', updatedAt: '' })
          if (!created) throw new Error('A habit could not be saved.')
          kept.add(created.id)
        }
      }
      await Promise.all(current.filter(c => !kept.has(c.id)).map(c => removeHabit(c.id)))

      // 2. Mirror into the action plan.
      const planId = await syncActionPlan(goal, habitsData, existingActionPlanId)
      if (planId) setGoalActionPlans(prev => ({ ...prev, [goal.id]: planId }))
      else forgetPlan(goal.id)

      // 3. A goal is active once it has a plan, and a draft again without one.
      const nextStatus = habitsData.length > 0 ? 'active' : 'draft'
      if (goal.status !== nextStatus) await updateGoal(goal.id, { status: nextStatus })

      setShowActionPlan(false)
      setSelectedGoal(null)
      toast.success(habitsData.length > 0 ? 'Action plan saved.' : 'Action plan removed.')
    } catch (error) {
      console.error('Error saving action plan:', error)
      toast.error(errorMessage(error, 'Could not save the action plan.'))
    }
  }

  const handleCreateActionPlan = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowActionPlan(true)
  }

  const deletePlanAndHabits = async (goal: Goal, actionPlanId?: string) => {
    if (actionPlanId) await api.deleteActionPlan(actionPlanId)
    await Promise.all(getGoalHabits(goal.id).map(h => removeHabit(h.id)))
    forgetPlan(goal.id)
    if (goal.status !== 'draft') await updateGoal(goal.id, { status: 'draft' })
  }

  const handleDeleteActionPlan = async (goal: Goal) => {
    if (!confirm('Delete this action plan? This removes all habits for this goal and their history.')) {
      return
    }
    try {
      await deletePlanAndHabits(goal, goalActionPlans[goal.id])
      toast.success('Action plan deleted.')
    } catch (error) {
      console.error('Error deleting action plan:', error)
      toast.error(errorMessage(error, 'Could not delete the action plan.'))
    }
  }

  const handleDeleteGoal = async (goal: Goal) => {
    if (!confirm(`Delete the goal "${goal.title}"? This also deletes its action plan and habits.`)) {
      return
    }
    try {
      const actionPlanId = goalActionPlans[goal.id]
      if (actionPlanId) await api.deleteActionPlan(actionPlanId)
      const removed = await removeGoal(goal.id)
      if (removed) {
        forgetPlan(goal.id)
        toast.success('Goal deleted.')
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error(errorMessage(error, 'Could not delete the goal.'))
    }
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
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Active
                          </span>
                          <button
                            onClick={() => handleDeleteGoal(goal)}
                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                            title="Delete goal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
                        {(goalActionPlans[goal.id] || goalHabits.length > 0) && (
                          <button
                            onClick={() => handleDeleteActionPlan(goal)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Delete Plan
                          </button>
                        )}
                        <button
                          onClick={() => handleCreateActionPlan(goal)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                        >
                          {goalActionPlans[goal.id] || goalHabits.length > 0 ? 'Edit Habits' : 'Add Habits'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
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
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            Draft
                          </span>
                          <button
                            onClick={() => handleDeleteGoal(goal)}
                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                            title="Delete goal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-primary-700 italic mb-3">{goal.identity}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        {goalHabits.length === 0 ? 'No habits yet' : `${goalHabits.length} habit${goalHabits.length !== 1 ? 's' : ''}`}
                      </div>
                      <div className="flex gap-2">
                        {(goalActionPlans[goal.id] || goalHabits.length > 0) && (
                          <button
                            onClick={() => handleDeleteActionPlan(goal)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Delete Plan
                          </button>
                        )}
                        <button
                          onClick={() => handleCreateActionPlan(goal)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                        >
                          {goalHabits.length === 0 ? 'Create Action Plan' : 'Edit Action Plan'}
                        </button>
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
                existingActionPlanId={goalActionPlans[selectedGoal.id]}
                onSave={handleSaveActionPlan}
                onDelete={async (actionPlanId) => {
                  try {
                    await deletePlanAndHabits(selectedGoal, actionPlanId)
                    toast.success('Action plan deleted.')
                    setShowActionPlan(false)
                    setSelectedGoal(null)
                  } catch (error) {
                    console.error('Error deleting action plan:', error)
                    toast.error(errorMessage(error, 'Could not delete the action plan.'))
                  }
                }}
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


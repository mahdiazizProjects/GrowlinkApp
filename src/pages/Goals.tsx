import { useState, useEffect } from 'react'
import { Plus, Target, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'
import IdentityBuilderModal from '../components/habits/IdentityBuilderModal'
import ActionPlanBuilder from '../components/habits/ActionPlanBuilder'
import { Goal, Habit } from '../types'

export default function Goals() {
  const { currentUser, goals, habits, addGoal, updateGoal, removeGoal, addHabit } = useApp()
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showActionPlan, setShowActionPlan] = useState(false)
  const [goalActionPlans, setGoalActionPlans] = useState<Record<string, string>>({}) // goalId -> actionPlanId

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

  // Fetch action plans for user's goals
  useEffect(() => {
    const fetchActionPlans = async () => {
      if (!currentUser?.id) return
      
      try {
        const actionPlans = await api.listActionPlans(currentUser.id, currentUser.id)
        const plansMap: Record<string, string> = {}
        const unmatchedPlans: Array<{ plan: any; items: any[] }> = []
        
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

  const userGoals = goals.filter(g => g.userId === currentUser.id)
  const activeGoals = userGoals.filter(g => g.status === 'active')
  const draftGoals = userGoals.filter(g => g.status === 'draft')

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

  const handleSaveActionPlan = async (habitsData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>[], existingActionPlanId?: string) => {
    console.log('Goals: handleSaveActionPlan called with', habitsData.length, 'habits', existingActionPlanId ? '(editing)' : '(creating)')
    
    if (habitsData.length === 0) {
      alert('Please add at least one habit with a title and duration')
      return
    }

    if (!currentUser?.id || !selectedGoal) {
      alert('Please sign in and select a goal')
      return
    }

    try {
      let actionPlanId: string
      
      if (existingActionPlanId) {
        // Update existing action plan
        actionPlanId = existingActionPlanId
        console.log('Goals: Updating existing action plan', actionPlanId)
        
        // Get existing action items
        const existingItems = await api.listActionItems(actionPlanId)
        const existingItemMap = new Map(existingItems.map(item => [item.id, item]))
        const existingItemIds = new Set(existingItems.map(item => item.id))
        
        // Track which items are being kept (matched by actionItemId)
        const keptItemIds = new Set<string>()
        
        // Update or create action items
        const updatePromises = habitsData.map(async (habitData) => {
          // Check if this habit has an actionItemId (from existing plan)
          const habitWithId = habitData as any
          const actionItemId = habitWithId.actionItemId
          
          if (actionItemId && existingItemMap.has(actionItemId)) {
            // Update existing item
            await api.updateActionItem(actionItemId, {
              title: habitData.title,
              description: habitData.description,
              type: 'DO',
              frequency: habitData.frequency === 'weekly' ? 'WEEKLY' : 'DAILY',
              status: 'ACTIVE',
            })
            keptItemIds.add(actionItemId)
          } else {
            // Create new item
            await api.createActionItem({
              planId: actionPlanId,
              title: habitData.title,
              description: habitData.description,
              type: 'DO',
              frequency: habitData.frequency === 'weekly' ? 'WEEKLY' : 'DAILY',
              status: 'ACTIVE',
            })
          }
        })
        
        await Promise.all(updatePromises)
        
        // Delete items that were removed (not in keptItemIds)
        const itemsToDelete = Array.from(existingItemIds).filter(id => !keptItemIds.has(id))
        if (itemsToDelete.length > 0) {
          console.log('Goals: Deleting', itemsToDelete.length, 'removed action items')
          const deletePromises = itemsToDelete.map(itemId => 
            api.deleteActionItem(itemId)
          )
          await Promise.all(deletePromises)
        }
        
        // If all habits were removed (no habits saved), delete the entire plan
        if (habitsData.length === 0) {
          console.log('Goals: All habits removed, deleting entire action plan')
          await api.deleteActionPlan(actionPlanId)
          setGoalActionPlans(prev => {
            const updated = { ...prev }
            delete updated[selectedGoal.id]
            return updated
          })
          setShowActionPlan(false)
          setSelectedGoal(null)
          alert('Action plan deleted successfully!')
          return
        }
        
        // Also check: if we kept no items and created no new items, the plan is empty - delete it
        // This handles the case where user removes all habits but the check above didn't catch it
        const remainingItems = await api.listActionItems(actionPlanId)
        if (remainingItems.length === 0) {
          console.log('Goals: Action plan has no items, deleting entire plan')
          await api.deleteActionPlan(actionPlanId)
          setGoalActionPlans(prev => {
            const updated = { ...prev }
            delete updated[selectedGoal.id]
            return updated
          })
          setShowActionPlan(false)
          setSelectedGoal(null)
          alert('Action plan deleted successfully!')
          return
        }
        
      } else {
        // Create new action plan
        const actionPlanTitle = `Action Plan for: ${selectedGoal.title}`
        const actionPlan = await api.createActionPlan({
          creatorId: currentUser.id,
          assigneeId: currentUser.id,
          title: actionPlanTitle,
          description: `Action plan for goal: ${selectedGoal.title}`,
          status: 'ACTIVE',
        })
        
        if (!actionPlan) {
          throw new Error('Failed to create action plan')
        }
        
        actionPlanId = actionPlan.id
        console.log('Goals: ActionPlan created', actionPlan)

        // Create ActionItems for each habit
        const actionItemPromises = habitsData.map(async (habitData) => {
          const actionItem = await api.createActionItem({
            planId: actionPlanId,
            title: habitData.title,
            description: habitData.description,
            type: 'DO',
            frequency: habitData.frequency === 'weekly' ? 'WEEKLY' : 'DAILY',
            status: 'ACTIVE',
          })
          return actionItem
        })
        
        await Promise.all(actionItemPromises)
        
        // Update goal action plans map
        setGoalActionPlans(prev => ({
          ...prev,
          [selectedGoal.id]: actionPlanId
        }))
      }

      // Also create/update habits (stored as Todos) for backward compatibility
      const habitPromises = habitsData.map(async (habitData, index) => {
        const existingHabit = habits.find(h => h.goalId === selectedGoal.id && h.title === habitData.title)
        if (existingHabit) {
          // Update existing habit if needed
          return existingHabit
        } else {
          // Create new habit
          const newHabit: Habit & { userId?: string } = {
            ...habitData,
            userId: currentUser.id,
            id: `habit-${Date.now()}-${index}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          return addHabit(newHabit as Habit)
        }
      })
      
      await Promise.all(habitPromises)
      
      // Update goal status if needed
      if (selectedGoal.status === 'draft') {
        console.log('Goals: Updating goal status to active')
        await updateGoal(selectedGoal.id, { status: 'active' })
      }
      
      setShowActionPlan(false)
      setSelectedGoal(null)
      alert('Action plan saved successfully!')
    } catch (error) {
      console.error('Error saving action plan:', error)
      alert('Failed to save action plan: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleCreateActionPlan = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowActionPlan(true)
  }

  const handleDeleteActionPlan = async (goal: Goal) => {
    const actionPlanId = goalActionPlans[goal.id]
    console.log('handleDeleteActionPlan: Goal', goal.id, 'Action Plan ID', actionPlanId)
    
    if (!actionPlanId) {
      console.warn('handleDeleteActionPlan: No action plan ID found for goal', goal.id)
      alert('No action plan found to delete')
      return
    }

    if (!confirm('Are you sure you want to delete this action plan? This will remove all habits associated with it.')) {
      return
    }

    try {
      console.log('handleDeleteActionPlan: Calling deleteActionPlan with ID', actionPlanId)
      const success = await api.deleteActionPlan(actionPlanId)
      console.log('handleDeleteActionPlan: Delete result', success)
      
      if (success) {
        // Remove from goal action plans map
        setGoalActionPlans(prev => {
          const updated = { ...prev }
          delete updated[goal.id]
          console.log('handleDeleteActionPlan: Removed from goalActionPlans map')
          return updated
        })
        
        // Note: Habits are stored separately and will be cleaned up when the action plan is deleted
        // The habits array in context is for backward compatibility with Todo model
        
        alert('Action plan deleted successfully!')
      } else {
        throw new Error('Failed to delete action plan - API returned false')
      }
    } catch (error) {
      console.error('Error deleting action plan:', error)
      alert('Failed to delete action plan: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteGoal = async (goal: Goal) => {
    if (!confirm(`Are you sure you want to delete the goal "${goal.title}"? This will also delete any associated action plans and habits.`)) {
      return
    }

    try {
      // First, delete associated action plan if it exists
      const actionPlanId = goalActionPlans[goal.id]
      if (actionPlanId) {
        console.log('handleDeleteGoal: Deleting associated action plan', actionPlanId)
        await api.deleteActionPlan(actionPlanId)
      }

      // Then delete the goal
      console.log('handleDeleteGoal: Deleting goal', goal.id)
      const success = await api.deleteGoal(goal.id)
      
      if (success) {
        // Remove from goal action plans map
        if (actionPlanId) {
          setGoalActionPlans(prev => {
            const updated = { ...prev }
            delete updated[goal.id]
            return updated
          })
        }
        
        // Remove goal from context (this will also remove associated habits)
        await removeGoal(goal.id)
        
        alert('Goal deleted successfully!')
      } else {
        throw new Error('Failed to delete goal')
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('Failed to delete goal: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
                        {goalActionPlans[goal.id] && (
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
                          {goalActionPlans[goal.id] ? 'Edit Habits' : 'Manage Habits'}
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
                        {goalActionPlans[goal.id] && (
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
                    const success = await api.deleteActionPlan(actionPlanId)
                    if (success) {
                      setGoalActionPlans(prev => {
                        const updated = { ...prev }
                        delete updated[selectedGoal.id]
                        return updated
                      })
                      alert('Action plan deleted successfully!')
                      setShowActionPlan(false)
                      setSelectedGoal(null)
                    } else {
                      throw new Error('Failed to delete action plan')
                    }
                  } catch (error) {
                    console.error('Error deleting action plan:', error)
                    alert('Failed to delete action plan: ' + (error instanceof Error ? error.message : 'Unknown error'))
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


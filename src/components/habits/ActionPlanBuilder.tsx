import { useState, useEffect } from 'react'
import { Plus, X, Clock, Calendar, MapPin, Gift, Trash2 } from 'lucide-react'
import { Habit, Goal } from '../../types'
import * as api from '../../services/api'

interface ActionPlanBuilderProps {
  goal: Goal
  existingHabits?: Habit[]
  existingActionPlanId?: string
  onSave: (habits: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>[], actionPlanId?: string) => void
  onDelete?: (actionPlanId: string) => void
  onClose: () => void
}

export default function ActionPlanBuilder({ goal, existingHabits = [], existingActionPlanId, onSave, onDelete, onClose }: ActionPlanBuilderProps) {
  const [habits, setHabits] = useState<Array<Partial<Habit & { actionItemId?: string }>>>([])
  const [loading, setLoading] = useState(!!existingActionPlanId)

  useEffect(() => {
    const loadActionPlan = async () => {
      if (existingActionPlanId) {
        setLoading(true)
        try {
          const actionItems = await api.listActionItems(existingActionPlanId)
          if (actionItems.length > 0) {
            // Convert ActionItems to Habits format
            const loadedHabits = actionItems.map(item => ({
              actionItemId: item.id,
              title: item.title,
              description: item.description || '',
              frequency: item.frequency === 'WEEKLY' ? 'weekly' as const : 'daily' as const,
              duration: 2, // Default since ActionItem doesn't have duration
              cue: { time: '', place: '', context: '' }, // Not stored in ActionItem
              reward: '', // Not stored in ActionItem
              status: item.status === 'ACTIVE' ? 'active' as const : item.status === 'PAUSED' ? 'paused' as const : 'completed' as const
            }))
            setHabits(loadedHabits)
          } else {
            // No items found, start with empty habit
            setHabits([{
              title: '',
              description: '',
              frequency: 'daily' as const,
              duration: 2,
              cue: { time: '', place: '', context: '' },
              reward: '',
              status: 'active' as const
            }])
          }
        } catch (error) {
          console.error('Error loading action plan:', error)
          // Fallback to existing habits or empty
          setHabits(existingHabits.length > 0 
            ? existingHabits.map(h => ({ ...h }))
            : [{
                title: '',
                description: '',
                frequency: 'daily' as const,
                duration: 2,
                cue: { time: '', place: '', context: '' },
                reward: '',
                status: 'active' as const
              }]
          )
        } finally {
          setLoading(false)
        }
      } else {
        // No existing plan, use existing habits or start fresh
        setHabits(existingHabits.length > 0 
          ? existingHabits.map(h => ({ ...h }))
          : [{
              title: '',
              description: '',
              frequency: 'daily' as const,
              duration: 2,
              cue: { time: '', place: '', context: '' },
              reward: '',
              status: 'active' as const
            }]
        )
      }
    }
    loadActionPlan()
  }, [existingActionPlanId, existingHabits])

  const addHabit = () => {
    setHabits([...habits, {
      title: '',
      description: '',
      frequency: 'daily' as const,
      duration: 2,
      cue: { time: '', place: '', context: '' },
      reward: '',
      status: 'active' as const
    }])
  }

  const removeHabit = (index: number) => {
    setHabits(habits.filter((_, i) => i !== index))
  }

  const updateHabit = (index: number, updates: Partial<Habit>) => {
    setHabits(habits.map((h, i) => i === index ? { ...h, ...updates } : h))
  }

  const handleSave = () => {
    console.log('ActionPlanBuilder: handleSave called, habits:', habits)
    
    const validHabits = habits
      .filter(h => h.title && h.duration)
      .map(h => ({
        goalId: goal.id,
        title: h.title!,
        description: h.description,
        frequency: h.frequency || 'daily',
        duration: h.duration || 2,
        cue: h.cue || { time: '', place: '', context: '' },
        reward: h.reward,
        status: h.status || 'active',
        // Preserve actionItemId if it exists (for matching existing items)
        ...(h.actionItemId && { actionItemId: h.actionItemId })
      }))
    
    console.log('ActionPlanBuilder: validHabits:', validHabits)
    
    // Allow saving with 0 habits - this will delete all items from the plan
    // If it's a new plan with 0 habits, we still need at least one
    if (validHabits.length === 0 && !existingActionPlanId) {
      alert('Please add at least one habit with a title and duration')
      return
    }
    
    console.log('ActionPlanBuilder: Calling onSave with', validHabits.length, 'habits')
    onSave(validHabits, existingActionPlanId)
    onClose()
  }

  const handleDeletePlan = async () => {
    if (!existingActionPlanId) {
      return
    }

    if (!confirm('Are you sure you want to delete this entire action plan? This will remove all habits associated with it.')) {
      return
    }

    if (onDelete) {
      onDelete(existingActionPlanId)
    }
    onClose()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Loading action plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {existingActionPlanId ? 'Edit' : 'Create'} 1% Action Plan
        </h2>
        <p className="text-gray-600">Break down "{goal.title}" into small, actionable habits</p>
      </div>

      <div className="space-y-6 mb-6">
        {habits.map((habit, index) => (
          <div key={index} className="border-2 border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Habit {index + 1}</h3>
              <button
                onClick={() => removeHabit(index)}
                className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                title="Remove this habit"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What will you do? *
                </label>
                <input
                  type="text"
                  value={habit.title || ''}
                  onChange={(e) => updateHabit(index, { title: e.target.value })}
                  placeholder="e.g., Read one page"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={habit.description || ''}
                  onChange={(e) => updateHabit(index, { description: e.target.value })}
                  placeholder="Add more context..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                />
              </div>

              {/* Frequency & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={16} />
                    Frequency *
                  </label>
                  <select
                    value={habit.frequency || 'daily'}
                    onChange={(e) => updateHabit(index, { frequency: e.target.value as 'daily' | 'weekly' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline mr-1" size={16} />
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={habit.duration || 2}
                    onChange={(e) => updateHabit(index, { duration: parseInt(e.target.value) || 2 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Keep it small! ≤ 2 min recommended</p>
                </div>
              </div>

              {/* Cue */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-blue-900 mb-3">
                  <MapPin className="inline mr-1" size={16} />
                  Make it Obvious - Set Your Cue
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={habit.cue?.time || ''}
                    onChange={(e) => updateHabit(index, { 
                      cue: { ...habit.cue, time: e.target.value }
                    })}
                    placeholder="Time (e.g., 7:00 AM)"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  />
                  <input
                    type="text"
                    value={habit.cue?.place || ''}
                    onChange={(e) => updateHabit(index, { 
                      cue: { ...habit.cue, place: e.target.value }
                    })}
                    placeholder="Place (e.g., kitchen table)"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  />
                  <input
                    type="text"
                    value={habit.cue?.context || ''}
                    onChange={(e) => updateHabit(index, { 
                      cue: { ...habit.cue, context: e.target.value }
                    })}
                    placeholder="Context (e.g., after morning coffee)"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Reward */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Gift className="inline mr-1" size={16} />
                  Make it Satisfying - Reward (Optional)
                </label>
                <input
                  type="text"
                  value={habit.reward || ''}
                  onChange={(e) => updateHabit(index, { reward: e.target.value })}
                  placeholder="e.g., Check off in app, enjoy favorite coffee"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={addHabit}
            className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Another Habit
          </button>
          {existingActionPlanId && (
            <button
              onClick={handleDeletePlan}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              Delete Plan
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Save Action Plan
          </button>
        </div>
      </div>
    </div>
  )
}


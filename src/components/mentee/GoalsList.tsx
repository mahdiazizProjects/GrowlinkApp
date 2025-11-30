import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { Goal } from '../../types'
import { Plus, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface GoalsListProps {
  userId: string
}

export default function GoalsList({ userId }: GoalsListProps) {
  const { goals, addGoal } = useApp()
  const [userGoals, setUserGoals] = useState<Goal[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: '' })

  useEffect(() => {
    const filtered = goals.filter(g => g.userId === userId && g.status === 'active')
    setUserGoals(filtered.slice(0, 3)) // Show top 3
  }, [goals, userId])

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      const goal: Goal = {
        id: `goal-${Date.now()}`,
        userId,
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        progress: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      addGoal(goal)
      setNewGoal({ title: '', description: '', category: '' })
      setShowAddForm(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Goals</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Add Goal"
        >
          <Plus size={20} />
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <input
            type="text"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="Goal title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <textarea
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            value={newGoal.category}
            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
            placeholder="Category (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddGoal}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              Add Goal
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewGoal({ title: '', description: '', category: '' })
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {userGoals.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No active goals yet</p>
      ) : (
        <div className="space-y-4">
          {userGoals.map((goal) => (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                {goal.category && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    {goal.category}
                  </span>
                )}
              </div>
              {goal.description && (
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
              )}
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{goal.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(goal.progress || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {goals.filter(g => g.userId === userId && g.status === 'active').length > 3 && (
        <Link
          to="/goals"
          className="mt-4 flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}


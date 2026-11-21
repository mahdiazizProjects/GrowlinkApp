import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { Todo } from '../../types'
import { Plus, Check, Circle } from 'lucide-react'
import * as api from '../../services/api'
import { useToast, errorMessage } from '../ui/Toast'

interface TodosPanelProps {
  userId: string
}

export default function TodosPanel({ userId }: TodosPanelProps) {
  const { goals } = useApp()
  const toast = useToast()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let cancelled = false
    api.listTodos(userId)
      .then(list => { if (!cancelled) setTodos(list) })
      .catch(error => console.error('Could not load todos:', error))
    return () => { cancelled = true }
  }, [userId])

  const userGoals = goals.filter(g => g.userId === userId && g.status === 'active')

  const handleAddTodo = async () => {
    const text = newTodoText.trim()
    if (!text || adding) return
    setAdding(true)
    try {
      const todo = await api.createTodo({ userId, text, goalId: selectedGoalId || undefined })
      setTodos(prev => [...prev, todo])
      setNewTodoText('')
      setSelectedGoalId('')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not add the todo.'))
    } finally {
      setAdding(false)
    }
  }

  const handleToggleTodo = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId)
    if (!todo) return
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, done: !t.done } : t))
    try {
      await api.updateTodo(todoId, { done: !todo.done })
    } catch (error) {
      setTodos(prev => prev.map(t => t.id === todoId ? { ...t, done: todo.done } : t))
      toast.error(errorMessage(error, 'Could not update the todo.'))
    }
  }

  const handleDeleteTodo = async (todoId: string) => {
    const previous = todos
    setTodos(prev => prev.filter(t => t.id !== todoId))
    try {
      await api.deleteTodo(todoId)
    } catch (error) {
      setTodos(previous)
      toast.error(errorMessage(error, 'Could not delete the todo.'))
    }
  }

  const getGoalName = (goalId?: string) => {
    if (!goalId) return null
    const goal = userGoals.find(g => g.id === goalId)
    return goal?.title
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Todos</h3>

      {/* Add Todo Form */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
          placeholder="Add a new todo (e.g., Meditate)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        {userGoals.length > 0 && (
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="">No goal (optional)</option>
            {userGoals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handleAddTodo}
          disabled={!newTodoText.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold"
        >
          <Plus size={16} />
          Add Todo
        </button>
      </div>

      {/* Todos List */}
      {todos.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No todos yet</p>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                todo.done ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-primary-300'
              }`}
            >
              <button
                onClick={() => handleToggleTodo(todo.id)}
                className="mt-0.5 flex-shrink-0"
              >
                {todo.done ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <Circle size={20} className="text-gray-400" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${todo.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {todo.text}
                </p>
                {todo.goalId && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                    {getGoalName(todo.goalId)}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-gray-400 hover:text-red-600 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {todos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {todos.filter(t => t.done).length} of {todos.length} completed
          </p>
        </div>
      )}
    </div>
  )
}


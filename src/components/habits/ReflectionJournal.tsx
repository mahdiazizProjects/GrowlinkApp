import { useState } from 'react'
import { BookOpen, Send, Sparkles, MessageSquare } from 'lucide-react'
import { Reflection, Goal } from '../../types'
import { format, startOfWeek, endOfWeek } from 'date-fns'

interface ReflectionJournalProps {
  reflections: Reflection[]
  goals: Goal[]
  onSubmit: (reflection: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>) => void
  currentUserId: string
}

export default function ReflectionJournal({ reflections, goals, onSubmit, currentUserId }: ReflectionJournalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  const [whatWentWell, setWhatWentWell] = useState('')
  const [whatFeltHard, setWhatFeltHard] = useState('')
  const [insights, setInsights] = useState('')

  const currentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-ww')
  const existingReflection = reflections.find(r => r.week === currentWeek && r.userId === currentUserId)

  const handleSubmit = () => {
    if (!whatWentWell && !whatFeltHard && !insights) return

    onSubmit({
      userId: currentUserId,
      goalId: selectedGoalId || undefined,
      week: currentWeek,
      content: {
        whatWentWell: whatWentWell || undefined,
        whatFeltHard: whatFeltHard || undefined,
        insights: insights || undefined
      }
    })

    // Reset form
    setWhatWentWell('')
    setWhatFeltHard('')
    setInsights('')
    setSelectedGoalId('')
    setIsOpen(false)
  }

  const activeGoals = goals.filter(g => g.status === 'active')

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <BookOpen className="text-purple-600" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weekly Reflection</h2>
            <p className="text-sm text-gray-600">What went well? What felt hard?</p>
          </div>
        </div>
        {!existingReflection && (
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Start Reflection
          </button>
        )}
      </div>

      {existingReflection ? (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-purple-600" size={18} />
              <span className="font-semibold text-purple-900">This Week's Reflection</span>
            </div>
            
            {existingReflection.content.whatWentWell && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">✅ What Went Well:</h4>
                <p className="text-gray-700">{existingReflection.content.whatWentWell}</p>
              </div>
            )}
            
            {existingReflection.content.whatFeltHard && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">💪 What Felt Hard:</h4>
                <p className="text-gray-700">{existingReflection.content.whatFeltHard}</p>
              </div>
            )}
            
            {existingReflection.content.insights && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Insights:</h4>
                <p className="text-gray-700">{existingReflection.content.insights}</p>
              </div>
            )}

            {existingReflection.mentorFeedback && (
              <div className="mt-4 pt-4 border-t border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="text-primary-600" size={16} />
                  <span className="text-sm font-semibold text-gray-700">Mentor Feedback:</span>
                </div>
                <p className="text-gray-700">{existingReflection.mentorFeedback.feedback}</p>
              </div>
            )}

            {existingReflection.aiInsights && (
              <div className="mt-4 pt-4 border-t border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-blue-600" size={16} />
                  <span className="text-sm font-semibold text-gray-700">AI Insights:</span>
                </div>
                <p className="text-gray-700">{existingReflection.aiInsights}</p>
              </div>
            )}
          </div>
        </div>
      ) : isOpen ? (
        <div className="space-y-4">
          {activeGoals.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Related Goal (Optional)
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="">Select a goal...</option>
                {activeGoals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ✅ What Went Well?
            </label>
            <textarea
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              placeholder="Share your wins, no matter how small..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💪 What Felt Hard?
            </label>
            <textarea
              value={whatFeltHard}
              onChange={(e) => setWhatFeltHard(e.target.value)}
              placeholder="What challenges did you face?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💡 Insights & Learnings
            </label>
            <textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              placeholder="What did you learn about yourself?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!whatWentWell && !whatFeltHard && !insights}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              Submit Reflection
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Click "Start Reflection" to begin your weekly reflection</p>
        </div>
      )}

      {/* Past Reflections */}
      {reflections.filter(r => r.userId === currentUserId && r.week !== currentWeek).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Reflections</h3>
          <div className="space-y-3">
            {reflections
              .filter(r => r.userId === currentUserId && r.week !== currentWeek)
              .slice(0, 3)
              .map(reflection => (
                <div key={reflection.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Week {reflection.week}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(reflection.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {reflection.content.whatWentWell && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {reflection.content.whatWentWell}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}


import { Check, Clock, MapPin, Lightbulb, Gift } from 'lucide-react'
import { Habit } from '../../types'

interface CueChecklistProps {
  habit: Habit
  onUpdate: (updates: Partial<Habit>) => void
}

export default function CueChecklist({ habit, onUpdate }: CueChecklistProps) {
  const checklistItems = [
    {
      key: 'time',
      label: 'Time',
      icon: Clock,
      value: habit.cue?.time,
      placeholder: 'e.g., 7:00 AM',
      description: 'Make it Obvious - Set a specific time'
    },
    {
      key: 'place',
      label: 'Place',
      icon: MapPin,
      value: habit.cue?.place,
      placeholder: 'e.g., kitchen table',
      description: 'Make it Obvious - Choose a location'
    },
    {
      key: 'context',
      label: 'Context',
      icon: Lightbulb,
      value: habit.cue?.context,
      placeholder: 'e.g., after morning coffee',
      description: 'Make it Obvious - Link to existing habit'
    },
    {
      key: 'reward',
      label: 'Reward',
      icon: Gift,
      value: habit.reward,
      placeholder: 'e.g., check off in app',
      description: 'Make it Satisfying - Define your reward'
    }
  ]

  const handleUpdate = (key: string, value: string) => {
    if (key === 'reward') {
      onUpdate({ reward: value })
    } else {
      onUpdate({
        cue: {
          ...habit.cue,
          [key]: value
        }
      })
    }
  }

  const completedCount = checklistItems.filter(item => item.value).length

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Habit Environment Design</h3>
        <p className="text-sm text-gray-600">
          {completedCount} of {checklistItems.length} elements configured
        </p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {checklistItems.map(item => {
          const Icon = item.icon
          const isComplete = !!item.value

          return (
            <div
              key={item.key}
              className={`border-2 rounded-lg p-4 transition-all ${
                isComplete
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                  {isComplete ? (
                    <Check size={20} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={18} className={isComplete ? 'text-green-600' : 'text-gray-500'} />
                    <label className="text-sm font-semibold text-gray-700">{item.label}</label>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                  <input
                    type="text"
                    value={item.value || ''}
                    onChange={(e) => handleUpdate(item.key, e.target.value)}
                    placeholder={item.placeholder}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                      isComplete
                        ? 'border-green-300 bg-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {completedCount === checklistItems.length && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-semibold">
            ✨ Great! Your habit environment is fully designed. This will make it easier to stick to your habit.
          </p>
        </div>
      )}
    </div>
  )
}


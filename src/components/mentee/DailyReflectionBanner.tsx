import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Reflection } from '../../types'
import { Save, Calendar } from 'lucide-react'

interface DailyReflectionBannerProps {
  userId: string
}

const MOODS = [
  { emoji: '😊', label: 'Great', value: 'GREAT', score: 5 },
  { emoji: '🙂', label: 'Good', value: 'GOOD', score: 4 },
  { emoji: '😐', label: 'Neutral', value: 'NEUTRAL', score: 3 },
  { emoji: '😔', label: 'Bad', value: 'BAD', score: 2 },
  { emoji: '😢', label: 'Awful', value: 'AWFUL', score: 1 },
]

export default function DailyReflectionBanner({ userId }: DailyReflectionBannerProps) {
  const { reflections, addReflection } = useApp()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [moodScore, setMoodScore] = useState<number>(3)
  const [text, setText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Check if reflection already exists for today
  const today = new Date().toISOString().split('T')[0]
  const todayReflection = reflections.find(
    r => r.userId === userId && r.date === today
  )

  const handleSave = async () => {
    if (!selectedMood && !text.trim()) {
      alert('Please add text or choose a mood')
      return
    }

    setIsSaving(true)
    try {
      const reflection: Reflection = {
        id: `reflection-${Date.now()}`,
        userId,
        date: today,
        mood: selectedMood as any,
        moodScore: moodScore,
        text: text.trim(),
        content: text.trim(), // Keep for backward compatibility
        isShared: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      addReflection(reflection)
      setSaveSuccess(true)
      setText('')
      setSelectedMood(null)
      setMoodScore(3)
      
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save reflection:', error)
      alert('Save failed — please retry')
    } finally {
      setIsSaving(false)
    }
  }

  if (todayReflection) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-green-600" size={20} />
              <div>
                <p className="text-sm font-semibold text-green-900">Reflection saved for today</p>
                <p className="text-xs text-green-700">
                  {todayReflection.mood && MOODS.find(m => m.value === todayReflection.mood)?.emoji}{' '}
                  {todayReflection.text || (typeof todayReflection.content === 'string' ? todayReflection.content : 'No notes')}
                </p>
              </div>
            </div>
            <span className="text-xs text-green-600">
              {new Date(todayReflection.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Daily Reflection</h2>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>

        {/* Mood Selector */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">How are you feeling?</label>
          <div className="flex items-center gap-4">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => {
                  setSelectedMood(mood.value)
                  setMoodScore(mood.score)
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  selectedMood === mood.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How was your day? What did you learn?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {!selectedMood && !text.trim() && 'Please add text or choose a mood'}
          </p>
          <button
            onClick={handleSave}
            disabled={isSaving || (!selectedMood && !text.trim())}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
              isSaving || (!selectedMood && !text.trim())
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Reflection'}
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">✓ Reflection saved successfully!</p>
          </div>
        )}
      </div>
    </div>
  )
}


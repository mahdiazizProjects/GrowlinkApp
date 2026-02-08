import { useState, useEffect } from 'react'
import { Clock, Save, Plus, Trash2 } from 'lucide-react'
import type { MentorAvailability, MentorAvailabilitySlot } from '../../types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const PRESETS: { label: string; slots: MentorAvailabilitySlot[] }[] = [
  {
    label: 'Weekdays 9 AM – 5 PM',
    slots: [1, 2, 3, 4, 5].map(dayOfWeek => ({
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00'
    }))
  },
  {
    label: 'Weekends 10 AM – 4 PM',
    slots: [0, 6].map(dayOfWeek => ({
      dayOfWeek,
      startTime: '10:00',
      endTime: '16:00'
    }))
  },
  {
    label: 'Mon–Fri 8 AM – 6 PM',
    slots: [1, 2, 3, 4, 5].map(dayOfWeek => ({
      dayOfWeek,
      startTime: '08:00',
      endTime: '18:00'
    }))
  },
  {
    label: 'Every day 10 AM – 8 PM',
    slots: [0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => ({
      dayOfWeek,
      startTime: '10:00',
      endTime: '20:00'
    }))
  }
]

interface MentorAvailabilityEditorProps {
  mentorId: string
  initialAvailability: MentorAvailability
  onSave: (availability: MentorAvailability) => Promise<void>
}

export default function MentorAvailabilityEditor({
  mentorId,
  initialAvailability,
  onSave
}: MentorAvailabilityEditorProps) {
  const [slots, setSlots] = useState<MentorAvailabilitySlot[]>(initialAvailability.slots)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setSlots(initialAvailability.slots)
  }, [initialAvailability.mentorId, initialAvailability.slots.length])

  const applyPreset = (presetSlots: MentorAvailabilitySlot[]) => {
    setSlots(presetSlots.map(s => ({ ...s })))
    setMessage(null)
  }

  const addSlot = (dayOfWeek: number) => {
    if (slots.some(s => s.dayOfWeek === dayOfWeek)) return
    setSlots([...slots, { dayOfWeek, startTime: '09:00', endTime: '17:00' }].sort((a, b) => a.dayOfWeek - b.dayOfWeek))
  }

  const removeSlot = (dayOfWeek: number) => {
    setSlots(slots.filter(s => s.dayOfWeek !== dayOfWeek))
  }

  const updateSlot = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setSlots(slots.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await onSave({
        mentorId,
        slots: slots.filter(s => s.startTime && s.endTime),
        updatedAt: new Date().toISOString()
      })
      setMessage({ type: 'success', text: 'Availability saved. Mentees can only book within these times.' })
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-primary-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">My availability</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Set when you’re available for sessions. Mentees will only see and book slots within these times. You’re responsible for sessions already booked; see cancellation rules below.
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quick presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.slots)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Weekly schedule</label>
        <div className="space-y-3">
          {DAY_NAMES.map((name, dayOfWeek) => {
            const slot = slots.find(s => s.dayOfWeek === dayOfWeek)
            return (
              <div key={dayOfWeek} className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="w-28 text-gray-700">{name}</span>
                {slot ? (
                  <>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(dayOfWeek, 'startTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-gray-500">–</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(dayOfWeek, 'endTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(dayOfWeek)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      aria-label={`Remove ${name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => addSlot(dayOfWeek)}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
                  >
                    <Plus size={14} /> Add hours
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {message && (
        <p className={`text-sm mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        <Save size={18} />
        {saving ? 'Saving…' : 'Save availability'}
      </button>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Cancellation policy:</strong> You’re expected to honour all confirmed bookings. If you must cancel:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>More than 24 hours before:</strong> You may cancel but must inform the mentee (e.g. by email).</li>
          <li><strong>Within 24 hours:</strong> You need a strong reason and the mentee must accept. If they don’t accept, you may be penalised for future bookings.</li>
        </ul>
      </div>
    </div>
  )
}

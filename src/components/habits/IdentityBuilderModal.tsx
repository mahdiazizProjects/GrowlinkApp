import { useState } from 'react'
import { X, Sparkles, Check } from 'lucide-react'
import { Goal } from '../../types'

interface IdentityBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const identityTemplates = [
  { type: 'consistent learner', action: 'practices 20 minutes daily' },
  { type: 'confident speaker', action: 'speaks up in meetings weekly' },
  { type: 'organized professional', action: 'plans the next day every evening' },
  { type: 'healthy individual', action: 'exercises for 15 minutes daily' },
  { type: 'creative person', action: 'creates something new weekly' },
  { type: 'mindful person', action: 'meditates for 5 minutes daily' },
]

export default function IdentityBuilderModal({ isOpen, onClose, onSubmit }: IdentityBuilderModalProps) {
  const [identityType, setIdentityType] = useState('')
  const [action, setAction] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  if (!isOpen) return null

  const handleTemplateSelect = (index: number) => {
    const template = identityTemplates[index]
    setIdentityType(template.type)
    setAction(template.action)
    setSelectedTemplate(index)
    setTitle(`Become a ${template.type}`)
  }

  const handleSubmit = () => {
    if (!identityType || !action || !title) return

    const identity = `I want to become a ${identityType} who ${action}.`
    
    onSubmit({
      userId: '', // Will be set by parent
      identity,
      title,
      description,
      status: 'draft'
    })
    
    // Reset form
    setIdentityType('')
    setAction('')
    setTitle('')
    setDescription('')
    setSelectedTemplate(null)
    onClose()
  }

  const identityStatement = identityType && action 
    ? `I want to become a ${identityType} who ${action}.`
    : ''

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Sparkles className="text-primary-600" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Who Do You Want to Become?</h2>
              <p className="text-sm text-gray-600">Define your identity-based goal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Suggestions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Quick Start Templates
            </label>
            <div className="grid grid-cols-2 gap-3">
              {identityTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(index)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === index
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-gray-900 capitalize">
                      {template.type}
                    </span>
                    {selectedTemplate === index && (
                      <Check className="text-primary-600" size={18} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{template.action}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Identity Builder */}
          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Or Build Your Own
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  I want to become a{' '}
                  <input
                    type="text"
                    value={identityType}
                    onChange={(e) => setIdentityType(e.target.value)}
                    placeholder="type of person"
                    className="inline-block border-b-2 border-primary-300 focus:border-primary-600 outline-none px-2 py-1 min-w-[200px]"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  who{' '}
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="specific action"
                    className="inline-block border-b-2 border-primary-300 focus:border-primary-600 outline-none px-2 py-1 min-w-[200px]"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Identity Statement Preview */}
          {identityStatement && (
            <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-primary-900 mb-2">Your Identity Statement:</p>
              <p className="text-primary-800 italic">"{identityStatement}"</p>
            </div>
          )}

          {/* Goal Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Become a Consistent Learner"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your goal..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!identityType || !action || !title}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Goal
          </button>
        </div>
      </div>
    </div>
  )
}


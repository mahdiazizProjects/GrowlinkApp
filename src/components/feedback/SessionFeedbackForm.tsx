import { useState } from 'react'
import { Star, X, Send, AlertCircle } from 'lucide-react'
import { Session, SessionFeedback } from '../../types'
import { format } from 'date-fns'

interface SessionFeedbackFormProps {
  session: Session
  onSubmit: (feedback: Omit<SessionFeedback, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
  existingFeedback?: SessionFeedback
}

export default function SessionFeedbackForm({
  session,
  onSubmit,
  onClose,
  existingFeedback
}: SessionFeedbackFormProps) {
  const [rating, setRating] = useState<number>(existingFeedback?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [growthArea, setGrowthArea] = useState(existingFeedback?.growthArea || '')
  const [growthIdea, setGrowthIdea] = useState(existingFeedback?.growthIdea || '')
  const [whatWentWell, setWhatWentWell] = useState(existingFeedback?.whatWentWell || '')
  const [whatToImprove, setWhatToImprove] = useState(existingFeedback?.whatToImprove || '')
  const [additionalComments, setAdditionalComments] = useState(existingFeedback?.additionalComments || '')
  const [isAnonymous, setIsAnonymous] = useState(existingFeedback?.isAnonymous || false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (rating === 0) {
      newErrors.rating = 'Please provide a rating'
    }
    if (!growthArea.trim()) {
      newErrors.growthArea = 'Growth area is required'
    }
    if (!growthIdea.trim()) {
      newErrors.growthIdea = 'Growth idea is required'
    }
    if (!whatWentWell.trim()) {
      newErrors.whatWentWell = 'This field is required'
    }
    if (!whatToImprove.trim()) {
      newErrors.whatToImprove = 'This field is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    onSubmit({
      sessionId: session.id,
      menteeId: session.menteeId,
      mentorId: session.mentorId,
      rating,
      growthArea: growthArea.trim(),
      growthIdea: growthIdea.trim(),
      whatWentWell: whatWentWell.trim(),
      whatToImprove: whatToImprove.trim(),
      additionalComments: additionalComments.trim() || undefined,
      isAnonymous
    })
  }

  const isReadOnly = !!existingFeedback

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Session Feedback</h2>
          <p className="text-sm text-gray-600 mt-1">
            {session.mentor?.name} • {format(new Date(session.date), 'MMM d, yyyy')} at {session.time}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => !isReadOnly && setRating(star)}
                onMouseEnter={() => !isReadOnly && setHoveredRating(star)}
                onMouseLeave={() => !isReadOnly && setHoveredRating(0)}
                disabled={isReadOnly}
                className={`transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                  }`}
              >
                <Star
                  size={40}
                  className={
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-3 text-lg font-semibold text-gray-700">
                {rating} out of 5
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              {errors.rating}
            </p>
          )}
        </div>

        {/* Growth Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What is one area where you'd like the mentor to help you grow? <span className="text-red-500">*</span>
          </label>
          <textarea
            value={growthArea}
            onChange={(e) => !isReadOnly && setGrowthArea(e.target.value)}
            placeholder="e.g., Communication skills, Technical knowledge, Career planning..."
            rows={3}
            disabled={isReadOnly}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${errors.growthArea ? 'border-red-300' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
          />
          {errors.growthArea && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              {errors.growthArea}
            </p>
          )}
        </div>

        {/* Growth Idea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What idea do you have for how the mentor can support your growth in that area? <span className="text-red-500">*</span>
          </label>
          <textarea
            value={growthIdea}
            onChange={(e) => !isReadOnly && setGrowthIdea(e.target.value)}
            placeholder="e.g., Practice mock interviews, Review my portfolio, Share industry insights..."
            rows={3}
            disabled={isReadOnly}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${errors.growthIdea ? 'border-red-300' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
          />
          {errors.growthIdea && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              {errors.growthIdea}
            </p>
          )}
        </div>

        {/* What Went Well */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What did the mentor do well in this session? <span className="text-red-500">*</span>
          </label>
          <textarea
            value={whatWentWell}
            onChange={(e) => !isReadOnly && setWhatWentWell(e.target.value)}
            placeholder="Share what the mentor did well..."
            rows={3}
            disabled={isReadOnly}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${errors.whatWentWell ? 'border-red-300' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
          />
          {errors.whatWentWell && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              {errors.whatWentWell}
            </p>
          )}
        </div>

        {/* What to Improve */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What could be improved for next time? <span className="text-red-500">*</span>
          </label>
          <textarea
            value={whatToImprove}
            onChange={(e) => !isReadOnly && setWhatToImprove(e.target.value)}
            placeholder="Share constructive feedback for improvement..."
            rows={3}
            disabled={isReadOnly}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${errors.whatToImprove ? 'border-red-300' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
          />
          {errors.whatToImprove && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              {errors.whatToImprove}
            </p>
          )}
        </div>

        {/* Additional Comments */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            value={additionalComments}
            onChange={(e) => !isReadOnly && setAdditionalComments(e.target.value)}
            placeholder="Any other feedback or comments..."
            rows={3}
            disabled={isReadOnly}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none ${isReadOnly ? 'bg-gray-50' : ''
              }`}
          />
        </div>

        {/* Anonymous Option */}
        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              Submit feedback anonymously (mentor won't see your name)
            </label>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {isReadOnly ? 'Close' : 'Cancel'}
        </button>
        {!isReadOnly && (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <Send size={18} />
            Submit Feedback
          </button>
        )}
      </div>
    </div>
  )
}


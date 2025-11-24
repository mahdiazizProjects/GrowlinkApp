import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { SessionFeedback, MentorFeedbackStats } from '../../types'
import { format } from 'date-fns'

interface MentorFeedbackViewProps {
  feedbackStats: MentorFeedbackStats | null
  allFeedbacks: SessionFeedback[]
}

export default function MentorFeedbackView({ feedbackStats }: MentorFeedbackViewProps) {
  if (!feedbackStats || feedbackStats.totalFeedbacks === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="text-primary-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Feedback from Mentees</h2>
        </div>
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <p>No feedback received yet</p>
          <p className="text-sm mt-2">Feedback will appear here after mentees complete their sessions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="text-primary-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Feedback from Mentees</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-primary-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">Average Rating</span>
            </div>
            <div className="text-3xl font-bold text-primary-700">{feedbackStats.averageRating}</div>
            <div className="text-sm text-gray-600 mt-1">out of 5.0</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-green-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">Total Feedbacks</span>
            </div>
            <div className="text-3xl font-bold text-green-700">{feedbackStats.totalFeedbacks}</div>
            <div className="text-sm text-gray-600 mt-1">sessions reviewed</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">Rating Distribution</span>
            </div>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-4">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(feedbackStats.ratingDistribution[star as keyof typeof feedbackStats.ratingDistribution] / feedbackStats.totalFeedbacks) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">
                    {feedbackStats.ratingDistribution[star as keyof typeof feedbackStats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedbacks */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Feedback</h3>
        <div className="space-y-4">
          {feedbackStats.recentFeedbacks.map((feedback) => (
            <div key={feedback.id} className="border-2 border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={
                          star <= feedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                {feedback.isAnonymous && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                    Anonymous
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Growth Area:</p>
                  <p className="text-gray-700">{feedback.growthArea}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Growth Idea:</p>
                  <p className="text-gray-700">{feedback.growthIdea}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-green-900 mb-1">✅ What Went Well:</p>
                    <p className="text-sm text-green-800">{feedback.whatWentWell}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-1">💡 What to Improve:</p>
                    <p className="text-sm text-blue-800">{feedback.whatToImprove}</p>
                  </div>
                </div>

                {feedback.additionalComments && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Additional Comments:</p>
                    <p className="text-gray-700 text-sm">{feedback.additionalComments}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


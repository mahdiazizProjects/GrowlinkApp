import { Star, TrendingUp, MessageSquare, Target, Award } from 'lucide-react'
import { MentorStats, SessionFeedback } from '../../types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface MentorAnalyticsProps {
  stats: MentorStats | null
  feedbacks: SessionFeedback[]
}

export default function MentorAnalytics({ stats, feedbacks }: MentorAnalyticsProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-primary-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        </div>
        <div className="text-center py-12 text-gray-500">
          <p>No analytics data available yet</p>
          <p className="text-sm mt-2">Analytics will appear after you have sessions and feedback</p>
        </div>
      </div>
    )
  }

  // Prepare rating trend data (last 10 feedbacks)
  const ratingTrendData = feedbacks
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-10)
    .map((f, index) => ({
      session: `Session ${index + 1}`,
      rating: f.rating
    }))

  // Calculate average rating over time
  const averageRatingData = ratingTrendData.map((_, index) => {
    const upToThisPoint = ratingTrendData.slice(0, index + 1)
    const avg = upToThisPoint.reduce((sum, d) => sum + d.rating, 0) / upToThisPoint.length
    return {
      session: ratingTrendData[index].session,
      average: Math.round(avg * 10) / 10
    }
  })

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-yellow-600" size={20} />
            <span className="text-sm font-semibold text-gray-700">Average Rating</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.averageRating}</div>
          <div className="text-xs text-gray-600 mt-1">out of 5.0</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-blue-600" size={20} />
            <span className="text-sm font-semibold text-gray-700">Total Sessions</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalSessions}</div>
          <div className="text-xs text-gray-600 mt-1">sessions completed</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <span className="text-sm font-semibold text-gray-700">Sessions/Week</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.sessionsPerWeek}</div>
          <div className="text-xs text-gray-600 mt-1">last 4 weeks</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-purple-600" size={20} />
            <span className="text-sm font-semibold text-gray-700">Feedback Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.feedbackResponseRate}%</div>
          <div className="text-xs text-gray-600 mt-1">of sessions</div>
        </div>
      </div>

      {/* Rating Trend Chart */}
      {averageRatingData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={averageRatingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="session" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="average" stroke="#0284c7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-green-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Top Strengths</h3>
          </div>
          {stats.strengthKeywords.length === 0 ? (
            <p className="text-gray-500 text-sm">No strength keywords identified yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.strengthKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-orange-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
          </div>
          {stats.improvementKeywords.length === 0 ? (
            <p className="text-gray-500 text-sm">No improvement keywords identified yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.improvementKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


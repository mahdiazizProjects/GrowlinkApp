import { Trophy, Award, Star, Zap, Target } from 'lucide-react'
import { Badge } from '../../types'
import { format } from 'date-fns'

interface BadgeSystemProps {
  badges: Badge[]
  userId: string
}

const badgeIcons: Record<string, React.ReactNode> = {
  consistency: <Trophy className="text-gold-600" size={24} />,
  reflection: <Star className="text-purple-600" size={24} />,
  'identity-builder': <Target className="text-blue-600" size={24} />,
  streak: <Zap className="text-orange-600" size={24} />,
  milestone: <Award className="text-green-600" size={24} />
}

export default function BadgeSystem({ badges, userId }: BadgeSystemProps) {
  const userBadges = badges.filter(b => b.userId === userId)

  if (userBadges.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="text-gold-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Badges</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Complete habits and reflections to earn badges!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-gold-600" size={24} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Badges</h2>
          <p className="text-sm text-gray-600">{userBadges.length} badge{userBadges.length !== 1 ? 's' : ''} earned</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {userBadges.map(badge => (
          <div
            key={badge.id}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-200 hover:border-primary-300 transition-all"
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                {badgeIcons[badge.type] || <Award className="text-primary-600" size={32} />}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-1">{badge.title}</h3>
            <p className="text-xs text-gray-600 text-center mb-2">{badge.description}</p>
            <p className="text-xs text-gray-500 text-center">
              {format(new Date(badge.earnedAt), 'MMM yyyy')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}


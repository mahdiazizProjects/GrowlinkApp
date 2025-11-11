import { X, LogOut, Edit, Mail, MapPin, Briefcase, Award, Calendar } from 'lucide-react'
import { User } from '../../types'
import { format } from 'date-fns'

interface UserProfileProps {
  user: User
  onClose: () => void
  onLogout: () => void
  onEdit?: () => void
}

export default function UserProfile({ user, onClose, onLogout, onEdit }: UserProfileProps) {
  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'mentor'
                      ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'mentor' ? '👨‍🏫 Mentor' : '👤 Mentee'}
                  </span>
                  {user.membershipTier === 'exclusive' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gold-400 to-gold-600 text-white">
                      ✨ Exclusive Member
                    </span>
                  )}
                  {user.verified && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Mail className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{user.email}</p>
            </div>
          </div>
          {user.location && (
            <div className="flex items-start gap-3">
              <MapPin className="text-primary-600 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{user.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">About</h4>
            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Briefcase size={16} />
              Skills & Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar size={16} />
            Account Information
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Membership Tier</p>
              <p className="font-semibold text-gray-900 capitalize">{user.membershipTier}</p>
            </div>
            <div>
              <p className="text-gray-600">Member Since</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(user.createdAt), 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}


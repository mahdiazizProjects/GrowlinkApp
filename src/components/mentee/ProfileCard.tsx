import { useState } from 'react'
import { User } from '../../types'
import { Edit2, Check, X } from 'lucide-react'

interface ProfileCardProps {
  user: User
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({
    name: user.name,
    title: user.title || '',
    bio: user.bio || '',
    avatar: user.avatar || ''
  })

  const handleSave = () => {
    // TODO: Implement save via GraphQL mutation
    setIsEditing(false)
    // Update user in context
  }

  const handleCancel = () => {
    setEditedUser({
      name: user.name,
      title: user.title || '',
      bio: user.bio || '',
      avatar: user.avatar || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Name"
              />
              <input
                type="text"
                value={editedUser.title}
                onChange={(e) => setEditedUser({ ...editedUser, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Title"
              />
              <textarea
                value={editedUser.bio}
                onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Bio"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Check size={16} />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">{user.name.charAt(0)}</span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-auto p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 size={18} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              {user.title && <p className="text-sm text-gray-600 mt-1">{user.title}</p>}
              {user.bio && <p className="text-sm text-gray-700 mt-3">{user.bio}</p>}
            </>
          )}
        </div>
      </div>
      
      {/* Connection Status */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs text-gray-600">Online</span>
      </div>
    </div>
  )
}


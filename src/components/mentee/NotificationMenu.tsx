import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Bell, MessageCircle, User as UserIcon, X } from 'lucide-react'

interface NotificationMenuProps {
  userId: string
}

export default function NotificationMenu({ userId }: NotificationMenuProps) {
  const { notifications, getUnreadNotificationCount, markNotificationAsRead } = useApp()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const unreadCount = getUnreadNotificationCount(userId)
  const userNotifications = notifications.filter(n => n.userId === userId).slice(0, 5)

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId)
    setShowNotifications(false)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => {
            setShowNotifications(!showNotifications)
            setShowMessages(false)
            setShowProfileMenu(false)
          }}
          className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNotifications(false)}
            />
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <p className="p-4 text-gray-500 text-sm text-center">No notifications</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {userNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <button
        onClick={() => {
          setShowMessages(!showMessages)
          setShowNotifications(false)
          setShowProfileMenu(false)
        }}
        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
      >
        <MessageCircle size={20} />
      </button>

      {/* Profile Menu */}
      <div className="relative">
        <button
          onClick={() => {
            setShowProfileMenu(!showProfileMenu)
            setShowNotifications(false)
            setShowMessages(false)
          }}
          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <UserIcon size={20} />
        </button>

        {showProfileMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowProfileMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Help
                </button>
                <div className="border-t border-gray-200 my-2" />
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


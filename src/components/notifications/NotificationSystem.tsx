import { Bell, X, Calendar, MessageSquare, Award, AlertCircle } from 'lucide-react'
import { Notification } from '../../types'
import { format } from 'date-fns'
import { useState } from 'react'

interface NotificationSystemProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (notificationId: string) => void
  onNotificationClick?: (notification: Notification) => void
}

export default function NotificationSystem({
  notifications,
  unreadCount,
  onMarkAsRead,
  onNotificationClick
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'session-booked':
        return <Calendar className="text-blue-600" size={20} />
      case 'session-upcoming':
        return <Calendar className="text-yellow-600" size={20} />
      case 'feedback-received':
        return <MessageSquare className="text-green-600" size={20} />
      case 'badge-earned':
        return <Award className="text-gold-600" size={20} />
      case 'admin-update':
        return <AlertCircle className="text-purple-600" size={20} />
      default:
        return <Bell className="text-gray-600" size={20} />
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read)
  const recentNotifications = notifications.slice(0, 10)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="text-gray-700" size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 max-h-[600px] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {recentNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="mx-auto text-gray-400 mb-2" size={32} />
                  <p>No notifications</p>
                </div>
              ) : (
                recentNotifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        onMarkAsRead(notification.id)
                      }
                      if (onNotificationClick) {
                        onNotificationClick(notification)
                      }
                      setIsOpen(false)
                    }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {unreadNotifications.length > 0 && (
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3">
                <button
                  onClick={() => {
                    unreadNotifications.forEach(n => onMarkAsRead(n.id))
                  }}
                  className="w-full text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}


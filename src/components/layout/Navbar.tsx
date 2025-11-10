import { Link, useLocation } from 'react-router-dom'
import { User, MessageCircle, Calendar, MapPin, Home, LogIn, Target, CheckCircle, BookOpen } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Navbar() {
  const location = useLocation()
  const { currentUser } = useApp()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold text-gradient">GrowLink</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={<Home size={18} />} active={isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/mentors" icon={<User size={18} />} active={isActive('/mentors')}>
              Mentors
            </NavLink>
            <NavLink to="/community" icon={<MessageCircle size={18} />} active={isActive('/community')}>
              Community
            </NavLink>
            <NavLink to="/events" icon={<Calendar size={18} />} active={isActive('/events')}>
              Events
            </NavLink>
            <NavLink to="/venues" icon={<MapPin size={18} />} active={isActive('/venues')}>
              Venues
            </NavLink>
          </div>

          {/* Habit Features (when logged in) */}
          {currentUser && (
            <div className="hidden lg:flex items-center space-x-1 mr-4">
              <NavLink to="/goals" icon={<Target size={18} />} active={isActive('/goals')}>
                Goals
              </NavLink>
              <NavLink to="/habits" icon={<CheckCircle size={18} />} active={isActive('/habits')}>
                Habits
              </NavLink>
              <NavLink to="/reflections" icon={<BookOpen size={18} />} active={isActive('/reflections')}>
                Reflections
              </NavLink>
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                {currentUser.membershipTier === 'exclusive' && (
                  <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gold-400 to-gold-600 text-white">
                    ✨ Exclusive Member
                  </span>
                )}
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                  {currentUser.name.charAt(0)}
                </div>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, icon, children, active }: { to: string; icon: React.ReactNode; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary-100 text-primary-700 font-semibold'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}



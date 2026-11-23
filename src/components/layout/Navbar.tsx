import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User, MessageCircle, Calendar, MapPin, Home, LogIn, Target, CheckCircle, Sparkles, Settings, Menu, X, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import NotificationSystem from '../notifications/NotificationSystem'
import { useEffect, useState, type ReactNode } from 'react'
import UserProfile from '../profile/UserProfile'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, isAdmin, logout, notifications, getUnreadNotificationCount, markNotificationAsRead } = useApp()
  const [showProfile, setShowProfile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu whenever the page changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const isActive = (path: string) => location.pathname === path
  const normalizedRole = currentUser?.role?.toLowerCase()
  const isMentor = normalizedRole === 'mentor' || normalizedRole === 'both'
  const isMentee = normalizedRole === 'mentee' || normalizedRole === 'both'

  // Everything reachable from the bar, for the small-screen menu.
  const mobileLinks: { to: string; label: string; icon: ReactNode }[] = !currentUser
    ? [
        { to: '/', label: 'Home', icon: <Home size={18} /> },
        { to: '/mentors', label: 'Mentors', icon: <User size={18} /> },
        { to: '/community', label: 'Community', icon: <MessageCircle size={18} /> },
        { to: '/events', label: 'Events', icon: <Calendar size={18} /> },
        { to: '/venues', label: 'Venues', icon: <MapPin size={18} /> }
      ]
    : [
        ...(isMentee ? [{ to: '/mentee-home', label: 'Home', icon: <Home size={18} /> }] : []),
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        ...(isMentee
          ? [
              { to: '/mentors', label: 'Mentors', icon: <User size={18} /> },
              { to: '/goals', label: 'Goals', icon: <Target size={18} /> },
              { to: '/habits', label: 'Habits', icon: <CheckCircle size={18} /> }
            ]
          : []),
        { to: '/journeys', label: 'Journeys', icon: <Sparkles size={18} /> },
        { to: '/events', label: 'Events', icon: <Calendar size={18} /> },
        { to: '/setup', label: 'Setup', icon: <Settings size={18} /> },
        ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: <ShieldCheck size={18} /> }] : [])
      ]
  // Mentees have more links, so their full bar only appears on wider screens.
  const menuBreakpoint = isMentee ? 'lg:hidden' : 'md:hidden'

  const handleLogout = async () => {
    await logout()
    setShowProfile(false)
    navigate('/auth')
  }

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

          {/* Navigation Links - Show different nav based on role */}
          {!currentUser && (
            // Public navigation (not logged in)
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
          )}

          {/* Mentor Navigation - Simplified */}
          {isMentor && !isMentee && (
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/dashboard" icon={<Home size={18} />} active={isActive('/dashboard')}>
                Dashboard
              </NavLink>
              <NavLink to="/journeys" icon={<Sparkles size={18} />} active={isActive('/journeys')}>
                Journeys
              </NavLink>
            </div>
          )}

          {/* Mentee Navigation - Habit Features */}
          {isMentee && (
            <div className="hidden lg:flex items-center space-x-1 mr-4">
              <NavLink to="/mentee-home" icon={<Home size={18} />} active={isActive('/mentee-home')}>
                Home
              </NavLink>
              <NavLink to="/journeys" icon={<Sparkles size={18} />} active={isActive('/journeys')}>
                Journeys
              </NavLink>
              <NavLink to="/goals" icon={<Target size={18} />} active={isActive('/goals')}>
                Goals
              </NavLink>
              <NavLink to="/habits" icon={<CheckCircle size={18} />} active={isActive('/habits')}>
                Habits
              </NavLink>
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser ? (
              <>
                {currentUser.membershipTier === 'exclusive' && (
                  <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gold-400 to-gold-600 text-white">
                    ✨ Exclusive Member
                  </span>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    title="Admin"
                    aria-label="Admin"
                    className={`hidden md:flex items-center p-2 rounded-lg transition-colors ${
                      isActive('/admin') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShieldCheck size={18} />
                  </Link>
                )}
                <Link
                  to="/setup"
                  className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/setup')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={18} />
                  <span>Setup</span>
                </Link>
                {/* Notifications for everyone; the mentor dashboard has its own bell that opens sessions */}
                {!(isMentor && isActive('/dashboard')) && (
                  <NotificationSystem
                    notifications={notifications.filter(n => n.userId === currentUser.id)}
                    unreadCount={getUnreadNotificationCount(currentUser.id)}
                    onMarkAsRead={markNotificationAsRead}
                  />
                )}
                {/* Dashboard link - only show for mentees (mentors see it in main nav) */}
                {isMentee && (
                  <Link
                    to="/dashboard"
                    className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => setShowProfile(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold hover:from-primary-500 hover:to-primary-700 transition-all cursor-pointer"
                  title="View Profile"
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              className={`${menuBreakpoint} p-2 rounded-lg text-gray-700 hover:bg-gray-100`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className={`${menuBreakpoint} border-t border-gray-100 bg-white`}>
          <div className="px-4 py-3 space-y-1">
            {mobileLinks.map(link => (
              <NavLink key={link.to} to={link.to} icon={link.icon} active={isActive(link.to)}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <UserProfile
            user={currentUser}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, icon, children, active }: { to: string; icon: ReactNode; children: ReactNode; active: boolean }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
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



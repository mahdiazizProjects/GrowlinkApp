import { Link } from 'react-router-dom'
import { Search, Book, MessageCircle, Video, Calendar, User, Settings, Shield, ArrowRight } from 'lucide-react'

export default function Help() {
  const helpCategories = [
    {
      icon: <User size={24} />,
      title: "Getting Started",
      description: "New to GrowLink? Learn the basics",
      links: [
        { text: "Creating Your Profile", href: "/help/getting-started/profile" },
        { text: "Finding a Mentor", href: "/help/getting-started/finding-mentor" },
        { text: "Booking Your First Session", href: "/help/getting-started/booking" }
      ]
    },
    {
      icon: <Calendar size={24} />,
      title: "Sessions & Bookings",
      description: "Everything about scheduling and managing sessions",
      links: [
        { text: "How to Book a Session", href: "/help/sessions/booking" },
        { text: "Virtual vs In-Person", href: "/help/sessions/types" },
        { text: "Canceling or Rescheduling", href: "/help/sessions/canceling" },
        { text: "Session Etiquette", href: "/help/sessions/etiquette" }
      ]
    },
    {
      icon: <Video size={24} />,
      title: "Technical Support",
      description: "Troubleshooting and technical issues",
      links: [
        { text: "Video Call Issues", href: "/help/technical/video" },
        { text: "Account Access", href: "/help/technical/account" },
        { text: "Payment Problems", href: "/help/technical/payment" },
        { text: "Mobile App Help", href: "/help/technical/mobile" }
      ]
    },
    {
      icon: <Settings size={24} />,
      title: "Account & Settings",
      description: "Manage your account and preferences",
      links: [
        { text: "Updating Your Profile", href: "/help/account/profile" },
        { text: "Privacy Settings", href: "/help/account/privacy" },
        { text: "Notification Preferences", href: "/help/account/notifications" },
        { text: "Membership Tiers", href: "/help/account/membership" }
      ]
    },
    {
      icon: <Shield size={24} />,
      title: "Safety & Security",
      description: "Stay safe and protect your information",
      links: [
        { text: "Community Guidelines", href: "/guidelines" },
        { text: "Reporting Issues", href: "/help/safety/reporting" },
        { text: "Privacy Policy", href: "/help/safety/privacy" },
        { text: "Blocking Users", href: "/help/safety/blocking" }
      ]
    },
    {
      icon: <Book size={24} />,
      title: "Habit-Based Mentorship",
      description: "Learn about our 1% growth system",
      links: [
        { text: "Setting Identity-Based Goals", href: "/help/habits/goals" },
        { text: "Building Daily Habits", href: "/help/habits/building" },
        { text: "Tracking Progress", href: "/help/habits/tracking" },
        { text: "Reflection & Badges", href: "/help/habits/reflections" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Help Center</h1>
          <p className="text-xl text-primary-100 mb-8">
            Find answers and get the support you need
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              to="/faq"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="text-primary-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">FAQ</h3>
              </div>
              <p className="text-gray-600 mb-4">Browse frequently asked questions</p>
              <div className="flex items-center text-primary-600 font-semibold">
                <span>View FAQ</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </Link>

            <Link
              to="/contact"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="text-primary-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Contact Us</h3>
              </div>
              <p className="text-gray-600 mb-4">Get in touch with our support team</p>
              <div className="flex items-center text-primary-600 font-semibold">
                <span>Contact Support</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </Link>

            <Link
              to="/guidelines"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-primary-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Guidelines</h3>
              </div>
              <p className="text-gray-600 mb-4">Read our community guidelines</p>
              <div className="flex items-center text-primary-600 font-semibold">
                <span>View Guidelines</span>
                <ArrowRight size={18} className="ml-2" />
              </div>
            </Link>
          </div>

          {/* Help Categories */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{category.description}</p>
                  <ul className="space-y-2">
                    {category.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.href}
                          className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                        >
                          {link.text}
                          <ArrowRight size={14} className="ml-1" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="mt-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Our support team is available to assist you with any questions or concerns.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Contact Support
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}




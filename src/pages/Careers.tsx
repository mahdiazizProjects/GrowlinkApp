import { Link } from 'react-router-dom'
import { Briefcase, Users, Heart, TrendingUp, ArrowRight, MapPin, Clock } from 'lucide-react'

export default function Careers() {
  const openPositions = [
    {
      id: 1,
      title: 'Senior Product Designer',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Lead design initiatives for our mentorship platform, creating intuitive and beautiful user experiences.'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build and scale our platform using modern web technologies, working on both frontend and backend systems.'
    },
    {
      id: 3,
      title: 'Community Manager',
      department: 'Community',
      location: 'New York, NY',
      type: 'Full-time',
      description: 'Foster our community of mentors and mentees, organize events, and ensure a positive experience for all members.'
    },
    {
      id: 4,
      title: 'Partnerships Coordinator',
      department: 'Business Development',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Build relationships with venues, mentors, and organizations to expand our network.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Join the GrowLink Team</h1>
          <p className="text-xl text-primary-100">
            Help us build the future of meaningful mentorship and community connections
          </p>
        </div>
      </section>

      {/* Why Work Here */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why GrowLink?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're building something meaningful, and we'd love for you to be part of it
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mission-Driven</h3>
              <p className="text-gray-600 text-sm">
                Work on something that makes a real difference in people's lives
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Great Team</h3>
              <p className="text-gray-600 text-sm">
                Collaborate with passionate, talented people who care about what they do
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Opportunities</h3>
              <p className="text-gray-600 text-sm">
                Learn, grow, and take on new challenges as we scale together
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Work</h3>
              <p className="text-gray-600 text-sm">
                Remote-friendly options and flexible schedules to fit your life
              </p>
            </div>
          </div>

          {/* Open Positions */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>
            <div className="space-y-4">
              {openPositions.map((position) => (
                <div
                  key={position.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{position.title}</h3>
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                          {position.department}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{position.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{position.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{position.type}</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 whitespace-nowrap">
                      Apply Now
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Application */}
          <div className="mt-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Don't See a Fit?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              We're always looking for talented people who share our mission. Even if there's no 
              open position that matches your skills, we'd love to hear from you.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Send Us Your Resume
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


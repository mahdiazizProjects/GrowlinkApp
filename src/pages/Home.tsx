import { Link } from 'react-router-dom'
import { ArrowRight, Users, MapPin, Calendar, Star, CheckCircle, Sparkles } from 'lucide-react'
import { mockMentors } from '../data/mockData'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-gold-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gold-100 text-gold-800 rounded-full text-sm font-semibold mb-6">
              <Sparkles size={16} />
              <span>Exclusive Membership • Curated Mentors</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Grow Together, Meet
              <span className="text-gradient"> In Person</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connect with curated mentors through structured sessions and casual community hangouts. 
              Meet at partner venues for meaningful in-person connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/mentors"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Browse Mentors</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/community"
                className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why GrowLink?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              More than mentorship. A premium community with real connections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="text-primary-600" size={32} />}
              title="Curated & Exclusive"
              description="Quality over quantity. Every mentor is vetted and verified for excellence."
            />
            <FeatureCard
              icon={<MapPin className="text-primary-600" size={32} />}
              title="In-Person Venues"
              description="Meet at partner libraries, co-working spaces, and community centers at reduced rates."
            />
            <FeatureCard
              icon={<Calendar className="text-primary-600" size={32} />}
              title="Community Hangouts"
              description="Beyond sessions - casual meetups, workshops, and networking events."
            />
          </div>
        </div>
      </section>

      {/* In-Person Benefits */}
      <section className="py-20 px-4 bg-gradient-to-br from-gold-50 to-primary-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Better Rates for In-Person Meetings
              </h2>
              <p className="text-xl text-gray-600">
                Get discounts and boost your ratings by meeting at partner venues
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Up to 30% Discount
                  </h3>
                  <p className="text-gray-600">
                    In-person sessions at partner venues are cheaper than virtual sessions. 
                    Support local spaces while saving money.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Enhanced Ratings
                  </h3>
                  <p className="text-gray-600">
                    In-person meetings earn bonus rating points, making it easier 
                    to build your reputation and unlock exclusive features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Mentors
            </h2>
            <p className="text-xl text-gray-600">
              Hand-picked experts ready to guide your journey
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockMentors.slice(0, 4).map((mentor) => (
              <Link
                key={mentor.id}
                to={`/mentors/${mentor.id}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                    {mentor.verified && (
                      <div className="flex items-center space-x-1 text-primary-600 text-sm">
                        <CheckCircle size={14} />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mentor.bio}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="text-gold-500 fill-gold-500" size={16} />
                    <span className="text-sm font-semibold">{mentor.rating}</span>
                  </div>
                  {mentor.membershipTier === 'exclusive' && (
                    <span className="px-2 py-1 bg-gold-100 text-gold-800 rounded text-xs font-semibold">
                      Exclusive
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/mentors"
              className="inline-flex items-center space-x-2 text-primary-600 font-semibold hover:text-primary-700"
            >
              <span>View All Mentors</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Grow Together?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join an exclusive community of mentors and mentees. Start your journey today.
          </p>
          <Link
            to="/mentors"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            <span>Get Started</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

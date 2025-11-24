import { Link } from 'react-router-dom'
import { MapPin, Users, Building2, ArrowRight, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Partners() {
  const { venues } = useApp()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Partner Venues</h1>
          <p className="text-xl text-primary-100">
            Connect with mentors at our curated partner locations
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Partner with Us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our network of partner venues and help create meaningful mentorship connections
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Increased Foot Traffic</h3>
              <p className="text-gray-600">
                Bring new visitors to your space through our mentorship sessions and community events.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Impact</h3>
              <p className="text-gray-600">
                Support local mentorship and professional development in your community.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Featured Listing</h3>
              <p className="text-gray-600">
                Get featured in our venue directory and reach thousands of potential visitors.
              </p>
            </div>
          </div>

          {/* Current Partners */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Partner Venues</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <div key={venue.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{venue.name}</h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin size={16} className="mr-1" />
                        <span>{venue.city}</span>
                      </div>
                    </div>
                    {venue.isPartner && (
                      <CheckCircle className="text-primary-600 flex-shrink-0" size={20} />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{venue.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{venue.type}</span>
                    <Link
                      to="/venues"
                      className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Become a Partner */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Become a Partner Venue</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Interested in partnering with GrowLink? We're always looking for great spaces to host 
              mentorship sessions and community events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                Contact Us
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/venues"
                className="px-8 py-3 bg-primary-700 text-white border-2 border-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                View All Venues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


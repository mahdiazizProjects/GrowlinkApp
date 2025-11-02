import { MapPin, Wifi, Users, Coffee, Car } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Venues() {
  const { venues } = useApp()

  const getAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('wifi')) return <Wifi size={18} />
    if (amenity.toLowerCase().includes('parking')) return <Car size={18} />
    if (amenity.toLowerCase().includes('coffee')) return <Coffee size={18} />
    return <Users size={18} />
  }

  const getPartnershipBadge = (tier: string) => {
    const styles = {
      gold: 'bg-gradient-to-r from-gold-400 to-gold-600 text-white',
      silver: 'bg-gray-300 text-gray-800',
      bronze: 'bg-amber-700 text-white'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[tier as keyof typeof styles]}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)} Partner
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Partner Venues</h1>
          <p className="text-xl text-gray-600">
            Meet at our curated partner locations for in-person sessions at discounted rates
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div key={venue.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{venue.name}</h3>
                    <div className="flex items-center space-x-1 text-gray-600 text-sm mb-2">
                      <MapPin size={16} />
                      <span>{venue.city}</span>
                    </div>
                  </div>
                  {venue.isPartner && getPartnershipBadge(venue.partnershipTier)}
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Users size={16} />
                  <span>Capacity: {venue.capacity} people</span>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-1 px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-primary-700">
                    <strong>Special Offer:</strong> Sessions at this venue receive 30% discount
                  </p>
                </div>

                <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interested in Becoming a Partner Venue?</h2>
          <p className="text-gray-600 mb-6">
            Partner with GrowLink to host mentorship sessions and community events. 
            We help bring foot traffic to your space while supporting meaningful connections.
          </p>
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            Contact Us About Partnerships
          </button>
        </div>
      </div>
    </div>
  )
}


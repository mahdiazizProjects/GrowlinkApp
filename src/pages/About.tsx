import { Users, Target, Heart, Award } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">About GrowLink</h1>
          <p className="text-xl text-primary-100">
            Building meaningful connections through curated mentorship and in-person experiences
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              GrowLink is more than a mentorship platform—it's a community dedicated to fostering genuine, 
              in-person connections between mentors and mentees. We believe that the most transformative 
              growth happens when people come together face-to-face, sharing experiences, knowledge, and 
              support in real-world settings.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our exclusive membership model ensures quality over quantity, connecting curated mentors with 
              committed mentees who are ready to invest in their personal and professional development.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Purpose-Driven</h3>
              <p className="text-gray-600">
                Every connection is intentional, focused on meaningful growth and real outcomes.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community First</h3>
              <p className="text-gray-600">
                We prioritize building a supportive, inclusive community where everyone can thrive.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentic Connections</h3>
              <p className="text-gray-600">
                Real relationships built through in-person interactions and shared experiences.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                Curated mentors and verified members ensure the highest quality of mentorship.
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                GrowLink was born from a simple observation: the most impactful mentorship happens when 
                people meet in person. While virtual connections are convenient, there's something 
                irreplaceable about face-to-face conversations, shared spaces, and the serendipity of 
                in-person interactions.
              </p>
              <p>
                We partner with local venues—libraries, co-working spaces, and community centers—to create 
                accessible, welcoming environments for mentorship. By offering discounted rates for in-person 
                sessions, we make quality mentorship more affordable while supporting local communities.
              </p>
              <p>
                Our 1% habit-based mentorship system helps mentees build sustainable growth through small, 
                daily actions that compound over time. Combined with structured sessions and community 
                events, we create a holistic approach to personal and professional development.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}




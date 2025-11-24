import { Link } from 'react-router-dom'
import { CheckCircle, Users, Shield, Heart } from 'lucide-react'

export default function Guidelines() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Community Guidelines</h1>
          <p className="text-xl text-primary-100">
            Our shared values and expectations for a respectful, supportive community
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Core Values */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Heart className="text-primary-600" size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Respect & Kindness</h3>
                  <p className="text-gray-600">
                    Treat every member with dignity and respect, regardless of background, experience, or perspective.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="text-primary-600" size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Inclusive Community</h3>
                  <p className="text-gray-600">
                    We welcome diverse perspectives and create a safe space where everyone can learn and grow.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="text-primary-600" size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Safety First</h3>
                  <p className="text-gray-600">
                    Your safety and well-being are our top priorities. Report any concerns immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Code of Conduct */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Code of Conduct</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">✅ Do's</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span>Be punctual and prepared for sessions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span>Communicate clearly and honestly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span>Provide constructive feedback</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span>Respect boundaries and personal space</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span>Honor commitments and agreements</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span>Maintain confidentiality when requested</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">❌ Don'ts</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">✗</span>
                    <span>Harass, discriminate, or engage in inappropriate behavior</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">✗</span>
                    <span>Share personal information without consent</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">✗</span>
                    <span>Cancel sessions without reasonable notice</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">✗</span>
                    <span>Use the platform for commercial solicitation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">✗</span>
                    <span>Misrepresent your qualifications or experience</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 mt-1">✗</span>
                    <span>Engage in any illegal activities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Session Guidelines */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Session Guidelines</h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Before the Session</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Confirm the date, time, and location at least 24 hours in advance</li>
                  <li>Prepare questions or topics you'd like to discuss</li>
                  <li>Arrive on time or notify your mentor/mentee if you'll be late</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">During the Session</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Be present and engaged</li>
                  <li>Listen actively and ask clarifying questions</li>
                  <li>Take notes if helpful</li>
                  <li>Respect the agreed-upon duration</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">After the Session</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide honest, constructive feedback</li>
                  <li>Follow up on action items discussed</li>
                  <li>Respect privacy and confidentiality</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reporting */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Reporting Concerns</h2>
            <p className="text-gray-700 mb-4">
              If you experience or witness behavior that violates these guidelines, please report it immediately. 
              We take all reports seriously and will investigate promptly.
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-primary-800">
                <strong>Contact us:</strong> <Link to="/contact" className="underline">Report an issue</Link> or email 
                <a href="mailto:safety@growlink.com" className="underline ml-1">safety@growlink.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


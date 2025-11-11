import { useState } from 'react'
import { User, Award, CheckCircle, Star, ArrowRight, Mail, Briefcase, GraduationCap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

export default function BecomeMentor() {
  const { currentUser, setCurrentUser } = useApp()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: '',
    location: '',
    skills: [] as string[],
    experience: '',
    whyMentor: ''
  })
  const [currentSkill, setCurrentSkill] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const commonSkills = [
    'Product Design', 'Software Engineering', 'Data Science', 'Marketing',
    'Leadership', 'Career Growth', 'Startups', 'UX/UI Design',
    'Machine Learning', 'Business Strategy', 'Sales', 'Content Creation'
  ]

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] })
      setCurrentSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to backend
    setSubmitted(true)
    // Optionally update current user to mentor role
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: 'mentor'
      })
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in becoming a mentor. Our team will review your application and get back to you within 2-3 business days.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setSubmitted(false)}
                className="w-full px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Edit Application
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Become a Mentor</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your expertise, guide others on their journey, and make a meaningful impact. Join our exclusive community of mentors.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Star className="text-yellow-600 mx-auto mb-4" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Make an Impact</h3>
            <p className="text-sm text-gray-600">Help mentees achieve their goals and grow professionally</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="text-primary-600 mx-auto mb-4" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Build Your Brand</h3>
            <p className="text-sm text-gray-600">Showcase your expertise and build your professional reputation</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <User className="text-green-600 mx-auto mb-4" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Exclusive Community</h3>
            <p className="text-sm text-gray-600">Join a curated network of top professionals</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mentor Application</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Briefcase className="inline mr-2" size={16} />
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., San Francisco, CA"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <GraduationCap className="inline mr-2" size={16} />
                Areas of Expertise *
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill(currentSkill)
                    }
                  }}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => addSkill(currentSkill)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-600 mr-2">Quick add:</span>
                {commonSkills
                  .filter(s => !formData.skills.includes(s))
                  .slice(0, 6)
                  .map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about your professional background, experience, and achievements..."
                rows={4}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 100 characters</p>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Years of Experience *
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 10+ years in product design"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Why Mentor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Why do you want to become a mentor? *
              </label>
              <textarea
                value={formData.whyMentor}
                onChange={(e) => setFormData({ ...formData, whyMentor: e.target.value })}
                placeholder="Share your motivation for mentoring and what you hope to contribute..."
                rows={4}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Submit Application
                <ArrowRight size={20} />
              </button>
              <p className="text-sm text-gray-600">
                By submitting, you agree to our mentor guidelines and code of conduct.
              </p>
            </div>
          </form>
        </div>

        {/* Requirements Info */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">What We Look For</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="text-blue-600 mt-0.5" size={16} />
              <span>5+ years of professional experience in your field</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-blue-600 mt-0.5" size={16} />
              <span>Strong communication and teaching skills</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-blue-600 mt-0.5" size={16} />
              <span>Commitment to helping others grow</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-blue-600 mt-0.5" size={16} />
              <span>Availability for at least 2 sessions per month</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}


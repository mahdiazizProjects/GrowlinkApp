import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Mail, MapPin, Briefcase, Sparkles, User, Link as LinkIcon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'

type RoleOption = 'MENTOR' | 'MENTEE' | 'BOTH'

interface FormState {
  name: string
  email: string
  username: string
  role: RoleOption
  title: string
  location: string
  bio: string
  avatar: string
  skills: string[]
  interests: string[]
}

interface FormErrors {
  name?: string
  email?: string
  role?: string
  bio?: string
  skills?: string
  interests?: string
}

const commonSkills = [
  'Product Design',
  'Software Engineering',
  'Leadership',
  'Career Growth',
  'Data Science',
  'UX Research',
  'Marketing',
  'Business Strategy',
  'Entrepreneurship',
  'Machine Learning',
  'Finance',
  'Project Management'
]

const commonInterests = [
  'Career transitions',
  'Interview prep',
  'Leadership growth',
  'Building confidence',
  'Product thinking',
  'Public speaking',
  'Time management',
  'Work-life balance',
  'Networking',
  'Goal setting',
  'Skill upskilling',
  'Entrepreneurship'
]

function normalizeRole(role?: string): RoleOption {
  if (!role) return 'MENTEE'
  const upper = role.toUpperCase()
  if (upper === 'MENTOR' || upper === 'MENTEE' || upper === 'BOTH') return upper as RoleOption
  return 'MENTEE'
}

export default function SetupProfile() {
  const { currentUser, setCurrentUser, loading } = useApp()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    username: '',
    role: 'MENTEE',
    title: '',
    location: '',
    bio: '',
    avatar: '',
    skills: [],
    interests: []
  })
  const [currentSkill, setCurrentSkill] = useState('')
  const [currentInterest, setCurrentInterest] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      username: currentUser.username || currentUser.email?.split('@')[0] || '',
      role: normalizeRole(currentUser.role),
      title: currentUser.title || '',
      location: currentUser.location || '',
      bio: currentUser.bio || '',
      avatar: currentUser.avatar || '',
      skills: currentUser.skills || [],
      interests: currentUser.interests || []
    })
  }, [currentUser])

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (!trimmed || formData.skills.includes(trimmed)) return
    setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }))
    setCurrentSkill('')
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const addInterest = (interest: string) => {
    const trimmed = interest.trim()
    if (!trimmed || formData.interests.includes(trimmed)) return
    setFormData(prev => ({ ...prev, interests: [...prev.interests, trimmed] }))
    setCurrentInterest('')
  }

  const removeInterest = (interest: string) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }))
  }

  const roleDescription = useMemo(() => {
    switch (formData.role) {
      case 'MENTOR':
        return 'Share expertise, guide mentees, and grow your mentoring impact.'
      case 'BOTH':
        return 'Learn as a mentee and contribute as a mentor with a balanced profile.'
      default:
        return 'Get personalized recommendations and find the right mentors for you.'
    }
  }, [formData.role])

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}
    if (!formData.name.trim()) nextErrors.name = 'Full name is required.'
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!formData.role) nextErrors.role = 'Choose a role to continue.'

    if ((formData.role === 'MENTOR' || formData.role === 'BOTH') && formData.skills.length < 2) {
      nextErrors.skills = 'Add at least two skills for mentor matching.'
    }
    if ((formData.role === 'MENTEE' || formData.role === 'BOTH') && formData.interests.length < 2) {
      nextErrors.interests = 'Add at least two interests for better mentor matches.'
    }
    if (!formData.bio.trim()) {
      nextErrors.bio = 'A short bio helps others understand your journey.'
    }

    return nextErrors
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError(null)
    setSaved(false)
    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      username: formData.username.trim() || formData.email.split('@')[0],
      role: formData.role,
      title: formData.title.trim() || undefined,
      location: formData.location.trim() || undefined,
      bio: formData.bio.trim(),
      avatar: formData.avatar.trim() || undefined,
      skills: formData.skills,
      interests: formData.interests
    }

    try {
      setSaving(true)
      let savedUser = null
      if (currentUser?.id) {
        savedUser = await api.updateUser(currentUser.id, payload)
        if (!savedUser) {
          savedUser = await api.createUser({ ...payload, id: currentUser.id })
        }
      } else {
        savedUser = await api.createUser(payload)
      }

      if (!savedUser) {
        throw new Error('Unable to save profile. Please try again.')
      }

      setCurrentUser(savedUser)
      setSaved(true)
      const nextPath = formData.role === 'MENTEE' ? '/mentee-home' : '/dashboard'
      setTimeout(() => navigate(nextPath), 600)
    } catch (error) {
      console.error('Error saving profile:', error)
      setSubmitError('We could not save your profile. Please try again in a moment.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-600 mb-6">
            Create an account or sign in to complete your mentor or mentee profile.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
            <Sparkles size={16} />
            Profile Setup
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Build your mentor or mentee profile</h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl">
            Complete your profile to unlock tailored matches, richer sessions, and a more personalized GrowLink experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Choose your role</h2>
                  <p className="text-sm text-gray-600">{roleDescription}</p>
                </div>
                {errors.role && (
                  <span className="text-sm text-red-600">{errors.role}</span>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {(['MENTEE', 'MENTOR', 'BOTH'] as RoleOption[]).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                    className={`border rounded-xl p-4 text-left transition-all ${
                      formData.role === role
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {role === 'MENTOR' ? 'Mentor' : role === 'MENTEE' ? 'Mentee' : 'Both'}
                      </span>
                      {formData.role === role && <CheckCircle className="text-primary-600" size={18} />}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {role === 'MENTOR' && 'Guide mentees, share experience, and build your mentoring brand.'}
                      {role === 'MENTEE' && 'Get guidance, set goals, and discover mentors tailored to you.'}
                      {role === 'BOTH' && 'Combine learning and mentoring with a balanced profile.'}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Core details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData(prev => ({ ...prev, name: event.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData(prev => ({ ...prev, email: event.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(event) => setFormData(prev => ({ ...prev, username: event.target.value }))}
                    placeholder="e.g., alex.dev"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Briefcase className="inline mr-2" size={16} />
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(event) => setFormData(prev => ({ ...prev, title: event.target.value }))}
                    placeholder="e.g., Product Designer"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(event) => setFormData(prev => ({ ...prev, location: event.target.value }))}
                    placeholder="City, Country"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <LinkIcon className="inline mr-2" size={16} />
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(event) => setFormData(prev => ({ ...prev, avatar: event.target.value }))}
                    placeholder="https://"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional. Use a square image for best results.</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About you</h2>
              <textarea
                value={formData.bio}
                onChange={(event) => setFormData(prev => ({ ...prev, bio: event.target.value }))}
                rows={4}
                placeholder="Share a short bio about your background, goals, or mentoring style."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
              {errors.bio && <p className="text-xs text-red-600 mt-1">{errors.bio}</p>}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {formData.role === 'MENTEE' ? 'What you want to grow' : 'Skills & focus areas'}
                </h2>
                {(formData.role === 'MENTOR' || formData.role === 'BOTH') && (
                  <span className="text-xs text-gray-500">Mentor fields</span>
                )}
              </div>

              {(formData.role === 'MENTOR' || formData.role === 'BOTH') && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mentor skills *</label>
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
                      onChange={(event) => setCurrentSkill(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addSkill(currentSkill)
                        }
                      }}
                      placeholder="Add a skill and press Enter"
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
                  {errors.skills && <p className="text-xs text-red-600 mt-2">{errors.skills}</p>}
                </div>
              )}

              {(formData.role === 'MENTEE' || formData.role === 'BOTH') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mentee interests *</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.interests.map(interest => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentInterest}
                      onChange={(event) => setCurrentInterest(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addInterest(currentInterest)
                        }
                      }}
                      placeholder="Add an interest and press Enter"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addInterest(currentInterest)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonInterests
                      .filter(i => !formData.interests.includes(i))
                      .slice(0, 6)
                      .map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => addInterest(interest)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                        >
                          + {interest}
                        </button>
                      ))}
                  </div>
                  {errors.interests && <p className="text-xs text-red-600 mt-2">{errors.interests}</p>}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt={formData.name || 'Avatar'} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (formData.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profile preview</p>
                  <h3 className="text-lg font-semibold text-gray-900">{formData.name || 'Your name'}</h3>
                  <p className="text-xs text-gray-500">{formData.title || 'Add a title'}</p>
                </div>
              </div>
              <div className="mt-5 text-sm text-gray-600 space-y-2">
                <p className="flex items-center gap-2">
                  <User size={14} />
                  {formData.role === 'MENTOR' ? 'Mentor' : formData.role === 'MENTEE' ? 'Mentee' : 'Mentor & Mentee'}
                </p>
                {formData.location && (
                  <p className="flex items-center gap-2">
                    <MapPin size={14} />
                    {formData.location}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Profile readiness</h3>
              <p className="text-sm text-primary-100 mb-4">Complete the essentials to unlock tailored matches.</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Name + email</span>
                  <CheckCircle size={16} className={formData.name && formData.email ? 'text-white' : 'text-primary-300'} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Role selected</span>
                  <CheckCircle size={16} className={formData.role ? 'text-white' : 'text-primary-300'} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Bio added</span>
                  <CheckCircle size={16} className={formData.bio ? 'text-white' : 'text-primary-300'} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : currentUser ? 'Save changes' : 'Create profile'}
              </button>
              {saved && (
                <p className="text-sm text-green-600">Profile saved! Redirecting...</p>
              )}
              <p className="text-xs text-gray-500">
                By saving your profile, you agree to our community guidelines and data policies.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}


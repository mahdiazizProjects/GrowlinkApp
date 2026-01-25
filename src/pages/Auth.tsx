import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, User, Sparkles, ArrowRight, RefreshCw } from 'lucide-react'
import { signIn, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'

type Mode = 'signIn' | 'signUp' | 'confirm'
type RoleOption = 'MENTOR' | 'MENTEE' | 'BOTH'

export default function Auth() {
  const navigate = useNavigate()
  const { refreshCurrentUser, setCurrentUser } = useApp()
  const [mode, setMode] = useState<Mode>('signIn')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [signInData, setSignInData] = useState({ email: '', password: '' })
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MENTEE' as RoleOption
  })
  const [confirmCode, setConfirmCode] = useState('')

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)
    try {
      await signIn({ username: signInData.email, password: signInData.password })
      await refreshCurrentUser()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)
    try {
      const result = await signUp({
        username: signUpData.email,
        password: signUpData.password,
        options: {
          userAttributes: {
            email: signUpData.email,
            name: signUpData.name
          }
        }
      })

      if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        setMode('confirm')
        setSuccessMessage('Check your email for the verification code.')
      } else {
        setSuccessMessage('Account created. You can sign in now.')
        setMode('signIn')
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)
    try {
      await confirmSignUp({ username: signUpData.email, confirmationCode: confirmCode })
      await signIn({ username: signUpData.email, password: signUpData.password })
      const user = await refreshCurrentUser()
      if (user) {
        const updatedUser = await api.updateUser(user.id, {
          role: signUpData.role,
          name: signUpData.name
        })
        if (updatedUser) {
          setCurrentUser(updatedUser)
        }
      }
      navigate('/setup')
    } catch (err: any) {
      setError(err?.message || 'Unable to confirm the code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setSuccessMessage(null)
    setLoading(true)
    try {
      await resendSignUpCode({ username: signUpData.email })
      setSuccessMessage('A new code was sent to your email.')
    } catch (err: any) {
      setError(err?.message || 'Unable to resend the code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
            <Sparkles size={16} />
            Secure access
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            {mode === 'signIn' ? 'Welcome back to GrowLink' : 'Create your GrowLink account'}
          </h1>
          <p className="text-lg text-gray-600">
            Access mentoring sessions, growth tools, and a curated community experience.
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Why sign up?</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Personalized mentor recommendations.</li>
              <li>Track goals, habits, and reflections in one space.</li>
              <li>Unlock mentor dashboards and analytics.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {mode === 'signIn' ? 'Sign in' : mode === 'signUp' ? 'Create account' : 'Verify email'}
            </h2>
            {mode !== 'confirm' && (
              <button
                type="button"
                onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                {mode === 'signIn' ? 'Create account' : 'Have an account?'}
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          {successMessage && <p className="text-sm text-green-600 mb-4">{successMessage}</p>}

          {mode === 'signIn' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={signInData.email}
                  onChange={(event) => setSignInData(prev => ({ ...prev, email: event.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="inline mr-2" size={16} />
                  Password
                </label>
                <input
                  type="password"
                  value={signInData.password}
                  onChange={(event) => setSignInData(prev => ({ ...prev, password: event.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {mode === 'signUp' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Full name
                </label>
                <input
                  type="text"
                  value={signUpData.name}
                  onChange={(event) => setSignUpData(prev => ({ ...prev, name: event.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={signUpData.email}
                  onChange={(event) => setSignUpData(prev => ({ ...prev, email: event.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="inline mr-2" size={16} />
                  Password
                </label>
                <input
                  type="password"
                  value={signUpData.password}
                  onChange={(event) => setSignUpData(prev => ({ ...prev, password: event.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={signUpData.role}
                  onChange={(event) => setSignUpData(prev => ({ ...prev, role: event.target.value as RoleOption }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="MENTEE">Mentee</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Creating account...' : 'Create account'}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {mode === 'confirm' && (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification code
                </label>
                <input
                  type="text"
                  value={confirmCode}
                  onChange={(event) => setConfirmCode(event.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Confirming...' : 'Confirm & continue'}
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Resend code
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


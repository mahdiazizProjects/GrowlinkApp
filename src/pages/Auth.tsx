import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail, User, Sparkles, ArrowRight, RefreshCw } from 'lucide-react'
import * as auth from '../services/auth'
import { isCloudBackend } from '../services/backend'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'
import { errorMessage } from '../components/ui/Toast'

type Mode = 'signIn' | 'signUp' | 'confirm' | 'forgot' | 'reset'
type RoleOption = 'MENTOR' | 'MENTEE' | 'BOTH'

const inputClass = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, authLoading, refreshCurrentUser, setCurrentUser } = useApp()
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
  const [resetData, setResetData] = useState({ email: '', code: '', password: '' })

  // Where to go after signing in: back to the page that asked for it, or the dashboard.
  const from = (location.state as { from?: string } | null)?.from
  const destination = from && from !== '/auth' ? from : '/dashboard'

  // Already signed in (for example after a refresh): no reason to show the form.
  const [busyWithFlow, setBusyWithFlow] = useState(false)
  useEffect(() => {
    if (!authLoading && currentUser && !busyWithFlow) navigate(destination, { replace: true })
  }, [authLoading, currentUser, busyWithFlow, destination, navigate])

  const switchMode = (next: Mode) => {
    setError(null)
    setSuccessMessage(null)
    setMode(next)
  }

  const run = async (fn: () => Promise<void>, fallback: string) => {
    setError(null)
    setSuccessMessage(null)
    setLoading(true)
    setBusyWithFlow(true)
    try {
      await fn()
    } catch (err) {
      setError(errorMessage(err, fallback))
    } finally {
      setLoading(false)
      setBusyWithFlow(false)
    }
  }

  const handleSignIn = (event: React.FormEvent) => {
    event.preventDefault()
    return run(async () => {
      try {
        await auth.signIn(signInData.email, signInData.password)
      } catch (err) {
        if ((err as { name?: string })?.name === 'UserNotConfirmedException') {
          // Account exists but the email was never verified: resume verification.
          setSignUpData(prev => ({ ...prev, email: signInData.email, password: signInData.password }))
          await auth.resendSignUpCode(signInData.email).catch(() => undefined)
          setMode('confirm')
          setSuccessMessage('Your email is not verified yet. We sent you a new code.')
          return
        }
        throw err
      }
      const user = await refreshCurrentUser()
      if (!user) throw new Error('Signed in, but your profile could not be loaded. Please try again.')
      navigate(destination, { replace: true })
    }, 'Unable to sign in. Please try again.')
  }

  /** Signs the new account in, stores the chosen role and continues to profile setup. */
  const finishSignUp = async () => {
    await auth.signIn(signUpData.email, signUpData.password)
    const user = await refreshCurrentUser()
    if (user) {
      const updatedUser = await api.updateUser(user.id, { role: signUpData.role, name: signUpData.name })
      if (updatedUser) setCurrentUser(updatedUser)
    }
    navigate('/setup', { replace: true })
  }

  const handleSignUp = (event: React.FormEvent) => {
    event.preventDefault()
    return run(async () => {
      const result = await auth.signUp({ email: signUpData.email, password: signUpData.password, name: signUpData.name })
      if (result.needsConfirmation) {
        setMode('confirm')
        setSuccessMessage('Check your email for the verification code.')
      } else {
        await finishSignUp()
      }
    }, 'Unable to create account. Please try again.')
  }

  const handleConfirm = (event: React.FormEvent) => {
    event.preventDefault()
    return run(async () => {
      await auth.confirmSignUp(signUpData.email, confirmCode)
      await finishSignUp()
    }, 'Unable to confirm the code. Please try again.')
  }

  const handleResend = () => run(async () => {
    await auth.resendSignUpCode(signUpData.email)
    setSuccessMessage('A new code was sent to your email.')
  }, 'Unable to resend the code.')

  const handleForgot = (event: React.FormEvent) => {
    event.preventDefault()
    return run(async () => {
      const started = await auth.requestPasswordReset(resetData.email)
      if (!started) {
        setError('Password reset is not available in local demo mode. Create a new demo account instead.')
        return
      }
      setMode('reset')
      setSuccessMessage('If that email has an account, a reset code is on its way.')
    }, 'Unable to start the password reset.')
  }

  const handleReset = (event: React.FormEvent) => {
    event.preventDefault()
    return run(async () => {
      await auth.confirmPasswordReset(resetData.email, resetData.code, resetData.password)
      setSignInData({ email: resetData.email, password: '' })
      setMode('signIn')
      setSuccessMessage('Password updated. Sign in with your new password.')
    }, 'Unable to reset the password.')
  }

  const title = {
    signIn: 'Sign in',
    signUp: 'Create account',
    confirm: 'Verify email',
    forgot: 'Reset password',
    reset: 'Choose a new password'
  }[mode]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
            <Sparkles size={16} />
            Secure access
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            {mode === 'signUp' || mode === 'confirm' ? 'Create your GrowLink account' : 'Welcome back to GrowLink'}
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
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            {mode !== 'confirm' && (
              <button
                type="button"
                onClick={() => switchMode(mode === 'signIn' ? 'signUp' : 'signIn')}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                {mode === 'signIn' ? 'Create account' : 'Have an account?'}
              </button>
            )}
          </div>

          {!isCloudBackend && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              Local demo mode: accounts live only in this browser. Do not reuse a real password.
            </p>
          )}
          {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}
          {successMessage && <p role="status" className="text-sm text-green-600 mb-4">{successMessage}</p>}

          {mode === 'signIn' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email
                </label>
                <input
                  type="email"
                  aria-label="Email"
                  autoComplete="email"
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
                  aria-label="Password"
                  autoComplete="current-password"
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
              <button
                type="button"
                onClick={() => { setResetData(prev => ({ ...prev, email: signInData.email })); switchMode('forgot') }}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Forgot your password?
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
                  aria-label="Full name"
                  autoComplete="name"
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
                  aria-label="Email"
                  autoComplete="email"
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
                  aria-label="Password"
                  autoComplete="new-password"
                  minLength={8}
                  value={signUpData.password}
                  onChange={(event) => setSignUpData(prev => ({ ...prev, password: event.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">At least 8 characters.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  aria-label="Role"
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
                  aria-label="Verification code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
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
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-sm text-gray-600">Enter your email and we will send you a code to reset your password.</p>
              <input
                type="email"
                aria-label="Email"
                autoComplete="email"
                placeholder="you@example.com"
                value={resetData.email}
                onChange={(event) => setResetData(prev => ({ ...prev, email: event.target.value }))}
                className={inputClass}
                required
              />
              <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="text"
                aria-label="Reset code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Code from your email"
                value={resetData.code}
                onChange={(event) => setResetData(prev => ({ ...prev, code: event.target.value }))}
                className={inputClass}
                required
              />
              <input
                type="password"
                aria-label="New password"
                autoComplete="new-password"
                minLength={8}
                placeholder="New password"
                value={resetData.password}
                onChange={(event) => setResetData(prev => ({ ...prev, password: event.target.value }))}
                className={inputClass}
                required
              />
              <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Saving...' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

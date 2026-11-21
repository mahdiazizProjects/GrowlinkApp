// Authentication facade. Cloud mode delegates to Amplify Auth (Cognito). Local mode keeps demo
// accounts in this browser's localStorage so the app can be used without AWS; those accounts are
// for local development only and are not a security boundary.

import * as amplifyAuth from 'aws-amplify/auth'
import { isCloudBackend } from './backend'
import { newId } from './localStore'

export interface AuthIdentity {
  userId: string
  email: string
  name?: string
}

interface LocalAccount {
  id: string
  email: string
  name: string
  salt: string
  hash: string
}

const ACCOUNTS_KEY = 'growlink.local.accounts.v1'
const SESSION_KEY = 'growlink.local.session.v1'

function readAccounts(): LocalAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]') as LocalAccount[]
  } catch {
    return []
  }
}

function writeAccounts(accounts: LocalAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

async function digest(salt: string, password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const buf = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const normalize = (email: string) => email.trim().toLowerCase()

export async function signIn(email: string, password: string): Promise<void> {
  if (isCloudBackend) {
    const result = await amplifyAuth.signIn({ username: normalize(email), password })
    if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
      const err = new Error('Please verify your email before signing in.')
      err.name = 'UserNotConfirmedException'
      throw err
    }
    return
  }
  const account = readAccounts().find(a => a.email === normalize(email))
  if (!account || (await digest(account.salt, password)) !== account.hash) {
    throw new Error('Incorrect email or password.')
  }
  localStorage.setItem(SESSION_KEY, account.id)
}

export async function signUp(params: { email: string; password: string; name: string }): Promise<{ needsConfirmation: boolean }> {
  const email = normalize(params.email)
  if (isCloudBackend) {
    const result = await amplifyAuth.signUp({
      username: email,
      password: params.password,
      options: { userAttributes: { email, name: params.name } }
    })
    return { needsConfirmation: result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP' }
  }
  if (params.password.length < 8) throw new Error('Password must be at least 8 characters.')
  const accounts = readAccounts()
  if (accounts.some(a => a.email === email)) throw new Error('An account with this email already exists.')
  const salt = newId()
  accounts.push({ id: newId(), email, name: params.name.trim(), salt, hash: await digest(salt, params.password) })
  writeAccounts(accounts)
  return { needsConfirmation: false }
}

export async function confirmSignUp(email: string, code: string): Promise<void> {
  if (!isCloudBackend) return
  await amplifyAuth.confirmSignUp({ username: normalize(email), confirmationCode: code.trim() })
}

export async function resendSignUpCode(email: string): Promise<void> {
  if (!isCloudBackend) return
  await amplifyAuth.resendSignUpCode({ username: normalize(email) })
}

/** Starts a password reset. Returns false when resets are not available (local mode). */
export async function requestPasswordReset(email: string): Promise<boolean> {
  if (!isCloudBackend) return false
  await amplifyAuth.resetPassword({ username: normalize(email) })
  return true
}

export async function confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
  if (!isCloudBackend) throw new Error('Password reset is not available in local mode.')
  await amplifyAuth.confirmResetPassword({ username: normalize(email), confirmationCode: code.trim(), newPassword })
}

/** The signed-in identity, or null when nobody is signed in. */
export async function getIdentity(): Promise<AuthIdentity | null> {
  if (isCloudBackend) {
    try {
      const authUser = await amplifyAuth.getCurrentUser()
      const attributes = await amplifyAuth.fetchUserAttributes()
      return {
        userId: authUser.userId,
        email: attributes.email || authUser.signInDetails?.loginId || authUser.username,
        name: attributes.name
      }
    } catch {
      return null
    }
  }
  let id: string | null = null
  try {
    id = localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
  const account = id ? readAccounts().find(a => a.id === id) : undefined
  return account ? { userId: account.id, email: account.email, name: account.name } : null
}

export async function signOut(): Promise<void> {
  if (isCloudBackend) {
    await amplifyAuth.signOut()
    return
  }
  localStorage.removeItem(SESSION_KEY)
}

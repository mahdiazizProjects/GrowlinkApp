import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import * as api from '../../services/api'
import type { User } from '../../types'

/** Pending mentorship requests addressed to the signed-in mentor. Renders nothing when there are none. */
export default function MentorshipRequests() {
  const { currentUser, mentorshipRequests, respondToMentorshipRequest } = useApp()
  const [mentees, setMentees] = useState<Record<string, User>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  const pending = mentorshipRequests.filter(r => r.mentorId === currentUser?.id && r.status === 'PENDING')
  const menteeIds = pending.map(r => r.menteeId).join(',')

  useEffect(() => {
    let cancelled = false
    const ids = menteeIds ? menteeIds.split(',') : []
    Promise.all(ids.map(id => api.getUser(id).catch(() => null))).then(users => {
      if (cancelled) return
      const map: Record<string, User> = {}
      users.forEach(u => { if (u) map[u.id] = u })
      setMentees(map)
    })
    return () => { cancelled = true }
  }, [menteeIds])

  if (pending.length === 0) return null

  const respond = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    setBusyId(id)
    try {
      await respondToMentorshipRequest(id, status)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="mb-6 bg-white rounded-xl shadow-lg p-6 border border-primary-100" aria-labelledby="mentorship-requests-heading">
      <h2 id="mentorship-requests-heading" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <UserPlus className="text-primary-600" size={22} />
        Mentorship requests ({pending.length})
      </h2>
      <ul className="space-y-3">
        {pending.map(request => {
          const mentee = mentees[request.menteeId]
          return (
            <li key={request.id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{mentee?.name || 'A mentee'}</p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line break-words">{request.message}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => respond(request.id, 'ACCEPTED')}
                  disabled={busyId === request.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => respond(request.id, 'DECLINED')}
                  disabled={busyId === request.id}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-60"
                >
                  Decline
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-gray-500 mt-3">
        Accepted mentees are told to book a session; they can only pick times in your availability. <Link to="/mentors" className="text-primary-600">See how you appear to mentees</Link>.
      </p>
    </section>
  )
}

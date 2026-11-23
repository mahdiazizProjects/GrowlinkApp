import { useState } from 'react'
import { Video, ExternalLink } from 'lucide-react'
import type { Session } from '../../types'

/** Only http(s) links are shown or saved, so a stored value can't become a script link. */
// eslint-disable-next-line react-refresh/only-export-components
export function safeMeetingUrl(value?: string): string | null {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

interface Props {
  session: Session
  /** Present for the mentor: lets them add or change the link. */
  onSave?: (meetingLink: string) => Promise<void>
}

/** Join link for a virtual session. Mentors can set it; mentees see it once it exists. */
export default function MeetingLink({ session, onSave }: Props) {
  const current = safeMeetingUrl(session.meetingLink)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(session.meetingLink || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session.type !== 'virtual') return null
  const active = session.status === 'PENDING' || session.status === 'CONFIRMED'

  const save = async () => {
    const url = safeMeetingUrl(value)
    if (!url) {
      setError('Paste a full link starting with https://')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave!(url)
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the link.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
      <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
        <Video size={16} className="text-primary-600" /> Video call link
      </p>
      {current && !editing && (
        <a
          href={current}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700"
        >
          Join call <ExternalLink size={14} />
        </a>
      )}
      {!current && !editing && (
        <p className="text-sm text-gray-600">
          {onSave ? 'Add your Google Meet, Zoom or Teams link so your mentee can join.' : 'Your mentor will add the call link here before the session.'}
        </p>
      )}
      {onSave && active && !editing && (
        <button type="button" onClick={() => { setValue(session.meetingLink || ''); setEditing(true) }} className="block mt-2 text-sm text-primary-700 font-semibold hover:underline">
          {current ? 'Change link' : 'Add link'}
        </button>
      )}
      {editing && (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij"
            aria-label="Video call link"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving…' : 'Save link'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

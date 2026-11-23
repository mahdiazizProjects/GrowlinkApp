import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, UserCheck, Mail, MapPin, Calendar, Trash2, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import * as api from '../services/api'
import { isCloudBackend } from '../services/backend'
import { useToast, errorMessage } from '../components/ui/Toast'
import type { Event, Venue } from '../types'

type Tab = 'applications' | 'messages' | 'venues' | 'events'

const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm'

export default function Admin() {
  const { isAdmin } = useApp()
  const [tab, setTab] = useState<Tab>('applications')

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-xl shadow p-8 text-center">
          <ShieldCheck className="mx-auto text-gray-400 mb-3" size={40} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admins only</h1>
          <p className="text-gray-600 mb-4">
            Your account isn't in the ADMIN group. An existing admin can add you in the Cognito console.
          </p>
          <Link to="/" className="text-primary-600 font-semibold">Back home</Link>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    { id: 'applications', label: 'Mentor applications', icon: <UserCheck size={18} /> },
    { id: 'messages', label: 'Contact messages', icon: <Mail size={18} /> },
    { id: 'venues', label: 'Venues', icon: <MapPin size={18} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={18} /> }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <ShieldCheck className="text-primary-600" /> Admin
        </h1>
        {!isCloudBackend && (
          <p className="text-sm text-amber-800 mb-4">Local demo mode: every demo account can open this page.</p>
        )}
        <div className="flex flex-wrap gap-2 my-6" role="tablist">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'applications' && <Applications />}
        {tab === 'messages' && <Messages />}
        {tab === 'venues' && <Venues />}
        {tab === 'events' && <Events />}
      </div>
    </div>
  )
}

/** Loads a list, exposing reload and an error message. */
function useList<T>(load: () => Promise<T[]>) {
  const [items, setItems] = useState<T[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const reload = useCallback(async () => {
    try {
      setItems(await load())
      setError(null)
    } catch (e) {
      setError(errorMessage(e, 'Could not load this list.'))
      setItems([])
    }
  }, [load])
  useEffect(() => { reload() }, [reload])
  return { items, error, reload, setItems }
}

function ListState({ items, error, empty }: { items: unknown[] | null; error: string | null; empty: string }) {
  if (error) return <p role="alert" className="text-red-600 text-sm">{error}</p>
  if (items === null) return <p className="text-gray-500 text-sm">Loading…</p>
  if (items.length === 0) return <p className="text-gray-500 text-sm bg-white rounded-xl p-6 text-center">{empty}</p>
  return null
}

function Applications() {
  const { notifyUser } = useApp()
  const toast = useToast()
  const { items, error, reload } = useList(api.listMentorApplications)
  const [busy, setBusy] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)

  const decide = async (app: api.MentorApplicationRecord, status: 'APPROVED' | 'REJECTED') => {
    setBusy(app.id)
    try {
      if (status === 'APPROVED' && app.userId) {
        const user = await api.getUser(app.userId)
        // Someone who was a mentee keeps that side too.
        const role = user && (user.role || '').toString().toUpperCase() === 'MENTEE' ? 'BOTH' : 'MENTOR'
        const details = app.details as { bio?: string; location?: string; skills?: string[] }
        await api.updateUser(app.userId, {
          role,
          ...(details.bio && !user?.bio && { bio: details.bio }),
          ...(details.location && !user?.location && { location: details.location }),
          ...(Array.isArray(details.skills) && (!user?.skills || user.skills.length === 0) && { skills: details.skills })
        })
      }
      await api.setMentorApplicationStatus(app.id, status)
      if (app.userId) {
        notifyUser({
          userId: app.userId,
          title: status === 'APPROVED' ? 'You are now a GrowLink mentor' : 'Mentor application update',
          message: status === 'APPROVED'
            ? 'Your application was approved. Set your availability from the dashboard so mentees can book you.'
            : 'Thanks for applying. We are not able to approve your mentor application right now.',
          type: 'admin-update',
          relatedId: app.id
        })
      }
      toast.success(status === 'APPROVED'
        ? app.userId ? `${app.name} is now a mentor.` : `Approved. ${app.name} applied without an account, so email them at ${app.email} to sign up.`
        : 'Application rejected.')
      await reload()
    } catch (e) {
      toast.error(errorMessage(e, 'Could not update the application.'))
    } finally {
      setBusy(null)
    }
  }

  const visible = (items || []).filter(a => showDone || a.status === 'SUBMITTED')

  return (
    <section>
      <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)} />
        Show approved and rejected
      </label>
      <ListState items={items === null ? null : visible} error={error} empty="No applications waiting for review." />
      <ul className="space-y-4">
        {visible.map(app => {
          const d = app.details as { bio?: string; location?: string; skills?: string[]; experience?: string; whyMentor?: string }
          return (
            <li key={app.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{app.name}</p>
                  <p className="text-sm text-gray-600">{app.email}{d.location ? ` • ${d.location}` : ''}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(app.createdAt).toLocaleString()} • {app.userId ? 'Has an account' : 'No account yet'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  app.status === 'APPROVED' ? 'bg-green-100 text-green-700' : app.status === 'REJECTED' ? 'bg-gray-200 text-gray-700' : 'bg-amber-100 text-amber-800'
                }`}>{app.status.toLowerCase()}</span>
              </div>
              {Array.isArray(d.skills) && d.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {d.skills.map(s => <span key={s} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs">{s}</span>)}
                </div>
              )}
              <dl className="text-sm text-gray-700 space-y-2">
                {d.experience && <div><dt className="font-semibold inline">Experience: </dt><dd className="inline">{d.experience}</dd></div>}
                {d.bio && <div><dt className="font-semibold">Background</dt><dd className="whitespace-pre-line">{d.bio}</dd></div>}
                {d.whyMentor && <div><dt className="font-semibold">Why they want to mentor</dt><dd className="whitespace-pre-line">{d.whyMentor}</dd></div>}
              </dl>
              {app.status === 'SUBMITTED' && (
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    disabled={busy === app.id}
                    onClick={() => decide(app, 'APPROVED')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy === app.id}
                    onClick={() => decide(app, 'REJECTED')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Messages() {
  const toast = useToast()
  const { items, error, setItems } = useList(api.listContactMessages)

  const remove = async (id: string) => {
    if (!confirm('Delete this message?')) return
    try {
      await api.deleteContactMessage(id)
      setItems(prev => (prev || []).filter(m => m.id !== id))
    } catch (e) {
      toast.error(errorMessage(e, 'Could not delete the message.'))
    }
  }

  return (
    <section>
      <ListState items={items} error={error} empty="No messages yet." />
      <ul className="space-y-3">
        {(items || []).map(m => (
          <li key={m.id} className="bg-white rounded-xl shadow p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{m.subject || '(no subject)'}</p>
                <p className="text-sm text-gray-600">
                  {m.name} • <a className="text-primary-600" href={`mailto:${m.email}`}>{m.email}</a> • {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
              <button type="button" onClick={() => remove(m.id)} className="text-gray-400 hover:text-red-600" aria-label="Delete message">
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-800 mt-3 whitespace-pre-line break-words">{m.message}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

const emptyVenue = { name: '', type: 'library' as Venue['type'], address: '', city: '', capacity: 20, amenities: '', image: '', partnershipTier: 'bronze' as Venue['partnershipTier'] }

function Venues() {
  const { venues, reloadCatalog } = useApp()
  const toast = useToast()
  const [form, setForm] = useState(emptyVenue)
  const [saving, setSaving] = useState(false)
  // Built-in demo venues are shown when the table is empty; they can't be deleted.
  const stored = venues.filter(v => !v.id.startsWith('venue-') || !isCloudBackend)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createVenue({
        name: form.name.trim(),
        type: form.type,
        address: form.address.trim(),
        city: form.city.trim(),
        capacity: Number(form.capacity) || 0,
        amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
        image: form.image.trim(),
        isPartner: true,
        partnershipTier: form.partnershipTier
      })
      setForm(emptyVenue)
      await reloadCatalog()
      toast.success('Venue added.')
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add the venue.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (v: Venue) => {
    if (!confirm(`Delete ${v.name}?`)) return
    try {
      await api.deleteVenue(v.id)
      await reloadCatalog()
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the venue.'))
    }
  }

  return (
    <section className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={save} className="bg-white rounded-xl shadow p-6 space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Plus size={18} /> Add venue</h2>
        <input className={input} placeholder="Name" aria-label="Venue name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <select className={input} aria-label="Venue type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Venue['type'] })}>
            <option value="library">Library</option>
            <option value="co-working">Co-working</option>
            <option value="cafe">Cafe</option>
            <option value="community-center">Community center</option>
          </select>
          <select className={input} aria-label="Partnership tier" value={form.partnershipTier} onChange={e => setForm({ ...form, partnershipTier: e.target.value as Venue['partnershipTier'] })}>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
          </select>
        </div>
        <input className={input} placeholder="Address" aria-label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input className={input} placeholder="City" aria-label="City" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          <input className={input} type="number" min={1} placeholder="Capacity" aria-label="Capacity" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
        </div>
        <input className={input} placeholder="Amenities, comma separated" aria-label="Amenities" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} />
        <input className={input} type="url" placeholder="Image URL (optional)" aria-label="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-60">
          {saving ? 'Saving…' : 'Add venue'}
        </button>
      </form>
      <div>
        <ListState items={stored} error={null} empty="No venues stored yet. Built-in examples are shown until you add one." />
        <ul className="space-y-2">
          {stored.map(v => (
            <li key={v.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{v.name}</p>
                <p className="text-sm text-gray-600">{v.city} • {v.type.replace('-', ' ')} • {v.capacity} people</p>
              </div>
              <button type="button" onClick={() => remove(v)} className="text-gray-400 hover:text-red-600" aria-label={`Delete ${v.name}`}>
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const emptyEvent = { title: '', description: '', type: 'hangout' as Event['type'], venueId: '', date: '', time: '18:00', duration: 90, maxAttendees: 20, isVirtual: false, price: 0, tags: '', image: '' }

function Events() {
  const { events, venues, currentUser, reloadCatalog } = useApp()
  const toast = useToast()
  const [form, setForm] = useState(emptyEvent)
  const [saving, setSaving] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setSaving(true)
    try {
      await api.createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        venueId: form.isVirtual ? undefined : form.venueId || undefined,
        hostId: currentUser.id,
        date: form.date,
        time: form.time,
        duration: Number(form.duration) || 60,
        maxAttendees: Number(form.maxAttendees) || 0,
        isVirtual: form.isVirtual,
        price: Number(form.price) || 0,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        image: form.image.trim() || undefined
      })
      setForm(emptyEvent)
      await reloadCatalog()
      toast.success('Event published.')
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the event.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (ev: Event) => {
    if (!confirm(`Delete "${ev.title}"? Attendees will no longer see it.`)) return
    try {
      await api.deleteEvent(ev.id)
      await reloadCatalog()
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the event.'))
    }
  }

  return (
    <section className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={save} className="bg-white rounded-xl shadow p-6 space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Plus size={18} /> New event</h2>
        <input className={input} placeholder="Title" aria-label="Event title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea className={input} rows={3} placeholder="Description" aria-label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <select className={input} aria-label="Event type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Event['type'] })}>
            <option value="hangout">Hangout</option>
            <option value="workshop">Workshop</option>
            <option value="networking">Networking</option>
            <option value="casual-meetup">Casual meetup</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isVirtual} onChange={e => setForm({ ...form, isVirtual: e.target.checked })} /> Virtual
          </label>
        </div>
        {!form.isVirtual && (
          <select className={input} aria-label="Venue" value={form.venueId} onChange={e => setForm({ ...form, venueId: e.target.value })}>
            <option value="">Venue to be announced</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name} ({v.city})</option>)}
          </select>
        )}
        <div className="grid grid-cols-3 gap-3">
          <input className={input} type="date" aria-label="Date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input className={input} type="time" aria-label="Start time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          <input className={input} type="number" min={15} step={15} aria-label="Duration in minutes" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className={input} type="number" min={0} aria-label="Maximum attendees (0 for no limit)" placeholder="Max attendees" value={form.maxAttendees} onChange={e => setForm({ ...form, maxAttendees: Number(e.target.value) })} />
          <input className={input} type="number" min={0} step="0.01" aria-label="Price" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <input className={input} placeholder="Tags, comma separated" aria-label="Tags" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        <input className={input} type="url" placeholder="Image URL (optional)" aria-label="Event image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
        <p className="text-xs text-gray-500">Times are in your local time zone. 0 attendees means no limit.</p>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-60">
          {saving ? 'Publishing…' : 'Publish event'}
        </button>
      </form>
      <div>
        <ListState items={events} error={null} empty="No events yet." />
        <ul className="space-y-2">
          {events.map(ev => (
            <li key={ev.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{ev.title}</p>
                <p className="text-sm text-gray-600">
                  {ev.date} {ev.time} • {ev.attendees.length}{ev.maxAttendees ? `/${ev.maxAttendees}` : ''} attending
                </p>
              </div>
              <button type="button" onClick={() => remove(ev)} className="text-gray-400 hover:text-red-600" aria-label={`Delete ${ev.title}`}>
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

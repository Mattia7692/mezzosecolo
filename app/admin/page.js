'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ---- Helpers ----

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RsvpBadge({ status }) {
  const map = {
    pending: { label: 'In attesa', bg: '#6b7280', text: '#fff' },
    attending: { label: 'Parteciperà', bg: '#16a34a', text: '#fff' },
    not_attending: { label: 'Non verrà', bg: '#dc2626', text: '#fff' },
  }
  const s = map[status] || map.pending
  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.text, whiteSpace: 'nowrap' }}
    >
      {s.label}
    </span>
  )
}

// ---- Section components ----

function isoFromItalian(dateStr) {
  const months = { gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6, luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12 }
  const match = dateStr?.match(/(\d+)\s+(\w+)\s+(\d{4})/)
  if (!match) return '2026-06-18'
  const day = match[1].padStart(2, '0')
  const month = months[match[2].toLowerCase()]
  const year = match[3]
  if (!month) return '2026-06-18'
  return `${year}-${String(month).padStart(2, '0')}-${day}`
}

function italianFromIso(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  const s = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function SettingsSection() {
  const [form, setForm] = useState({ address: '', eventDate: 'Giovedì 18 Giugno 2026', eventTime: 'dalle ore 19:00 in poi', customText: '' })
  const [dateIso, setDateIso] = useState('2026-06-18')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const eventDate = data.eventDate || 'Giovedì 18 Giugno 2026'
        setForm({
          address: data.address || '',
          eventDate,
          eventTime: data.eventTime || 'dalle ore 19:00 in poi',
          customText: data.customText || '',
        })
        setDateIso(isoFromItalian(eventDate))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handleDateChange(e) {
    const iso = e.target.value
    setDateIso(iso)
    if (iso) setForm((f) => ({ ...f, eventDate: italianFromIso(iso) }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Impostazioni salvate!' })
      } else {
        setMessage({ type: 'error', text: 'Errore nel salvataggio' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Errore di rete' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-400 text-sm">Caricamento…</p>

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Data evento</label>
          <input
            type="date"
            value={dateIso}
            onChange={handleDateChange}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-yellow-500"
            style={{ colorScheme: 'dark' }}
          />
          {form.eventDate && (
            <p className="text-xs text-gray-400 mt-1">{form.eventDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Orario</label>
          <input
            type="text"
            value={form.eventTime}
            onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
            placeholder="dalle ore 19:00 in poi"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Indirizzo festa</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Via Roma 1, Milano"
          className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Testo invito</label>
        <textarea
          value={form.customText}
          onChange={(e) => setForm({ ...form, customText: e.target.value })}
          rows={8}
          placeholder="Scrivi qui il testo personalizzato dell'invito…"
          className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-y"
        />
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-900/40 border border-green-600 text-green-300'
              : 'bg-red-900/40 border border-red-600 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg font-semibold transition-all"
          style={{
            background: saving ? 'rgba(201,168,76,0.5)' : '#c9a84c',
            color: '#1a1a2e',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Salvataggio…' : 'Salva impostazioni'}
        </button>
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams({
              address: form.address,
              eventDate: form.eventDate,
              eventTime: form.eventTime,
              customText: form.customText,
            })
            window.open(`/api/preview?${params}`, '_blank')
          }}
          className="px-6 py-2.5 rounded-lg font-semibold border transition-all"
          style={{ borderColor: '#c9a84c', color: '#c9a84c', background: 'transparent', cursor: 'pointer' }}
        >
          Anteprima email
        </button>
      </div>
    </form>
  )
}

function GuestsSection({ guests, onRefresh }) {
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [sendingId, setSendingId] = useState(null)
  const [sendingAll, setSendingAll] = useState(false)
  const [notification, setNotification] = useState(null)

  function notify(msg, type = 'success') {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 4000)
  }

  async function handleAddGuest(e) {
    e.preventDefault()
    setAdding(true)
    setAddError('')
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewName('')
        setNewEmail('')
        onRefresh()
        notify('Ospite aggiunto!')
      } else {
        setAddError(data.error || 'Errore')
      }
    } catch {
      setAddError('Errore di rete')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare questo ospite?')) return
    try {
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' })
      if (res.ok) {
        onRefresh()
        notify('Ospite eliminato')
      } else {
        notify('Errore eliminazione', 'error')
      }
    } catch {
      notify('Errore di rete', 'error')
    }
  }

  async function handleSendOne(id) {
    setSendingId(id)
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestIds: [id] }),
      })
      const data = await res.json()
      if (res.ok && data.sent > 0) {
        onRefresh()
        notify('Invito inviato!')
      } else {
        notify(data.message || data.error || "Errore nell'invio", 'error')
      }
    } catch {
      notify('Errore di rete', 'error')
    } finally {
      setSendingId(null)
    }
  }

  async function handleSendAll() {
    const notInvited = guests.filter((g) => !g.invitedAt)
    if (notInvited.length === 0) {
      notify('Tutti gli ospiti sono già stati invitati', 'info')
      return
    }
    if (!confirm(`Inviare inviti a ${notInvited.length} ospiti non ancora invitati?`)) return
    setSendingAll(true)
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      const data = await res.json()
      if (res.ok) {
        onRefresh()
        notify(`Inviati: ${data.sent}${data.failed > 0 ? ` | Falliti: ${data.failed}` : ''}`)
      } else {
        notify(data.error || "Errore nell'invio", 'error')
      }
    } catch {
      notify('Errore di rete', 'error')
    } finally {
      setSendingAll(false)
    }
  }

  const notInvitedCount = guests.filter((g) => !g.invitedAt).length

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            notification.type === 'success'
              ? 'bg-green-900/40 border border-green-600 text-green-300'
              : notification.type === 'info'
              ? 'bg-blue-900/40 border border-blue-600 text-blue-300'
              : 'bg-red-900/40 border border-red-600 text-red-300'
          }`}
        >
          {notification.msg}
        </div>
      )}

      {/* Add guest form */}
      <form onSubmit={handleAddGuest} className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome"
          required
          className="flex-1 min-w-[150px] px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
        />
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Email"
          required
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap"
          style={{ background: '#c9a84c', color: '#1a1a2e', cursor: adding ? 'not-allowed' : 'pointer' }}
        >
          {adding ? 'Aggiunta…' : '+ Aggiungi ospite'}
        </button>
      </form>

      {addError && (
        <p className="text-red-400 text-sm">{addError}</p>
      )}

      {/* Send all button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {guests.length} ospiti totali · {notInvitedCount} non ancora invitati
        </p>
        <button
          onClick={handleSendAll}
          disabled={sendingAll || notInvitedCount === 0}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: notInvitedCount === 0 || sendingAll ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.8)',
            color: '#fff',
            cursor: notInvitedCount === 0 || sendingAll ? 'not-allowed' : 'pointer',
            border: '1px solid rgba(99,102,241,0.5)',
          }}
        >
          {sendingAll ? 'Invio in corso…' : `Invia a tutti i non invitati (${notInvitedCount})`}
        </button>
      </div>

      {/* Guests table */}
      {guests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">Nessun ospite ancora</p>
          <p className="text-sm">Aggiungi il primo ospite con il form qui sopra</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Stato RSVP</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Risposta</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Invito inviato</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, i) => (
                <tr
                  key={guest.id}
                  className="border-b border-gray-700/50 transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-white font-medium">{guest.name}</td>
                  <td className="px-4 py-3 text-gray-300">{guest.email}</td>
                  <td className="px-4 py-3">
                    <RsvpBadge status={guest.rsvpStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(guest.rsvpAt)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {guest.invitedAt ? formatDate(guest.invitedAt) : <span className="text-yellow-500/70">Non inviato</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSendOne(guest.id)}
                        disabled={sendingId === guest.id}
                        className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                        style={{
                          background: sendingId === guest.id ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.7)',
                          color: '#fff',
                          cursor: sendingId === guest.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {sendingId === guest.id ? '…' : guest.invitedAt ? 'Rinvia' : 'Invia'}
                      </button>
                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                        style={{
                          background: 'rgba(220,38,38,0.2)',
                          color: '#fca5a5',
                          border: '1px solid rgba(220,38,38,0.4)',
                          cursor: 'pointer',
                        }}
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatsSection({ guests }) {
  const total = guests.length
  const attending = guests.filter((g) => g.rsvpStatus === 'attending').length
  const notAttending = guests.filter((g) => g.rsvpStatus === 'not_attending').length
  const pending = guests.filter((g) => g.rsvpStatus === 'pending').length
  const invited = guests.filter((g) => g.invitedAt).length

  const stats = [
    { label: 'Ospiti totali', value: total, color: '#c9a84c' },
    { label: 'Inviti inviati', value: invited, color: '#818cf8' },
    { label: 'Parteciperà', value: attending, color: '#4ade80' },
    { label: 'Non verrà', value: notAttending, color: '#f87171' },
    { label: 'In attesa', value: pending, color: '#9ca3af' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl p-4 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-4xl font-bold mb-1" style={{ color: s.color }}>
            {s.value}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ---- Main Admin Page ----

export default function AdminPage() {
  const [guests, setGuests] = useState([])
  const [loadingGuests, setLoadingGuests] = useState(true)
  const [activeTab, setActiveTab] = useState('guests')
  const router = useRouter()

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch('/api/guests')
      const data = await res.json()
      setGuests(Array.isArray(data) ? data : [])
    } catch {
      setGuests([])
    } finally {
      setLoadingGuests(false)
    }
  }, [])

  useEffect(() => {
    fetchGuests()
  }, [fetchGuests])

  async function handleLogout() {
    window.location.href = '/api/auth/logout'
  }

  const tabs = [
    { id: 'stats', label: 'Statistiche' },
    { id: 'guests', label: 'Ospiti' },
    { id: 'settings', label: 'Impostazioni evento' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#111827' }}>
      {/* Top nav */}
      <nav
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: '#1a1a2e', borderBottom: '1px solid rgba(201,168,76,0.3)' }}
      >
        <div>
          <h1
            className="text-2xl font-light"
            style={{ color: '#faf8f3', fontFamily: 'Georgia, serif', letterSpacing: '1px' }}
          >
            Mezzo Secolo
          </h1>
          <p className="text-xs" style={{ color: '#c9a84c', letterSpacing: '2px' }}>
            Dashboard
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm px-4 py-2 rounded-lg transition-all"
          style={{
            color: '#9ca3af',
            border: '1px solid rgba(156,163,175,0.3)',
            cursor: 'pointer',
          }}
        >
          Esci
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all"
              style={
                activeTab === tab.id
                  ? { background: '#c9a84c', color: '#1a1a2e' }
                  : { color: '#9ca3af', cursor: 'pointer' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="rounded-xl p-6"
          style={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {activeTab === 'stats' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Statistiche</h2>
              {loadingGuests ? (
                <p className="text-gray-400 text-sm">Caricamento…</p>
              ) : (
                <StatsSection guests={guests} />
              )}
            </>
          )}

          {activeTab === 'guests' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Gestione ospiti</h2>
              {loadingGuests ? (
                <p className="text-gray-400 text-sm">Caricamento…</p>
              ) : (
                <GuestsSection guests={guests} onRefresh={fetchGuests} />
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Impostazioni evento</h2>
              <SettingsSection />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

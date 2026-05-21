'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function RsvpPage() {
  const params = useParams()
  const token = params.token

  const [guest, setGuest] = useState(null)
  const [settings, setSettings] = useState({ eventDate: '18 Giugno 2026', eventTime: 'dalle ore 19:00' })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [step, setStep] = useState('main') // 'main' | 'party-size'

  useEffect(() => {
    async function fetchData() {
      try {
        const guestRes = await fetch(`/api/rsvp/${token}`)
        if (guestRes.status === 404) { setNotFound(true); return }
        const guestData = await guestRes.json()
        setGuest(guestData)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }

      try {
        const settingsRes = await fetch('/api/settings')
        if (settingsRes.ok) {
          const s = await settingsRes.json()
          setSettings({ eventDate: s.eventDate, eventTime: s.eventTime })
        }
      } catch {
        // usa i valori di default
      }
    }
    if (token) fetchData()
  }, [token])

  async function handleRsvp(status, partySize = 1) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, partySize }),
      })
      const data = await res.json()
      if (res.ok) {
        setGuest(data)
        setConfirmed(true)
        setStep('main')
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="text-center py-16">
          <div
            className="inline-block w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }}
          />
          <p className="mt-4" style={{ color: '#c9a84c' }}>Caricamento…</p>
        </div>
      </PageWrapper>
    )
  }

  if (notFound || !guest) {
    return (
      <PageWrapper>
        <Card>
          <div className="text-center py-8">
            <p className="text-5xl mb-6">🔍</p>
            <h2 className="text-2xl font-light mb-3" style={{ color: '#2d2d2d', fontFamily: 'Georgia, serif' }}>
              Link non valido
            </h2>
            <p className="text-gray-500">Questo link di invito non è valido o è scaduto.</p>
            <p className="text-sm text-gray-400 mt-4">Se hai ricevuto un invito, controlla di aver copiato il link correttamente.</p>
          </div>
        </Card>
      </PageWrapper>
    )
  }

  const alreadyAnswered = guest.rsvpStatus !== 'pending'

  return (
    <PageWrapper>
      {/* Header */}
      <div className="text-center mb-8">
        <p style={{ color: '#c9a84c', letterSpacing: '4px', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Un invito speciale
        </p>
        <h1 className="text-5xl font-light mb-2" style={{ color: '#faf8f3', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>
          Mezzo Secolo
        </h1>
        <p style={{ color: '#c9a84c', fontSize: '16px' }}>50 anni di Mattia Baldini</p>
      </div>

      <Card>
        {/* Greeting */}
        <div className="text-center mb-8 pb-6" style={{ borderBottom: '1px solid #e8e0d0' }}>
          <p className="text-lg text-gray-500 mb-1">Caro/Cara</p>
          <h2 className="text-3xl font-light" style={{ color: '#2d2d2d', fontFamily: 'Georgia, serif' }}>
            {guest.name}
          </h2>
        </div>

        {/* Event info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-lg text-center" style={{ background: '#f5f0e8', border: '1px solid #e8e0d0' }}>
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '4px' }}>Quando</p>
            <p style={{ color: '#2d2d2d', fontWeight: 600 }}>{settings.eventDate}</p>
            <p style={{ color: '#6a6a6a', fontSize: '14px' }}>{settings.eventTime}</p>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ background: '#f5f0e8', border: '1px solid #e8e0d0' }}>
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '4px' }}>Ti aspetto</p>
            <p style={{ color: '#2d2d2d', fontWeight: 600 }}>Segna in agenda!</p>
            <p style={{ color: '#6a6a6a', fontSize: '14px' }}>Ci vediamo lì 🥂</p>
          </div>
        </div>

        {/* RSVP Area */}
        {confirmed || (alreadyAnswered && step === 'main') ? (
          <ConfirmationMessage
            guest={guest}
            settings={settings}
            onChangeResponse={() => { setConfirmed(false); setStep('main'); setGuest({ ...guest, rsvpStatus: 'pending' }) }}
          />
        ) : step === 'party-size' ? (
          <PartySizeStep
            onConfirm={(n) => handleRsvp('attending', n)}
            onBack={() => setStep('main')}
            submitting={submitting}
          />
        ) : alreadyAnswered ? (
          <AlreadyAnsweredSection
            guest={guest}
            onAttending={() => setStep('party-size')}
            onNotAttending={() => handleRsvp('not_attending')}
            submitting={submitting}
          />
        ) : (
          <PendingButtons
            onAttending={() => setStep('party-size')}
            onNotAttending={() => handleRsvp('not_attending')}
            submitting={submitting}
          />
        )}
      </Card>

      <p className="text-center mt-8 text-sm" style={{ color: 'rgba(250,248,243,0.4)' }}>
        Con affetto, Mattia
      </p>
    </PageWrapper>
  )
}

function PendingButtons({ onAttending, onNotAttending, submitting }) {
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-500 mb-6">Puoi partecipare alla festa?</p>
      <button
        onClick={onAttending}
        disabled={submitting}
        className="w-full py-4 rounded-xl text-lg font-semibold transition-all"
        style={{
          background: submitting ? '#86efac' : '#16a34a',
          color: '#fff',
          cursor: submitting ? 'not-allowed' : 'pointer',
          boxShadow: submitting ? 'none' : '0 4px 20px rgba(22,163,74,0.4)',
        }}
      >
        Parteciperò! 🎉
      </button>
      <button
        onClick={onNotAttending}
        disabled={submitting}
        className="w-full py-3 rounded-xl text-base font-medium transition-all"
        style={{ background: '#f3f4f6', color: '#6b7280', cursor: submitting ? 'not-allowed' : 'pointer', border: '1px solid #e5e7eb' }}
      >
        Non potrò esserci
      </button>
    </div>
  )
}

function PartySizeStep({ onConfirm, onBack, submitting }) {
  const [selected, setSelected] = useState(1)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-2xl mb-1">🎉</p>
        <h3 className="text-xl font-semibold mb-1" style={{ color: '#2d2d2d', fontFamily: 'Georgia, serif' }}>
          Perfetto!
        </h3>
        <p className="text-gray-500 text-sm">In quanti venite?</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className="py-3 rounded-xl text-lg font-bold transition-all"
            style={{
              background: selected === n ? '#16a34a' : '#f3f4f6',
              color: selected === n ? '#fff' : '#374151',
              border: selected === n ? '2px solid #16a34a' : '2px solid transparent',
              boxShadow: selected === n ? '0 4px 12px rgba(22,163,74,0.3)' : 'none',
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400">
        {selected === 1 ? 'Solo tu' : `Tu + ${selected - 1} ${selected === 2 ? 'persona' : 'persone'}`}
      </p>

      <button
        onClick={() => onConfirm(selected)}
        disabled={submitting}
        className="w-full py-4 rounded-xl text-lg font-semibold transition-all"
        style={{
          background: submitting ? '#86efac' : '#16a34a',
          color: '#fff',
          cursor: submitting ? 'not-allowed' : 'pointer',
          boxShadow: submitting ? 'none' : '0 4px 20px rgba(22,163,74,0.4)',
        }}
      >
        {submitting ? 'Conferma in corso…' : `Confermo — siamo in ${selected}`}
      </button>

      <button
        onClick={onBack}
        disabled={submitting}
        className="w-full text-sm text-gray-400 underline"
        style={{ cursor: 'pointer', background: 'none', border: 'none' }}
      >
        Torna indietro
      </button>
    </div>
  )
}

function AlreadyAnsweredSection({ guest, onAttending, onNotAttending, submitting }) {
  return (
    <div className="space-y-5">
      <div
        className="p-4 rounded-xl text-center"
        style={{
          background: guest.rsvpStatus === 'attending' ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.1)',
          border: `1px solid ${guest.rsvpStatus === 'attending' ? 'rgba(22,163,74,0.3)' : 'rgba(107,114,128,0.3)'}`,
        }}
      >
        <p className="text-sm text-gray-500 mb-1">Hai già risposto:</p>
        <p className="text-lg font-semibold" style={{ color: guest.rsvpStatus === 'attending' ? '#16a34a' : '#6b7280' }}>
          {guest.rsvpStatus === 'attending'
            ? `Parteciperò! 🎉${guest.partySize > 1 ? ` (in ${guest.partySize})` : ''}`
            : 'Non potrò esserci'}
        </p>
      </div>

      <p className="text-center text-sm text-gray-400">Vuoi cambiare la tua risposta?</p>

      <div className="flex gap-3">
        <button
          onClick={onAttending}
          disabled={submitting}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: guest.rsvpStatus === 'attending' ? 'rgba(22,163,74,0.15)' : '#16a34a',
            color: guest.rsvpStatus === 'attending' ? '#16a34a' : '#fff',
            border: guest.rsvpStatus === 'attending' ? '1px solid rgba(22,163,74,0.4)' : 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          Parteciperò 🎉
        </button>
        <button
          onClick={onNotAttending}
          disabled={submitting}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: '#f3f4f6',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          Non potrò esserci
        </button>
      </div>
    </div>
  )
}

function ConfirmationMessage({ guest, settings, onChangeResponse }) {
  const isAttending = guest.rsvpStatus === 'attending'

  return (
    <div className="text-center py-4">
      <p className="text-5xl mb-4">{isAttending ? '🥂' : '💙'}</p>
      <h3 className="text-2xl font-light mb-3" style={{ color: '#2d2d2d', fontFamily: 'Georgia, serif' }}>
        {isAttending ? 'Fantastico!' : 'Mi dispiace'}
      </h3>
      <p className="text-gray-500 text-lg mb-2">
        {isAttending ? `Ti aspetto il ${settings.eventDate} 🥂` : 'Ci mancherai! 💙'}
      </p>
      {isAttending && guest.partySize > 1 && (
        <p className="text-sm text-gray-400 mb-4">
          Vi aspetto in {guest.partySize}!
        </p>
      )}

      <button
        onClick={onChangeResponse}
        className="text-sm underline text-gray-400 hover:text-gray-600 transition-colors mt-4"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Cambia risposta
      </button>
    </div>
  )
}

function PageWrapper({ children }) {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <div className="max-w-lg mx-auto">{children}</div>
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="rounded-2xl p-8" style={{ background: '#faf8f3', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      {children}
    </div>
  )
}

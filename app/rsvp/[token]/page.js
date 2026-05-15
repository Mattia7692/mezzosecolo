'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function RsvpPage() {
  const params = useParams()
  const token = params.token

  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    async function fetchGuest() {
      try {
        const res = await fetch(`/api/rsvp/${token}`)
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        const data = await res.json()
        setGuest(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchGuest()
  }, [token])

  async function handleRsvp(status) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (res.ok) {
        setGuest(data)
        setConfirmed(true)
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  function handleChangeResponse() {
    setConfirmed(false)
  }

  // ---- States ----

  if (loading) {
    return (
      <PageWrapper>
        <div className="text-center py-16">
          <div
            className="inline-block w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
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
            <h2
              className="text-2xl font-light mb-3"
              style={{ color: '#2d2d2d', fontFamily: 'Georgia, serif' }}
            >
              Link non valido
            </h2>
            <p className="text-gray-500">
              Questo link di invito non è valido o è scaduto.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Se hai ricevuto un invito, controlla di aver copiato il link correttamente.
            </p>
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
        <h1
          className="text-5xl font-light mb-2"
          style={{ color: '#faf8f3', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}
        >
          Mezzo Secolo
        </h1>
        <p style={{ color: '#c9a84c', fontSize: '16px' }}>50 anni di Mattia Baldini</p>
      </div>

      <Card>
        {/* Greeting */}
        <div className="text-center mb-8 pb-6" style={{ borderBottom: '1px solid #e8e0d0' }}>
          <p className="text-lg text-gray-500 mb-1">Caro/Cara</p>
          <h2
            className="text-3xl font-light"
            style={{ color: '#2d2d2d', fontFamily: 'Georgia, serif' }}
          >
            {guest.name}
          </h2>
        </div>

        {/* Event info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            className="p-4 rounded-lg text-center"
            style={{ background: '#f5f0e8', border: '1px solid #e8e0d0' }}
          >
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '4px' }}>
              Quando
            </p>
            <p style={{ color: '#2d2d2d', fontWeight: 600 }}>18 Giugno 2026</p>
            <p style={{ color: '#6a6a6a', fontSize: '14px' }}>dalle ore 19:00</p>
          </div>
          <div
            className="p-4 rounded-lg text-center"
            style={{ background: '#f5f0e8', border: '1px solid #e8e0d0' }}
          >
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '4px' }}>
              Giovedì
            </p>
            <p style={{ color: '#2d2d2d', fontWeight: 600 }}>Segna in agenda!</p>
            <p style={{ color: '#6a6a6a', fontSize: '14px' }}>Ci vediamo lì 🥂</p>
          </div>
        </div>

        {/* RSVP Area */}
        {(confirmed || alreadyAnswered) && !(!confirmed && alreadyAnswered && guest.rsvpStatus === 'pending') ? (
          <ConfirmationMessage status={guest.rsvpStatus} onChangeResponse={handleChangeResponse} />
        ) : !confirmed && alreadyAnswered ? (
          <AlreadyAnsweredSection
            guest={guest}
            onRsvp={handleRsvp}
            submitting={submitting}
            onConfirmed={() => setConfirmed(true)}
          />
        ) : (
          <PendingButtons onRsvp={handleRsvp} submitting={submitting} />
        )}
      </Card>

      {/* Footer */}
      <p className="text-center mt-8 text-sm" style={{ color: 'rgba(250,248,243,0.4)' }}>
        Con affetto, Mattia
      </p>
    </PageWrapper>
  )
}

function PendingButtons({ onRsvp, submitting }) {
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-500 mb-6">Puoi partecipare alla festa?</p>
      <button
        onClick={() => onRsvp('attending')}
        disabled={submitting}
        className="w-full py-4 rounded-xl text-lg font-semibold transition-all"
        style={{
          background: submitting ? '#86efac' : '#16a34a',
          color: '#fff',
          cursor: submitting ? 'not-allowed' : 'pointer',
          boxShadow: submitting ? 'none' : '0 4px 20px rgba(22,163,74,0.4)',
        }}
      >
        {submitting ? 'Conferma in corso…' : 'Parteciperò! 🎉'}
      </button>
      <button
        onClick={() => onRsvp('not_attending')}
        disabled={submitting}
        className="w-full py-3 rounded-xl text-base font-medium transition-all"
        style={{
          background: '#f3f4f6',
          color: '#6b7280',
          cursor: submitting ? 'not-allowed' : 'pointer',
          border: '1px solid #e5e7eb',
        }}
      >
        Non potrò esserci
      </button>
    </div>
  )
}

function AlreadyAnsweredSection({ guest, onRsvp, submitting, onConfirmed }) {
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
        <p
          className="text-lg font-semibold"
          style={{ color: guest.rsvpStatus === 'attending' ? '#16a34a' : '#6b7280' }}
        >
          {guest.rsvpStatus === 'attending' ? 'Parteciperò! 🎉' : 'Non potrò esserci'}
        </p>
      </div>

      <p className="text-center text-sm text-gray-400">Vuoi cambiare la tua risposta?</p>

      <div className="flex gap-3">
        <button
          onClick={() => { onRsvp('attending'); onConfirmed(); }}
          disabled={submitting || guest.rsvpStatus === 'attending'}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: guest.rsvpStatus === 'attending' ? '#86efac' : '#16a34a',
            color: '#fff',
            cursor: submitting || guest.rsvpStatus === 'attending' ? 'not-allowed' : 'pointer',
          }}
        >
          Parteciperò 🎉
        </button>
        <button
          onClick={() => { onRsvp('not_attending'); onConfirmed(); }}
          disabled={submitting || guest.rsvpStatus === 'not_attending'}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: '#f3f4f6',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            cursor: submitting || guest.rsvpStatus === 'not_attending' ? 'not-allowed' : 'pointer',
          }}
        >
          Non potrò esserci
        </button>
      </div>
    </div>
  )
}

function ConfirmationMessage({ status, onChangeResponse }) {
  const isAttending = status === 'attending'

  return (
    <div className="text-center py-4">
      <p className="text-5xl mb-4">{isAttending ? '🥂' : '💙'}</p>
      <h3
        className="text-2xl font-light mb-3"
        style={{ color: '#2d2d2d', fontFamily: 'Georgia, serif' }}
      >
        {isAttending ? 'Fantastico!' : 'Mi dispiace'}
      </h3>
      <p className="text-gray-500 text-lg mb-6">
        {isAttending
          ? 'Ti aspetto il 18 Giugno 🥂'
          : 'Ci mancherai! 💙'}
      </p>

      <button
        onClick={onChangeResponse}
        className="text-sm underline text-gray-400 hover:text-gray-600 transition-colors"
      >
        Cambia risposta
      </button>
    </div>
  )
}

function PageWrapper({ children }) {
  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <div className="max-w-lg mx-auto">{children}</div>
    </div>
  )
}

function Card({ children }) {
  return (
    <div
      className="rounded-2xl p-8"
      style={{
        background: '#faf8f3',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {children}
    </div>
  )
}

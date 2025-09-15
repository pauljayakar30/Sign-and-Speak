import React, { useState, useEffect } from 'react'
import CameraPanel from './CameraPanel.jsx'
import GoalRing from './GoalRing.jsx'
import StickerBook from './StickerBook.jsx'
import CharacterPicker from './CharacterPicker.jsx'

export default function ChildHome() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [avatar, setAvatar] = useState(() => localStorage.getItem('avatar') || 'otter')
  const [stars, setStars] = useState(() => Number(localStorage.getItem('stars') || '0'))
  const DAILY_GOAL = 10

  async function join() {
    const c = code.trim()
    if (!c) return
    setStatus('Joining…')
    try {
      const r = await fetch('/pair/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: c }) })
      const d = await r.json()
      if (d.error) setStatus(d.error)
      else { sessionStorage.setItem('pairCode', c); setStatus('Connected!') }
    } catch {
      setStatus('Network error')
    }
  }
  useEffect(() => {
    function onStars(e) { setStars(Number(localStorage.getItem('stars') || '0')) }
    window.addEventListener('starsUpdated', onStars)
    return () => window.removeEventListener('starsUpdated', onStars)
  }, [])

  function chooseAvatar(id) {
    setAvatar(id)
    try { localStorage.setItem('avatar', id) } catch {}
  }
  return (
    <section className="view child">
      <div className="hero">
        <div className="hero-left">
          <div className="avatar-badge" aria-label={`Avatar ${avatar}`}>{avatar === 'otter' ? '🦦' : avatar === 'panda' ? '🐼' : avatar === 'fox' ? '🦊' : '🦕'}</div>
          <div>
            <h2>Today’s Adventure</h2>
            <p className="muted">Practice a sign and earn a reward!</p>
            <div className="row">
              {!cameraOn ? (
                <button className="primary" onClick={() => setCameraOn(true)}>Start Adventure</button>
              ) : (
                <button className="secondary" onClick={() => setCameraOn(false)}>Stop Camera</button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="grid" style={{ alignItems: 'center' }}>
        <div className="card">
          <h3>Your Goal</h3>
          <div className="row" style={{ gap: 16 }}>
            <GoalRing value={stars} goal={DAILY_GOAL} />
            <div>
              <div className="mascot-callout"><span className="bubble">You’ve got this!</span></div>
              <p className="muted">Earn {DAILY_GOAL - Math.min(stars, DAILY_GOAL)} more stars to reach today’s goal.</p>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Sticker Book</h3>
          <StickerBook stars={stars} max={DAILY_GOAL} />
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h3>Choose Your Character</h3>
        <CharacterPicker value={avatar} onChange={chooseAvatar} />
      </div>
      {cameraOn && <CameraPanel />}
      <div className="card" style={{ marginTop: 12 }}>
        <h3>Connect to Parent</h3>
        <div className="row">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter Parent Code" />
          <button className="secondary" onClick={join}>Join</button>
        </div>
        <div className="status">{status}</div>
      </div>
    </section>
  )
}

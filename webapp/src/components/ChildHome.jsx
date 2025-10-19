/**
 * ChildHome Component - Redesigned
 * 
 * Playful, engaging view for child users featuring interactive sign language practice.
 */
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

  const avatarEmoji = avatar === 'otter' ? '🦦' : avatar === 'panda' ? '🐼' : avatar === 'fox' ? '🦊' : '🦕'
  const progress = Math.min(100, Math.round((stars / DAILY_GOAL) * 100))
  const starsLeft = Math.max(0, DAILY_GOAL - stars)

  return (
    <section className="child-view">
      {/* Hero Section */}
      <div className="child-hero">
        <div className="child-hero-content">
          <div className="child-greeting">
            <div className="child-avatar-lg">{avatarEmoji}</div>
            <div>
              <h1 className="child-title">Let's Learn Signs!</h1>
              <p className="child-subtitle">Practice and earn stars for your sticker collection</p>
            </div>
          </div>
          
          <div className="child-stats-row">
            <div className="child-stat-card primary">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-value">{stars}</div>
                <div className="stat-label">Stars Today</div>
              </div>
            </div>
            <div className="child-stat-card secondary">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-value">{progress}%</div>
                <div className="stat-label">Daily Goal</div>
              </div>
            </div>
            <div className="child-stat-card accent">
              <div className="stat-icon">🎨</div>
              <div className="stat-content">
                <div className="stat-value">{Math.floor(stars / 2)}</div>
                <div className="stat-label">Stickers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="child-content">
        {/* Practice Card */}
        <div className="child-card practice-card">
          <div className="card-header">
            <h2>🎮 Practice Zone</h2>
            <p className="card-subtitle">Show me a sign to earn stars!</p>
          </div>
          
          <div className="practice-actions">
            {!cameraOn ? (
              <button className="btn-primary large pulse-btn" onClick={() => setCameraOn(true)}>
                <span className="btn-icon">📸</span>
                Start Adventure
              </button>
            ) : (
              <button className="btn-secondary large" onClick={() => setCameraOn(false)}>
                <span className="btn-icon">⏸️</span>
                Stop Camera
              </button>
            )}
          </div>

          {starsLeft > 0 && (
            <div className="encouragement-box">
              <span className="encouragement-emoji">💪</span>
              <p>Only <strong>{starsLeft} more stars</strong> to complete today's goal!</p>
            </div>
          )}

          {stars >= DAILY_GOAL && (
            <div className="success-box">
              <span className="success-emoji">🎉</span>
              <p><strong>Amazing!</strong> You've completed today's goal!</p>
            </div>
          )}
        </div>

        {/* Goal Progress Card */}
        <div className="child-card goal-card">
          <div className="card-header">
            <h2>🎯 Today's Goal</h2>
          </div>
          
          <div className="goal-visual">
            <GoalRing value={stars} goal={DAILY_GOAL} size={120} stroke={12} />
            <div className="goal-details">
              <div className="goal-message">
                {stars === 0 && <p>Let's get started! 🚀</p>}
                {stars > 0 && stars < DAILY_GOAL / 2 && <p>Great start! Keep going! 💫</p>}
                {stars >= DAILY_GOAL / 2 && stars < DAILY_GOAL && <p>You're halfway there! 🌟</p>}
                {stars >= DAILY_GOAL && <p>Goal complete! You're a star! ⭐</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Sticker Collection */}
        <div className="child-card stickers-card">
          <div className="card-header">
            <h2>🎨 Sticker Collection</h2>
            <p className="card-subtitle">Unlock stickers as you earn stars!</p>
          </div>
          <StickerBook stars={stars} max={DAILY_GOAL} />
        </div>

        {/* Character Selection */}
        <div className="child-card character-card">
          <div className="card-header">
            <h2>✨ Choose Your Friend</h2>
            <p className="card-subtitle">Pick your learning buddy</p>
          </div>
          <CharacterPicker value={avatar} onChange={chooseAvatar} />
        </div>

        {/* Parent Connection */}
        <details className="child-card settings-card">
          <summary className="settings-header">
            <h3>⚙️ Parent Connection</h3>
          </summary>
          <div className="settings-content">
            <p className="settings-description">Ask your parent for the connection code</p>
            <div className="connection-row">
              <input 
                type="text" 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                placeholder="Enter code..." 
                className="connection-input"
              />
              <button className="btn-secondary" onClick={join}>Connect</button>
            </div>
            {status && <div className="connection-status">{status}</div>}
          </div>
        </details>
      </div>

      {/* Camera Panel Overlay */}
      {cameraOn && <CameraPanel />}
    </section>
  )
}

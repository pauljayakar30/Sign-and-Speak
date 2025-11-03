/**
 * ChildHome Component - Redesigned
 * 
 * Playful, engaging view for child users featuring interactive sign language practice.
 */
import React, { useState } from 'react'
import CameraPanel from './CameraPanel.jsx'
import RecognitionModeSelector from './RecognitionModeSelector.jsx'
import GoalRing from './GoalRing.jsx'
import StickerBook from './StickerBook.jsx'
import CharacterPicker from './CharacterPicker.jsx'
import { useStars, useAvatar } from '../contexts/AppContext.jsx'

export default function ChildHome() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [recognitionMode, setRecognitionMode] = useState('gestures')
  
  // Use context instead of local state and window events
  const { avatar, updateAvatar } = useAvatar()
  const { stars } = useStars()
  
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

  // No more window event listeners! Context handles everything 🎉

  function chooseAvatar(id) {
    updateAvatar(id)
  }

  const avatarEmoji = avatar === 'otter' ? '🦦' : avatar === 'panda' ? '🐼' : avatar === 'fox' ? '🦊' : '🦕'
  const progress = Math.min(100, Math.round((stars / DAILY_GOAL) * 100))
  const starsLeft = Math.max(0, DAILY_GOAL - stars)

  return (
    <section className="child-practice-view">
      {/* Main Split Layout - Camera Left, Controls Right */}
      <div className="practice-split-layout">
        {/* Left Side - Camera Feed */}
        <div className="practice-camera-section">
          <div className="practice-camera-card-mini">
            {!cameraOn ? (
              <div className="camera-placeholder">
                <h2>Ready to Practice?</h2>
                <p>Start your camera to begin learning signs</p>
                <button className="btn-start-practice" onClick={() => setCameraOn(true)}>
                  Start Practice →
                </button>
              </div>
            ) : (
              <div className="camera-feed-active">
                <div className="camera-controls-bar">
                  <div className="camera-status">
                    <div className="indicator-dot"></div>
                    <span>Camera Active</span>
                  </div>
                  <button className="btn-stop-camera" onClick={() => setCameraOn(false)}>
                    Stop Camera
                  </button>
                </div>
                <div className="camera-video-container">
                  <CameraPanel 
                    showUI={false}
                    recognitionMode={recognitionMode}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Controls and Recognition Mode */}
        <div className="practice-controls-section">
          {/* Camera & Microphone Controls */}
          <div className="media-controls-card">
            <div className="media-toggle-buttons">
              <button 
                className={`media-toggle-btn ${cameraOn ? 'active' : ''}`}
                onClick={() => setCameraOn(!cameraOn)}
                title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                <svg className="media-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {cameraOn ? (
                    // Camera Off Icon
                    <>
                      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M7 7H4C3.44772 7 3 7.44772 3 8V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 10.5V8C17 7.44772 16.5523 7 16 7H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 10.5L21 7.5V16.5L17 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </>
                  ) : (
                    // Camera On Icon
                    <>
                      <path d="M3 8C3 7.44772 3.44772 7 4 7H16C16.5523 7 17 7.44772 17 8V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M17 10.5L21 7.5V16.5L17 13.5V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </>
                  )}
                </svg>
                <span className="media-label">Camera</span>
              </button>
              <button 
                className="media-toggle-btn"
                disabled
                title="Microphone (coming soon)"
              >
                <svg className="media-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V23M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="media-label">Microphone</span>
              </button>
            </div>
          </div>

          {/* Recognition Mode Selector - Only show when camera is on */}
          {cameraOn && (
            <div className="recognition-mode-card">
              <h3>Recognition Mode</h3>
              <div className="recognition-mode-pills-vertical">
                <button 
                  className={`mode-pill-large ${recognitionMode === 'gestures' ? 'active' : ''}`}
                  onClick={() => setRecognitionMode('gestures')}
                >
                  <span className="pill-icon">👋</span>
                  <div className="pill-content">
                    <span className="pill-title">Daily Gestures</span>
                    <span className="pill-desc">Thumbs up, peace, OK, etc.</span>
                  </div>
                </button>
                <button 
                  className={`mode-pill-large ${recognitionMode === 'isl' ? 'active' : ''}`}
                  onClick={() => setRecognitionMode('isl')}
                >
                  <span className="pill-icon">🇮🇳</span>
                  <div className="pill-content">
                    <span className="pill-title">Indian Sign Language</span>
                    <span className="pill-desc">ISL alphabet (A-Z)</span>
                  </div>
                </button>
                <button 
                  className={`mode-pill-large ${recognitionMode === 'asl' ? 'active' : ''}`}
                  onClick={() => setRecognitionMode('asl')}
                  disabled
                >
                  <span className="pill-icon">🇺🇸</span>
                  <div className="pill-content">
                    <span className="pill-title">American Sign Language</span>
                    <span className="pill-desc">Coming Soon</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Motivation Messages */}
          {cameraOn && starsLeft > 0 && starsLeft <= 5 && (
            <div className="practice-motivation">
              <span className="motivation-icon">⭐</span>
              <p>Almost there! <strong>{starsLeft} more</strong> to reach your goal!</p>
            </div>
          )}

        </div>
      </div>
      
      {/* Bottom Section - Practice Time, Rewards and Options */}
      <div className="practice-bottom-section">
        {/* Practice Time Info */}
        <div className="practice-time-card">
          <div className="practice-user-info">
            <div className="practice-avatar-small">{avatarEmoji}</div>
            <div>
              <h3>Practice Time!</h3>
              <p>Show signs to earn rewards</p>
            </div>
          </div>
          <div className="progress-inline-full">
            <span className="progress-label">Daily Goal</span>
            <div className="progress-wrapper">
              <div className="progress-bar-full">
                <div className="progress-fill-full" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="progress-value">{stars} / {DAILY_GOAL} ⭐</span>
            </div>
          </div>
        </div>

        {/* Sticker Rewards */}
        <div className="practice-rewards-card-compact">
          <h3>🎨 Your Stickers</h3>
          <StickerBook stars={stars} max={DAILY_GOAL} />
        </div>

        {/* Character Selection */}
        <div className="practice-character-card-compact">
          <h3>✨ Your Buddy</h3>
          <CharacterPicker value={avatar} onChange={chooseAvatar} />
        </div>
      </div>
    </section>
  )
}

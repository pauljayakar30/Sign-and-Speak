/**
 * TrainingMode Component - Redesigned
 * 
 * Interactive training interface for practicing sign language
 */
import React, { useEffect, useMemo, useState } from 'react'
import CameraPanel from './CameraPanel.jsx'

const ALL_SIGNS = [
  'WAVE','SALUTE','HANDSHAKE',
  'THUMBS_UP','THUMBS_DOWN','OK','APPLAUSE',
  'POINT','COME_HERE','STOP','SHHH',
  'HIGH_FIVE','FIST_BUMP','CROSSED_FINGERS',
  'PEACE','FACEPALM','AIR_QUOTES',
  'MILK'
]

const FRIENDLY = {
  WAVE:'Wave', SALUTE:'Salute', HANDSHAKE:'Handshake',
  THUMBS_UP:'Thumbs Up', THUMBS_DOWN:'Thumbs Down', OK:'OK', APPLAUSE:'Clap',
  POINT:'Point', COME_HERE:'Come Here', STOP:'Stop', SHHH:'Shhh',
  HIGH_FIVE:'High Five', FIST_BUMP:'Fist Bump', CROSSED_FINGERS:'Crossed Fingers',
  PEACE:'Peace', FACEPALM:'Facepalm', AIR_QUOTES:'Air Quotes', MILK:'Fist'
}

const SIGN_DESCRIPTIONS = {
  WAVE: 'Raise your hand and move it side to side',
  SALUTE: 'Touch your forehead with your hand flat',
  HANDSHAKE: 'Extend your hand as if shaking hands',
  THUMBS_UP: 'Make a fist with thumb pointing up',
  THUMBS_DOWN: 'Make a fist with thumb pointing down',
  OK: 'Make a circle with thumb and index finger',
  APPLAUSE: 'Clap your hands together',
  POINT: 'Extend your index finger forward',
  COME_HERE: 'Curl your fingers toward yourself',
  STOP: 'Hold your hand up with palm facing forward',
  SHHH: 'Place index finger over your lips',
  HIGH_FIVE: 'Raise your hand with palm facing forward',
  FIST_BUMP: 'Make a fist and extend forward',
  CROSSED_FINGERS: 'Cross your middle finger over index',
  PEACE: 'Make a V with index and middle finger',
  FACEPALM: 'Place your palm over your face',
  AIR_QUOTES: 'Make quotation marks with both hands',
  MILK: 'Make a fist (like squeezing milk)'
}

export default function TrainingMode() {
  const [target, setTarget] = useState('WAVE')
  const [hits, setHits] = useState({})
  const [recent, setRecent] = useState('')
  const [uprightOffsetDeg, setUprightOffsetDeg] = useState(() => {
    try { return Number(localStorage.getItem('uprightOffsetDeg') || '0') } catch { return 0 }
  })

  const progress = useMemo(() => {
    const total = ALL_SIGNS.length
    const done = Object.keys(hits).filter(k => hits[k]).length
    return { total, done, pct: Math.round((done/total)*100) }
  }, [hits])

  useEffect(() => {
    function onDetected(e) {
      const val = e?.detail?.value
      if (!val) return
      setRecent(val)
      if (val === target) {
        setHits(h => ({ ...h, [val]: true }))
      }
    }
    window.addEventListener('signDetected', onDetected)
    return () => window.removeEventListener('signDetected', onDetected)
  }, [target])

  function calibrateUpright() {
    const ev = new CustomEvent('requestUprightAngle')
    let handled = false
    function onReply(e) {
      handled = true
      const { tipAngle } = e.detail || {}
      if (typeof tipAngle === 'number') {
        const offset = Math.max(-45, Math.min(45, Math.round(tipAngle + 90)))
        try { localStorage.setItem('uprightOffsetDeg', String(offset)) } catch {}
        setUprightOffsetDeg(offset)
      }
    }
    window.addEventListener('replyUprightAngle', onReply, { once: true })
    window.dispatchEvent(ev)
    setTimeout(() => {
      if (!handled) {
        window.removeEventListener('replyUprightAngle', onReply)
      }
    }, 400)
  }

  function resetCalibration() {
    try { localStorage.removeItem('uprightOffsetDeg') } catch {}
    setUprightOffsetDeg(0)
  }

  const isLearned = hits[target]
  const milestones = [
    { label: 'First sign learned', completed: progress.done >= 1, goal: 1 },
    { label: '25% progress', completed: progress.pct >= 25, goal: Math.ceil(progress.total * 0.25) },
    { label: '50% progress', completed: progress.pct >= 50, goal: Math.ceil(progress.total * 0.5) },
    { label: '75% progress', completed: progress.pct >= 75, goal: Math.ceil(progress.total * 0.75) },
    { label: 'All signs mastered!', completed: progress.pct >= 100, goal: progress.total }
  ]

  return (
    <section className="training-view">
      {/* Header with Progress */}
      <div className="training-header">
        <div className="training-title-row">
          <h1 className="training-title">
            <span>🎓</span>
            Training Mode
          </h1>
          <div className="training-progress-badge">
            <span>⭐</span>
            {progress.done} / {progress.total} Signs
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress.pct}%` }}></div>
        </div>
        <p className="progress-text">
          {progress.pct === 0 && "Let's start learning! Choose a sign below."}
          {progress.pct > 0 && progress.pct < 25 && `Great start! ${progress.done} signs learned.`}
          {progress.pct >= 25 && progress.pct < 50 && `You're doing awesome! Keep going!`}
          {progress.pct >= 50 && progress.pct < 75 && `Over halfway there! You're a star! 🌟`}
          {progress.pct >= 75 && progress.pct < 100 && `Almost there! Just a few more!`}
          {progress.pct === 100 && `🎉 Amazing! You've mastered all signs!`}
        </p>
      </div>

      {/* Main Content */}
      <div className="training-content">
        {/* Current Sign Selector */}
        <div className="training-card sign-selector-card">
          <div className="training-card-header">
            <span className="training-card-icon">🎯</span>
            <h2 className="training-card-title">Current Sign</h2>
          </div>

          <div className="current-sign-display">
            <div className="current-sign-label">Now Practicing</div>
            <div className="current-sign-name">{FRIENDLY[target] || target}</div>
            <div className={`current-sign-status ${isLearned ? 'learned' : 'learning'}`}>
              <span>{isLearned ? '✓' : '○'}</span>
              {isLearned ? 'Learned!' : 'Keep Practicing'}
            </div>
          </div>

          <label className="sign-selector-label">Choose a different sign:</label>
          <select className="sign-selector-dropdown" value={target} onChange={e => setTarget(e.target.value)}>
            {ALL_SIGNS.map(s => (
              <option key={s} value={s}>{FRIENDLY[s] || s} {hits[s] ? '✓' : ''}</option>
            ))}
          </select>

          <div className="sign-hint">
            <p className="sign-hint-text">
              <strong>How to do it:</strong> {SIGN_DESCRIPTIONS[target] || 'Show the sign clearly to the camera.'}
            </p>
          </div>

          {recent && (
            <div className="recent-detection">
              <p className="recent-detection-text">Last detected:</p>
              <p className="recent-detection-value">{FRIENDLY[recent] || recent}</p>
            </div>
          )}
        </div>

        {/* Calibration Settings */}
        <div className="training-card calibration-card">
          <div className="training-card-header">
            <span className="training-card-icon">⚙️</span>
            <h2 className="training-card-title">Settings</h2>
          </div>

          <div className="calibration-status">
            <span className="calibration-label">Upright Offset</span>
            <span className="calibration-value">{uprightOffsetDeg}°</span>
          </div>

          <div className="calibration-actions">
            <button className="btn-secondary" onClick={calibrateUpright}>
              Calibrate Upright
            </button>
            <button className="btn-secondary" onClick={resetCalibration}>
              Reset Calibration
            </button>
          </div>

          <div className="calibration-info">
            <p className="calibration-info-text">
              Calibration helps the camera recognize your hand position better. Use "Calibrate" if the camera isn't detecting signs correctly.
            </p>
          </div>
        </div>

        {/* Milestones Checklist */}
        <div className="training-card checklist-card">
          <div className="training-card-header">
            <span className="training-card-icon">📋</span>
            <h2 className="training-card-title">Milestones</h2>
          </div>

          <ul className="checklist-items">
            {milestones.map((milestone, i) => (
              <li key={i} className={`checklist-item ${milestone.completed ? 'completed' : ''}`}>
                <span className="checklist-icon">{milestone.completed ? '✅' : '⭕'}</span>
                <p className="checklist-text">{milestone.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Camera Panel */}
      <div className="training-card camera-section">
        <div className="camera-header">
          <h2 className="camera-title">
            <span>📹</span>
            Live Practice
          </h2>
          <div className="camera-live-badge">
            <span className="live-dot"></span>
            LIVE
          </div>
        </div>
        <CameraPanel />
      </div>

      {/* Sign Grid */}
      <div className="training-card sign-grid-card">
        <div className="training-card-header">
          <span className="training-card-icon">🎨</span>
          <h2 className="training-card-title">All Signs ({progress.done}/{progress.total})</h2>
        </div>

        <div className="sign-grid">
          {ALL_SIGNS.map(sign => (
            <div
              key={sign}
              className={`sign-grid-item ${hits[sign] ? 'learned' : ''} ${sign === target ? 'active' : ''}`}
              onClick={() => setTarget(sign)}
            >
              <p className="sign-grid-name">{FRIENDLY[sign] || sign}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

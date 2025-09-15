import React, { useEffect, useMemo, useState } from 'react'
import CameraPanel from './CameraPanel.jsx'

const ALL_SIGNS = [
  'WAVE','SALUTE','HANDSHAKE',
  'THUMBS_UP','THUMBS_DOWN','OK','APPLAUSE',
  'POINT','COME_HERE','STOP','SHHH',
  'HIGH_FIVE','FIST_BUMP','CROSSED_FINGERS',
  'PEACE','FACEPALM','AIR_QUOTES',
  'MILK' // old fist mapping
]

const FRIENDLY = {
  WAVE:'Wave', SALUTE:'Salute', HANDSHAKE:'Handshake',
  THUMBS_UP:'Thumbs Up', THUMBS_DOWN:'Thumbs Down', OK:'OK', APPLAUSE:'Clap',
  POINT:'Point', COME_HERE:'Come Here', STOP:'Stop', SHHH:'Shhh',
  HIGH_FIVE:'High Five', FIST_BUMP:'Fist Bump', CROSSED_FINGERS:'Crossed Fingers',
  PEACE:'Peace', FACEPALM:'Facepalm', AIR_QUOTES:'Air Quotes', MILK:'Fist'
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
    // Ask CameraPanel for the last tip angle via a custom event
    const ev = new CustomEvent('requestUprightAngle')
    let handled = false
    function onReply(e) {
      handled = true
      const { tipAngle } = e.detail || {}
      if (typeof tipAngle === 'number') {
        // we want targetUp (-90 + offset) to match tipAngle => offset = tipAngle + 90
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

  return (
    <section className="view child">
      <div className="row" style={{ alignItems:'center', gap:8 }}>
        <h2 style={{ margin:0 }}>Train a Sign</h2>
        <div className="stars-pill" title="Progress">{progress.done}/{progress.total} • {progress.pct}%</div>
      </div>

      <div className="card" style={{ marginTop:10 }}>
        <label htmlFor="sign-select" className="muted">Choose a sign to practice</label>
        <div className="row" style={{ gap:8, marginTop:6, flexWrap:'wrap' }}>
          <select id="sign-select" value={target} onChange={e => setTarget(e.target.value)}>
            {ALL_SIGNS.map(s => (
              <option key={s} value={s}>{FRIENDLY[s] || s}</option>
            ))}
          </select>
          {hits[target] ? <span className="badge success">Learned</span> : <span className="badge">Not yet</span>}
          {recent && <span className="badge" title="Last detected">Last: {FRIENDLY[recent] || recent}</span>}
        </div>
        <p style={{ marginTop:8 }} className="muted">Show the {FRIENDLY[target] || target}. The panel will confirm when it sees it. Try slowly and clearly.</p>
        <div className="row" style={{ gap:8, marginTop:8, flexWrap:'wrap' }}>
          <button className="secondary" onClick={calibrateUpright}>Calibrate Upright</button>
          <button className="secondary" onClick={resetCalibration}>Reset Calibration</button>
          <span className="muted">Upright offset: {uprightOffsetDeg}°</span>
        </div>
      </div>

      <div style={{ marginTop:10 }}>
        <CameraPanel />
      </div>

      <div className="card" style={{ marginTop:10 }}>
        <h3 style={{ marginTop:0 }}>Checklist</h3>
        <ul style={{ margin:0, paddingLeft: '1.2rem' }}>
          <li>{hits[target] ? '✅' : '◻️'} Recognized this sign at least once</li>
          <li>{progress.pct >= 25 ? '✅' : '◻️'} 25% overall progress</li>
          <li>{progress.pct >= 50 ? '✅' : '◻️'} 50% overall progress</li>
          <li>{progress.pct >= 100 ? '✅' : '◻️'} All signs learned</li>
        </ul>
      </div>
    </section>
  )
}

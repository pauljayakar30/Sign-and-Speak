import React, { useEffect, useMemo, useState } from 'react'
import TrendSparkline from './TrendSparkline'

export default function ParentDashboard() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [feed, setFeed] = useState([])
  const [aiText, setAiText] = useState('')
  const [prompt, setPrompt] = useState('1 tip to teach MILK')
  const [loading, setLoading] = useState(false)

  async function generateCode() {
    setStatus('Generating…')
    const r = await fetch('/pair/generate', { method: 'POST' })
    const d = await r.json()
    setCode(d.code)
    setStatus('Waiting for child…')
  }

  useEffect(() => {
    let t
    async function poll() {
      if (!code) return
      try {
        const r = await fetch(`/pair/status/${code}`)
        if (r.ok) {
          const d = await r.json()
          setStatus(d.claimed ? 'Child connected' : 'Waiting for child…')
        }
        const rf = await fetch(`/pair/feed/${code}`)
        if (rf.ok) {
          const df = await rf.json()
          setFeed(df.feed || [])
        }
      } catch {}
      t = setTimeout(poll, 2000)
    }
    poll()
    return () => clearTimeout(t)
  }, [code])

  const stats = useMemo(() => {
    const now = Date.now()
    const lastHour = now - 60*60*1000
    const signs = feed.filter(e => e.type === 'sign')
    const moods = feed.filter(e => e.type === 'mood')
    const uniqueSigns = new Set(signs.map(e => e.payload?.value ?? e.value)).size
    const recent = signs.filter(e => e.t && e.t > lastHour)
    const minutesPracticed = Math.max(1, Math.round((recent.length * 20) / 60)) // rough: each event ~20s window
    // Build sparkline: counts per 2-min buckets over last 24 mins
    const windowMs = 24 * 60 * 1000 / 12 // 2 minutes per bucket (approx using 24m total)
    const start = now - 24*60*1000
    const series = new Array(13).fill(0)
    for (const s of signs) {
      if (!s.t || s.t < start) continue
      const idx = Math.min(12, Math.floor((s.t - start) / windowMs))
      series[idx] += 1
    }
    const lastMood = moods.length ? (moods[moods.length-1].payload?.value ?? moods[moods.length-1].value) : '—'
    const totalStars = signs.length
    return { uniqueSigns, minutesPracticed, series, lastMood, totalStars }
  }, [feed])

  async function askAI() {
    setLoading(true)
    setAiText('Thinking…')
    try {
    const r = await fetch('/ask-gpt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
  const d = await r.json()
  setAiText(d && d.response ? `${d?.demo ? '[Demo] ' : ''}${d.response}` : 'AI is unavailable right now. Please try again later.')
    } catch {
      setAiText('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function askEndpoint(path, fallbackPrompt) {
    setLoading(true); setAiText('Thinking…')
    try {
      const r = await fetch(path, { method: 'POST' })
  if (r.ok) { const d = await r.json(); setAiText(`${d?.demo ? '[Demo] ' : ''}${d.response || 'No response'}`) }
      else { throw new Error('endpoint failed') }
    } catch {
      try {
    const r = await fetch('/ask-gpt', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: fallbackPrompt }) })
  const d = await r.json(); setAiText(d && d.response ? `${d?.demo ? '[Demo] ' : ''}${d.response}` : 'AI is unavailable right now. Please try again later.')
  } catch { setAiText('AI is unavailable right now. Please try again later.') }
    } finally { setLoading(false) }
  }

  return (
    <section className="view parent">
      <h2>Parent Dashboard</h2>
      <div className="grid">
        <div className="card">
          <h3>Pair with Child</h3>
          <button className="primary" onClick={generateCode}>Generate Code</button>
          <div className="code">{code ? `Code: ${code}` : ''}</div>
          <div className="status">{status}</div>
        </div>
        <div className="card">
          <h3>At‑a‑glance</h3>
          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <div className="kpi">
              <div className="kpi-label">Stars</div>
              <div className="kpi-value">{stats.totalStars}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Unique signs today</div>
              <div className="kpi-value">{stats.uniqueSigns}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Practice (est. mins)</div>
              <div className="kpi-value">{stats.minutesPracticed}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Mood now</div>
              <div className="kpi-value">{stats.lastMood}</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <TrendSparkline data={stats.series} />
            <div className="muted" style={{ marginTop: 4 }}>Recent activity</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Child Activity (live feed)</h3>
        <div className="feed">
          {feed.map((e, i) => {
            const dt = new Date(e.t).toLocaleTimeString()
            if (e.type === 'sign') {
              const val = e.payload?.value ?? e.value ?? ''
              return <div key={i} className="feed-item"><strong>{dt}</strong>: Recognized {val}</div>
            }
            if (e.type === 'mood') {
              const val = e.payload?.value ?? e.value ?? ''
              return <div key={i} className="feed-item"><strong>{dt}</strong>: Mood {val}</div>
            }
            return <div key={i} className="feed-item"><strong>{dt}</strong>: {e.type}</div>
          })}
        </div>
      </div>

      <div className="card">
        <h3>Parent's Corner (AI)</h3>
        <div className="row" style={{ flexWrap:'wrap' }}>
          <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask the coach…" />
          <button className="secondary" onClick={askAI} disabled={loading}>Ask</button>
          <button className="secondary" onClick={() => askEndpoint('/ask-weekly', 'Write a one-paragraph weekly progress summary for a parent.')} disabled={loading}>Weekly summary</button>
          <button className="secondary" onClick={() => askEndpoint('/ask-daily', 'Suggest 3 playful daily practice ideas for child sign learning.')} disabled={loading}>Daily ideas</button>
          <button className="secondary" onClick={() => askEndpoint('/ask-insights', 'Given recent sign practice, list 3 next steps for the parent.')} disabled={loading}>Next steps</button>
        </div>
        <div className="ai">{aiText}</div>
      </div>
    </section>
  )
}

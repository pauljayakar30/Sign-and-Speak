/**
 * ParentDashboard Component - Redesigned
 * 
 * Professional monitoring and analytics dashboard for parents/guardians.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import TrendSparkline from './TrendSparkline'
import Skeleton from './Skeleton'
import { useToast } from './Toast'

export default function ParentDashboard() {
  const toast = useToast()
  
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [feed, setFeed] = useState([])
  const [aiText, setAiText] = useState('')
  const [prompt, setPrompt] = useState('Give me 3 tips to teach MILK sign')
  const [loading, setLoading] = useState(false)

  async function generateCode() {
    setStatus('generating')
    const r = await fetch('/pair/generate', { method: 'POST' })
    const d = await r.json()
    setCode(d.code)
    setStatus('waiting')
    toast.success('Pairing code generated!')
  }

  useEffect(() => {
    let t
    async function poll() {
      if (!code) return
      try {
        const r = await fetch(`/pair/status/${code}`)
        if (r.ok) {
          const d = await r.json()
          const newStatus = d.claimed ? 'connected' : 'waiting'
          if (status !== newStatus) {
            setStatus(newStatus)
            if (newStatus === 'connected') toast.success('Child connected!')
          }
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
  }, [code, status, toast])

  const stats = useMemo(() => {
    const now = Date.now()
    const lastHour = now - 60*60*1000
    const signs = feed.filter(e => e.type === 'sign')
    const moods = feed.filter(e => e.type === 'mood')
    const uniqueSigns = new Set(signs.map(e => e.payload?.value ?? e.value)).size
    const recent = signs.filter(e => e.t && e.t > lastHour)
    const minutesPracticed = Math.max(1, Math.round((recent.length * 20) / 60))
    
    const windowMs = 24 * 60 * 1000 / 12
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
    setAiText('')
    try {
      const r = await fetch('/ask-gpt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const d = await r.json()
      setAiText(d && d.response ? `${d?.demo ? '[Demo] ' : ''}${d.response}` : 'AI is unavailable right now.')
    } catch (error) {
      setAiText('Network error.')
      toast.error('Failed to get AI response')
    } finally {
      setLoading(false)
    }
  }

  async function askEndpoint(path, fallbackPrompt, label) {
    setLoading(true)
    setAiText('')
    toast.info(`Getting ${label}...`)
    try {
      const r = await fetch(path, { method: 'POST' })
      if (r.ok) {
        const d = await r.json()
        setAiText(`${d?.demo ? '[Demo] ' : ''}${d.response || 'No response'}`)
      } else throw new Error('endpoint failed')
    } catch {
      try {
        const r = await fetch('/ask-gpt', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: fallbackPrompt }) })
        const d = await r.json()
        setAiText(d && d.response ? `${d?.demo ? '[Demo] ' : ''}${d.response}` : 'AI is unavailable.')
      } catch {
        setAiText('AI is unavailable.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="parent-view">
      <div className="parent-header">
        <h1 className="parent-title">Parent Dashboard</h1>
        <p className="parent-subtitle">Monitor your child's learning progress and get AI-powered insights</p>
      </div>

      {/* Quick Stats */}
      <div className="parent-stats-grid">
        <div className="parent-stat-card stars">
          <div className="stat-header">
            <span className="stat-icon-lg">⭐</span>
            <div className="stat-trend up">↑ +{Math.floor(stats.totalStars * 0.15)}</div>
          </div>
          <div className="stat-main-value">{stats.totalStars}</div>
          <div className="stat-label-text">Total Stars</div>
        </div>

        <div className="parent-stat-card signs">
          <div className="stat-header">
            <span className="stat-icon-lg">🤟</span>
            <div className="stat-trend up">↑ +{Math.floor(stats.uniqueSigns * 0.3)}</div>
          </div>
          <div className="stat-main-value">{stats.uniqueSigns}</div>
          <div className="stat-label-text">Unique Signs</div>
        </div>

        <div className="parent-stat-card time">
          <div className="stat-header">
            <span className="stat-icon-lg">⏱️</span>
            <div className="stat-trend up">↑ {Math.floor(stats.minutesPracticed * 0.2)}m</div>
          </div>
          <div className="stat-main-value">{stats.minutesPracticed}</div>
          <div className="stat-label-text">Minutes Practiced</div>
        </div>

        <div className="parent-stat-card mood">
          <div className="stat-header">
            <span className="stat-icon-lg">😊</span>
          </div>
          <div className="stat-main-value">{stats.lastMood}</div>
          <div className="stat-label-text">Current Mood</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="parent-content">
        {/* Activity Feed */}
        <div className="parent-card">
          <div className="parent-card-header">
            <h2 className="parent-card-title">
              <span className="title-icon">📊</span>
              Live Activity Feed
            </h2>
            <span className="parent-card-action">View All</span>
          </div>

          {feed.length === 0 ? (
            <div className="feed-empty">
              <div className="feed-empty-icon">📭</div>
              <p className="feed-empty-text">No activity yet. {!code ? 'Generate a pairing code to get started.' : 'Waiting for child to connect...'}</p>
              {!code && (
                <button className="btn-primary" onClick={generateCode}>
                  Generate Pairing Code
                </button>
              )}
            </div>
          ) : (
            <div className="activity-feed">
              {feed.slice().reverse().map((e, i) => {
                const dt = new Date(e.t).toLocaleTimeString()
                
                if (e.type === 'sign') {
                  const val = e.payload?.value ?? e.value ?? ''
                  return (
                    <motion.div 
                      key={i} 
                      className="feed-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="feed-icon sign">🤟</div>
                      <div className="feed-content">
                        <p className="feed-text">Recognized sign: <strong>{val}</strong></p>
                        <p className="feed-time">{dt}</p>
                      </div>
                    </motion.div>
                  )
                }
                
                if (e.type === 'mood') {
                  const val = e.payload?.value ?? e.value ?? ''
                  return (
                    <motion.div 
                      key={i} 
                      className="feed-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="feed-icon mood">😊</div>
                      <div className="feed-content">
                        <p className="feed-text">Mood detected: <strong>{val}</strong></p>
                        <p className="feed-time">{dt}</p>
                      </div>
                    </motion.div>
                  )
                }
                
                return null
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Pairing */}
          <div className="parent-card pairing-card">
            <div className="parent-card-header">
              <h2 className="parent-card-title">
                <span className="title-icon">🔗</span>
                Pairing
              </h2>
            </div>

            <div className="pairing-actions">
              <button className="btn-primary large" onClick={generateCode} disabled={loading}>
                {code ? 'Generate New Code' : 'Generate Code'}
              </button>

              {code && (
                <div className="pairing-code-display">
                  <div className="pairing-code-label">Share this code</div>
                  <div className="pairing-code-value">{code}</div>
                </div>
              )}

              {status && (
                <div className={`pairing-status ${status}`}>
                  <span className="status-dot"></span>
                  {status === 'waiting' && 'Waiting for child...'}
                  {status === 'connected' && 'Child connected'}
                  {status === 'generating' && 'Generating code...'}
                </div>
              )}
            </div>
          </div>

          {/* Trend */}
          <div className="parent-card trend-card">
            <div className="parent-card-header">
              <h2 className="parent-card-title">
                <span className="title-icon">📈</span>
                Activity Trend
              </h2>
            </div>

            <div className="trend-visual">
              <TrendSparkline data={stats.series} />
            </div>
            <p className="trend-description">Last 24 minutes of practice activity</p>
          </div>
        </div>
      </div>

      {/* AI Coach */}
      <div className="parent-card ai-coach-card">
        <div className="parent-card-header">
          <h2 className="parent-card-title">
            <span className="title-icon">🤖</span>
            AI Learning Coach
          </h2>
        </div>

        <div className="ai-quick-actions">
          <button 
            className="ai-quick-btn" 
            onClick={() => askEndpoint('/ask-weekly', 'Write a one-paragraph weekly progress summary.', 'weekly summary')} 
            disabled={loading}
          >
            <span>📅</span>
            Weekly Summary
          </button>
          <button 
            className="ai-quick-btn" 
            onClick={() => askEndpoint('/ask-daily', 'Suggest 3 playful daily practice ideas.', 'daily ideas')} 
            disabled={loading}
          >
            <span>💡</span>
            Daily Ideas
          </button>
          <button 
            className="ai-quick-btn" 
            onClick={() => askEndpoint('/ask-insights', 'List 3 next steps for the parent.', 'insights')} 
            disabled={loading}
          >
            <span>🎯</span>
            Next Steps
          </button>
        </div>

        <div className="ai-custom-input">
          <input 
            type="text"
            className="ai-input-field"
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            placeholder="Ask the AI coach anything..."
            onKeyPress={e => e.key === 'Enter' && !loading && askAI()}
          />
          <button className="btn-secondary" onClick={askAI} disabled={loading}>
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        <div className={`ai-response-box ${!aiText && !loading ? 'empty' : ''}`}>
          {loading ? (
            <Skeleton variant="text" lines={3} />
          ) : aiText ? (
            aiText
          ) : (
            'AI responses will appear here. Try asking a question or use the quick actions above!'
          )}
        </div>
      </div>
    </section>
  )
}

import React, { useEffect, useRef, useState } from 'react'

export default function CoachWidget({ mode = 'home', demo = false }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(`coach_${mode}`) || '[]') } catch { return [] }
  })
  const [loading, setLoading] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => { try { sessionStorage.setItem(`coach_${mode}`, JSON.stringify(msgs)) } catch {} }, [msgs, mode])

  function speak(text) {
    if (mode !== 'child') return
    try {
      const u = new SpeechSynthesisUtterance(String(text).slice(0, 240))
      window.speechSynthesis?.speak(u)
    } catch {}
  }

  async function send() {
    const q = input.trim()
    if (!q) return
    setInput('')
    const next = [...msgs, { role: 'user', content: q }]
    setMsgs(next)
    setLoading(true)
    try {
      const persona = mode === 'child'
        ? 'You are Otter Coach. Speak to a 6-year-old with short, friendly sentences and lots of encouragement.'
        : 'You are a supportive coach for a busy parent. Provide clear, concise guidance with 3 actionable bullet points.'
      const prompt = `${persona}\n\nConversation so far (short):\n${next.slice(-4).map(m => (m.role==='user'?`Child/Parent: ${m.content}`:`Coach: ${m.content}`)).join('\n')}\n\nCoach reply:`
      const r = await fetch('/api/ask-gpt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
  const d = await r.json()
  const prefix = d?.demo ? '[Demo] ' : ''
  const text = (d?.response ? prefix + d.response : 'AI is unavailable right now. Please try again later.')
      setMsgs(m => [...m, { role: 'assistant', content: text }])
      speak(text)
    } catch {
      setMsgs(m => [...m, { role: 'assistant', content: 'AI is unavailable right now. Please try again later.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`coach ${open ? 'open' : ''}`} ref={boxRef}>
      {open && (
        <div className="coach-box card">
          <div className="coach-head">
            <span>{mode === 'child' ? '🦦 Otter Coach' : '💡 Coach'}</span>
            {demo && <span className="badge" title="AI replies are simulated">Demo</span>}
            <button className="secondary" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="coach-msgs" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>{m.content}</div>
            ))}
            {loading && <div className="msg assistant">Thinking…</div>}
          </div>
          <div className="row">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder={mode==='child'?'Ask the otter…':'Ask the coach…'} onKeyDown={e=>{ if(e.key==='Enter') send() }} />
            <button className="primary" onClick={send} disabled={loading}>Send</button>
          </div>
        </div>
      )}
      {!open && (
        <button className="coach-fab gummy-btn" onClick={() => setOpen(true)} title="Open Coach">{mode==='child'?'🦦':'💡'}</button>
      )}
    </div>
  )
}

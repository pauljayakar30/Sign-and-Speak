import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ChildHome from './components/ChildHome.jsx'
import ParentDashboard from './components/ParentDashboard.jsx'
import ToyboxScene from './components/ToyboxScene.jsx'
import CoachWidget from './components/CoachWidget.jsx'
import TrainingMode from './components/TrainingMode.jsx'

function TabButton({ id, current, onClick, children }) {
  const active = current === id
  return (
    <button onClick={() => onClick(id)} aria-current={active ? 'page' : undefined} className={`tab ${active ? 'active' : ''}`}>
      {children}
      {active && <motion.div layoutId="tab-underline" className="tab-underline" />}
    </button>
  )
}

export default function App() {
  const [tab, setTab] = useState('home')
  const [envOk, setEnvOk] = useState(null)
  const [avatar, setAvatar] = useState(() => localStorage.getItem('avatar') || '')
  const [menuOpen, setMenuOpen] = useState(false)
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    fetch('/env-ok').then(r => r.json()).then(setEnvOk).catch(() => setEnvOk({ openaiKeyPresent: false, demoMode: true }))
  }, [])

  useEffect(() => {
    function onStorage() { setAvatar(localStorage.getItem('avatar') || '') }
    window.addEventListener('storage', onStorage)
    const iv = setInterval(() => setAvatar(localStorage.getItem('avatar') || ''), 1000)
    return () => { window.removeEventListener('storage', onStorage); clearInterval(iv) }
  }, [])

  const variants = useMemo(() => ({
    enter: { opacity: 0, y: prefersReduced ? 0 : 12 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: prefersReduced ? 0 : -12 }
  }), [prefersReduced])

  return (
    <div className="app">
      <header className={`app-header glass`}> 
        <div className="nav-inner">
          <div className="brand">
            <img src="/design/assets/logo.svg" alt="Sign & Speak logo" width={28} height={28} />
            <h1>Sign & Speak</h1>
          </div>

          <button className="hamburger" aria-label="Open menu" onClick={() => setMenuOpen(v => !v)}>
            <span />
            <span />
            <span />
          </button>

          <nav className={`tabs seg ${menuOpen ? 'open' : ''}`}>
            <TabButton id="home" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>Home</TabButton>
            <TabButton id="child" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>Child</TabButton>
            <TabButton id="parent" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>Parent</TabButton>
            <TabButton id="train" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>Train</TabButton>
          </nav>

          <div className="header-actions">
            {envOk?.demoMode && (
              <div className="badge pill" title="AI replies are simulated for demo">Demo</div>
            )}
            {avatar && <div className="avatar-badge sm" title="Current character" aria-label="Current character">{avatar === 'otter' ? '🦦' : avatar === 'panda' ? '🐼' : avatar === 'fox' ? '🦊' : '🦕'}</div>}
          </div>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {tab === 'home' && (
            <motion.section key="home" className="view" initial="enter" animate="center" exit="exit" variants={variants}>
              <ToyboxScene onStartChild={() => setTab('child')} onOpenParent={() => setTab('parent')} />
              {envOk && !envOk.openaiKeyPresent && (
                <p className="warning" style={{ textAlign:'center', marginTop: 8 }}>AI key not detected on server; AI features may be limited.</p>
              )}
            </motion.section>
          )}

          {tab === 'child' && (
            <motion.div key="child" initial="enter" animate="center" exit="exit" variants={variants}>
              <ChildHome />
            </motion.div>
          )}
          {tab === 'parent' && (
            <motion.div key="parent" initial="enter" animate="center" exit="exit" variants={variants}>
              <ParentDashboard />
            </motion.div>
          )}
          {tab === 'train' && (
            <motion.div key="train" initial="enter" animate="center" exit="exit" variants={variants}>
              <TrainingMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="app-footer">
        <small>Built for learning and communication. Camera data stays in your browser.</small>
      </footer>

      <CoachWidget mode={tab === 'child' ? 'child' : (tab === 'parent' ? 'parent' : 'home')} demo={Boolean(envOk?.demoMode)} />
    </div>
  )
}

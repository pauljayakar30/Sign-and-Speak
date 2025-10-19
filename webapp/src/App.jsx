/**
 * Sign & Speak - Main Application Component
 * 
 * A sign language learning platform for children with real-time gesture recognition,
 * AI-powered coaching, and parent progress tracking.
 * 
 * Features:
 * - Real-time hand sign detection using MediaPipe
 * - Mood/facial expression recognition
 * - Training mode with progress tracking
 * - Parent dashboard with analytics
 * - AI-powered coaching and tips
 * - Demo mode for testing without API key
 */

import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ChildHome from './components/ChildHome.jsx'
import ParentDashboard from './components/ParentDashboard.jsx'
import NewHome from './components/NewHome.jsx'
import CoachWidget from './components/CoachWidget.jsx'
import TrainingMode from './components/TrainingMode.jsx'
import { ToastProvider } from './components/Toast.jsx'

/**
 * TabButton - Navigation tab component with animated underline
 */
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
  // Navigation state
  const [tab, setTab] = useState('home')
  
  // Server environment status (API key presence, demo mode)
  const [envOk, setEnvOk] = useState(null)
  
  // Current user's selected avatar character
  const [avatar, setAvatar] = useState(() => localStorage.getItem('avatar') || '')
  
  // Mobile menu toggle
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Dark mode toggle (default: light mode)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true' ? true : false
  })
  
  // Respect user's motion preferences for accessibility
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Check server environment status on mount
  useEffect(() => {
    fetch('/env-ok').then(r => r.json()).then(setEnvOk).catch(() => setEnvOk({ openaiKeyPresent: false, demoMode: true }))
  }, [])

  // Sync avatar across tabs and components
  useEffect(() => {
    function onStorage() { setAvatar(localStorage.getItem('avatar') || '') }
    window.addEventListener('storage', onStorage)
    const iv = setInterval(() => setAvatar(localStorage.getItem('avatar') || ''), 1000)
    return () => { window.removeEventListener('storage', onStorage); clearInterval(iv) }
  }, [])

  // Manage dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark-mode')
      localStorage.setItem('darkMode', 'false')
    }
  }, [darkMode])

  // Enhanced animation variants for smooth page transitions
  const variants = useMemo(() => ({
    enter: { 
      opacity: 0, 
      y: prefersReduced ? 0 : 20,
      scale: prefersReduced ? 1 : 0.98
    },
    center: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] // Custom easing for smooth feel
      }
    },
    exit: { 
      opacity: 0, 
      y: prefersReduced ? 0 : -20,
      scale: prefersReduced ? 1 : 0.98,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }), [prefersReduced])

  return (
    <ToastProvider>
      <div className="app">
        {/* Floating Navigation Bar */}
        <header className={`app-header glass`}> 
        <div className="nav-inner">
          {/* Brand Logo and Title */}
          <div className="brand">
            <img src="/design/assets/logo.svg" alt="Sign & Speak logo" width={28} height={28} />
            <h1>Sign & Speak</h1>
          </div>

          {/* Mobile Hamburger Menu */}
          <button className="hamburger" aria-label="Open menu" onClick={() => setMenuOpen(v => !v)}>
            <span />
            <span />
            <span />
          </button>

          {/* Navigation Tabs */}
          <nav className={`tabs seg ${menuOpen ? 'open' : ''}`}>
            <TabButton id="home" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>Home</TabButton>
            <TabButton id="child" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>Child</TabButton>
            <TabButton id="parent" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>Parent</TabButton>
            <TabButton id="train" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>Train</TabButton>
          </nav>

          {/* Status Badges (Demo mode, Avatar, Dark Mode Toggle) */}
          <div className="header-actions">
            {envOk?.demoMode && (
              <div className="badge pill" title="AI replies are simulated for demo">Demo</div>
            )}
            {avatar && <div className="avatar-badge sm" title="Current character" aria-label="Current character">{avatar === 'otter' ? '🦦' : avatar === 'panda' ? '🐼' : avatar === 'fox' ? '🦊' : '🦕'}</div>}
            
            {/* Dark Mode Toggle */}
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(prev => !prev)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Page Transitions */}
      <main>
        <AnimatePresence mode="wait">
          {tab === 'home' && (
            <motion.section key="home" className="view home-view" initial="enter" animate="center" exit="exit" variants={variants}>
              <NewHome onStartChild={() => setTab('child')} onOpenParent={() => setTab('parent')} />
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

      {/* Privacy Footer */}
      <footer className="app-footer">
        <small>Built for learning and communication. Camera data stays in your browser.</small>
      </footer>

      {/* AI Coach Floating Widget */}
      <CoachWidget mode={tab === 'child' ? 'child' : (tab === 'parent' ? 'parent' : 'home')} demo={Boolean(envOk?.demoMode)} />
    </div>
    </ToastProvider>
  )
}

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
import { Home, BookOpen, Target, BarChart3 } from 'lucide-react'
import ChildHome from './components/ChildHome.jsx'
import ParentDashboard from './components/ParentDashboard.jsx'
import NewHome from './components/NewHome.jsx'
import TrainingMode from './components/TrainingMode.jsx'
import AdultLearning from './components/AdultLearning.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { useAvatar } from './contexts/AppContext.jsx'

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
  
  // Practice mode: 'child' or 'adult'
  const [practiceMode, setPracticeMode] = useState('child')
  
  // Current user's selected avatar character (from context)
  const { avatar } = useAvatar()
  
  // Mobile menu toggle
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Sidebar collapse state (default collapsed to icon-only view)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved !== null ? saved === 'true' : true
  })
  
  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed)
  }, [sidebarCollapsed])
  
  // Toggle sidebar collapse
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev)
  
  // Respect user's motion preferences for accessibility
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Avatar sync is now handled by AppContext - no more polling! 🎉

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
        {/* Skip Link for Keyboard Users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Top Header Bar (Gemini Style) */}
        <header className="app-header" role="banner">
          <h1 className="app-title">Sign & Speak</h1>
          <div className="header-actions">
            {/* Future: search, settings, etc. */}
          </div>
        </header>

        {/* Left Sidebar Navigation */}
        <aside 
          className={`app-sidebar ${menuOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}
          role="navigation"
          aria-label="Main navigation"
        > 
          <div className="sidebar-inner">
            {/* Navigation Tabs */}
            <nav className="tabs" role="tablist" aria-label="Main sections">
              <TabButton id="home" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>
                <Home className="tab-icon" size={20} strokeWidth={2} aria-hidden="true" />
                <span className="tab-label">Home</span>
              </TabButton>
              <TabButton id="practice" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>
                <BookOpen className="tab-icon" size={20} strokeWidth={2} aria-hidden="true" />
                <span className="tab-label">Practice</span>
              </TabButton>
              <TabButton id="training" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>
                <Target className="tab-icon" size={20} strokeWidth={2} aria-hidden="true" />
                <span className="tab-label">Training</span>
              </TabButton>
              <TabButton id="monitor" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>
                <BarChart3 className="tab-icon" size={20} strokeWidth={2} aria-hidden="true" />
                <span className="tab-label">Monitor</span>
              </TabButton>
            </nav>

            {/* Mode Toggle (only visible in Practice tab) - Moved here for better visibility */}
            {tab === 'practice' && (
              <div className="sidebar-toggle" role="complementary" aria-label="Practice mode">
                <div className="toggle-header">Mode:</div>
                <button 
                  className={`mode-btn ${practiceMode === 'child' ? 'active' : ''}`}
                  onClick={() => setPracticeMode('child')}
                  aria-pressed={practiceMode === 'child'}
                >
                  <span className="mode-icon">👶</span>
                  <span className="mode-label">Kids</span>
                </button>
                <button 
                  className={`mode-btn ${practiceMode === 'adult' ? 'active' : ''}`}
                  onClick={() => setPracticeMode('adult')}
                  aria-pressed={practiceMode === 'adult'}
                >
                  <span className="mode-icon">👤</span>
                  <span className="mode-label">Adults</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Hamburger Menu */}
        <button 
          className="hamburger" 
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} 
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Main Content Area */}
        <main className="app-main" id="main-content" role="main">
          <AnimatePresence mode="wait">
            {tab === 'home' && (
              <motion.section key="home" className="view home-view" initial="enter" animate="center" exit="exit" variants={variants}>
                <NewHome 
                  onStartChild={() => { setTab('practice'); setPracticeMode('child') }} 
                  onOpenParent={() => setTab('monitor')} 
                />
              </motion.section>
            )}

            {tab === 'practice' && (
              <motion.div key="practice" initial="enter" animate="center" exit="exit" variants={variants}>
                {practiceMode === 'child' ? <ChildHome /> : <AdultLearning />}
              </motion.div>
            )}
            
            {tab === 'training' && (
              <motion.div key="training" initial="enter" animate="center" exit="exit" variants={variants}>
                <TrainingMode />
              </motion.div>
            )}
            
            {tab === 'monitor' && (
              <motion.div key="monitor" initial="enter" animate="center" exit="exit" variants={variants}>
                <ParentDashboard />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Footer */}
          <footer className="app-footer">
            <small>Built for learning and communication. Camera data stays in your browser.</small>
          </footer>
        </main>
      </div>
    </ToastProvider>
  )
}

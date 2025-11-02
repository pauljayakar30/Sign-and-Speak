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
import { Home, GraduationCap, Users, Target, User } from 'lucide-react'
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
              <TabButton id="child" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>
                <GraduationCap className="tab-icon" size={20} strokeWidth={2} aria-hidden="true" />
                <span className="tab-label">Child</span>
              </TabButton>
              <TabButton id="parent" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>
                <Users className="tab-icon" size={20} strokeWidth={2} aria-hidden="true" />
                <span className="tab-label">Parent</span>
              </TabButton>
              <TabButton id="train" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>
                <Target className="tab-icon" size={20} strokeWidth={2} aria-hidden="true" />
                <span className="tab-label">Train</span>
              </TabButton>
              <TabButton id="adult" current={tab} onClick={(id)=>{ setTab(id); setMenuOpen(false) }}>
                <User className="tab-icon" size={20} strokeWidth={2} aria-hidden="true" />
                <span className="tab-label">Adult</span>
              </TabButton>
            </nav>

            {/* Avatar Badge at Bottom */}
            <div className="sidebar-actions" role="complementary" aria-label="User profile">
              <User className="avatar-icon" size={20} strokeWidth={2} aria-hidden="true" />
              <span className="avatar-label">
                {avatar ? `${avatar.charAt(0).toUpperCase() + avatar.slice(1)}` : 'Guest'}
              </span>
            </div>
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
            {tab === 'adult' && (
              <motion.div key="adult" initial="enter" animate="center" exit="exit" variants={variants}>
                <AdultLearning />
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

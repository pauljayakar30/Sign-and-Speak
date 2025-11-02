/**
 * AdultLearning Component - Minimalist Design
 * 
 * Professional sign language learning interface for adults
 * Clean, distraction-free design with focus on learning efficiency
 */
import React, { useState, useRef, useEffect } from 'react'
import CameraPanel from './CameraPanel.jsx'
import { useToast } from './Toast.jsx'
import './AdultLearning.css'

const SIGNS = [
  'WAVE', 'SALUTE', 'HANDSHAKE',
  'THUMBS_UP', 'THUMBS_DOWN', 'OK', 'APPLAUSE',
  'POINT', 'COME_HERE', 'STOP', 'SHHH',
  'HIGH_FIVE', 'FIST_BUMP', 'CROSSED_FINGERS',
  'PEACE', 'FACEPALM', 'AIR_QUOTES', 'MILK'
]

const SIGN_INFO = {
  WAVE: { name: 'Wave', desc: 'Raise hand, move side to side', category: 'Greetings' },
  SALUTE: { name: 'Salute', desc: 'Touch forehead, hand flat', category: 'Greetings' },
  HANDSHAKE: { name: 'Handshake', desc: 'Extend hand forward', category: 'Greetings' },
  THUMBS_UP: { name: 'Thumbs Up', desc: 'Fist with thumb up', category: 'Feedback' },
  THUMBS_DOWN: { name: 'Thumbs Down', desc: 'Fist with thumb down', category: 'Feedback' },
  OK: { name: 'OK', desc: 'Circle with thumb & index', category: 'Feedback' },
  APPLAUSE: { name: 'Clap', desc: 'Clap hands together', category: 'Feedback' },
  POINT: { name: 'Point', desc: 'Index finger extended', category: 'Direction' },
  COME_HERE: { name: 'Come Here', desc: 'Curl fingers inward', category: 'Direction' },
  STOP: { name: 'Stop', desc: 'Palm forward, fingers up', category: 'Commands' },
  SHHH: { name: 'Quiet', desc: 'Index finger on lips', category: 'Commands' },
  HIGH_FIVE: { name: 'High Five', desc: 'Palm forward, raised', category: 'Social' },
  FIST_BUMP: { name: 'Fist Bump', desc: 'Fist extended forward', category: 'Social' },
  CROSSED_FINGERS: { name: 'Luck', desc: 'Middle over index', category: 'Gestures' },
  PEACE: { name: 'Peace', desc: 'V with index & middle', category: 'Gestures' },
  FACEPALM: { name: 'Facepalm', desc: 'Palm covers face', category: 'Expressions' },
  AIR_QUOTES: { name: 'Air Quotes', desc: 'Quote marks, both hands', category: 'Expressions' },
  MILK: { name: 'Milk/Fist', desc: 'Closed fist', category: 'Basic' }
}

const CATEGORIES = ['All', 'Greetings', 'Feedback', 'Direction', 'Commands', 'Social', 'Gestures', 'Expressions', 'Basic']

export default function AdultLearning() {
  const cameraRef = useRef(null)
  const toast = useToast()
  
  const [selectedSign, setSelectedSign] = useState('WAVE')
  const [filterCategory, setFilterCategory] = useState('All')
  const [recentDetection, setRecentDetection] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  
  // Progress tracking
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('adultLearningProgress')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  
  // Stats
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('adultLearningStats')
      return saved ? JSON.parse(saved) : { totalAttempts: 0, totalCorrect: 0, streak: 0, bestStreak: 0 }
    } catch {
      return { totalAttempts: 0, totalCorrect: 0, streak: 0, bestStreak: 0 }
    }
  })
  
  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem('adultLearningProgress', JSON.stringify(progress))
      localStorage.setItem('adultLearningStats', JSON.stringify(stats))
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }, [progress, stats])
  
  // Filter signs by category
  const filteredSigns = filterCategory === 'All' 
    ? SIGNS 
    : SIGNS.filter(sign => SIGN_INFO[sign].category === filterCategory)
  
  // Handle sign detection
  const handleSignDetected = (sign, metadata) => {
    setRecentDetection({ sign, timestamp: Date.now(), isCorrect: metadata.isTarget })
    
    if (metadata.isTarget && sign === selectedSign) {
      // Correct sign detected
      const newProgress = { ...progress }
      if (!newProgress[sign]) {
        newProgress[sign] = { attempts: 0, successes: 0, lastPracticed: null }
      }
      newProgress[sign].attempts += 1
      newProgress[sign].successes += 1
      newProgress[sign].lastPracticed = Date.now()
      setProgress(newProgress)
      
      // Update stats
      const newStats = {
        totalAttempts: stats.totalAttempts + 1,
        totalCorrect: stats.totalCorrect + 1,
        streak: stats.streak + 1,
        bestStreak: Math.max(stats.streak + 1, stats.bestStreak)
      }
      setStats(newStats)
      
      toast.success(`Perfect! ${SIGN_INFO[sign].name} recognized`)
      
      // Auto-advance after short delay
      setTimeout(() => {
        const currentIndex = filteredSigns.indexOf(selectedSign)
        const nextIndex = (currentIndex + 1) % filteredSigns.length
        setSelectedSign(filteredSigns[nextIndex])
      }, 1500)
    }
  }
  
  const handleCameraReady = () => {
    setCameraReady(true)
    toast.info('Camera ready - start practicing!')
  }
  
  const handleCameraError = (error) => {
    toast.error('Camera error: ' + error.message)
  }
  
  // Get sign progress
  const getSignProgress = (sign) => {
    const p = progress[sign]
    if (!p || p.attempts === 0) return { practiced: false, accuracy: 0, count: 0 }
    return {
      practiced: true,
      accuracy: Math.round((p.successes / p.attempts) * 100),
      count: p.successes
    }
  }
  
  const overallAccuracy = stats.totalAttempts > 0 
    ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) 
    : 0
  
  const masteredCount = Object.values(progress).filter(p => 
    p && p.attempts > 0 && (p.successes / p.attempts) >= 0.8 && p.successes >= 3
  ).length
  
  return (
    <div className="adult-learning">
      {/* Header */}
      <header className="adult-learning-header">
        <div className="header-content">
          <h1>Sign Language Practice</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{overallAccuracy}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mastered</span>
              <span className="stat-value">{masteredCount}/{SIGNS.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Streak</span>
              <span className="stat-value">{stats.streak}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="adult-learning-content">
        {/* Left Panel - Sign List */}
        <aside className="sign-list-panel">
          {/* Category Filter */}
          <div className="category-filter">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`category-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Sign List */}
          <div className="sign-list">
            {filteredSigns.map(sign => {
              const info = SIGN_INFO[sign]
              const signProgress = getSignProgress(sign)
              const isSelected = sign === selectedSign
              
              return (
                <button
                  key={sign}
                  className={`sign-item ${isSelected ? 'selected' : ''} ${signProgress.practiced ? 'practiced' : ''}`}
                  onClick={() => setSelectedSign(sign)}
                >
                  <div className="sign-item-main">
                    <span className="sign-name">{info.name}</span>
                    {signProgress.practiced && (
                      <span className="sign-accuracy">{signProgress.accuracy}%</span>
                    )}
                  </div>
                  {signProgress.practiced && (
                    <div className="sign-progress-bar">
                      <div 
                        className="sign-progress-fill" 
                        style={{ width: `${signProgress.accuracy}%` }}
                      />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </aside>
        
        {/* Center Panel - Camera & Instructions */}
        <main className="practice-panel">
          {/* Current Sign Instructions */}
          <div className="current-sign-card">
            <div className="sign-header">
              <h2>{SIGN_INFO[selectedSign].name}</h2>
              <span className="sign-category">{SIGN_INFO[selectedSign].category}</span>
            </div>
            <p className="sign-description">{SIGN_INFO[selectedSign].desc}</p>
            
            {showInstructions && (
              <div className="instruction-tip">
                <p>💡 Position your hand clearly in view of the camera and hold the gesture steadily</p>
                <button 
                  className="dismiss-tip"
                  onClick={() => setShowInstructions(false)}
                >
                  Got it
                </button>
              </div>
            )}
          </div>
          
          {/* Camera Feed */}
          <div className="camera-container">
            <CameraPanel
              ref={cameraRef}
              targetSign={selectedSign}
              onSignDetected={handleSignDetected}
              onReady={handleCameraReady}
              onError={handleCameraError}
              showUI={false}
              showSkeleton={true}
              showConfidence={true}
            />
            
            {/* Recent Detection Overlay */}
            {recentDetection && Date.now() - recentDetection.timestamp < 2000 && (
              <div className={`detection-overlay ${recentDetection.isCorrect ? 'correct' : 'incorrect'}`}>
                {recentDetection.isCorrect ? (
                  <>
                    <span className="detection-icon">✓</span>
                    <span className="detection-text">Perfect!</span>
                  </>
                ) : (
                  <>
                    <span className="detection-icon">→</span>
                    <span className="detection-text">{SIGN_INFO[recentDetection.sign]?.name || recentDetection.sign}</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="quick-actions">
            <button 
              className="action-btn secondary"
              onClick={() => {
                const currentIndex = filteredSigns.indexOf(selectedSign)
                const prevIndex = (currentIndex - 1 + filteredSigns.length) % filteredSigns.length
                setSelectedSign(filteredSigns[prevIndex])
              }}
            >
              ← Previous
            </button>
            
            <button 
              className="action-btn secondary"
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * filteredSigns.length)
                setSelectedSign(filteredSigns[randomIndex])
              }}
            >
              Random
            </button>
            
            <button 
              className="action-btn secondary"
              onClick={() => {
                const currentIndex = filteredSigns.indexOf(selectedSign)
                const nextIndex = (currentIndex + 1) % filteredSigns.length
                setSelectedSign(filteredSigns[nextIndex])
              }}
            >
              Next →
            </button>
          </div>
        </main>
        
        {/* Right Panel - Progress Overview */}
        <aside className="progress-panel">
          <h3>Your Progress</h3>
          
          <div className="progress-stats">
            <div className="progress-stat-card">
              <div className="progress-stat-value">{stats.totalCorrect}</div>
              <div className="progress-stat-label">Total Correct</div>
            </div>
            
            <div className="progress-stat-card">
              <div className="progress-stat-value">{stats.totalAttempts}</div>
              <div className="progress-stat-label">Total Attempts</div>
            </div>
            
            <div className="progress-stat-card">
              <div className="progress-stat-value">{stats.bestStreak}</div>
              <div className="progress-stat-label">Best Streak</div>
            </div>
          </div>
          
          {/* Category Breakdown */}
          <div className="category-progress">
            <h4>By Category</h4>
            {CATEGORIES.filter(c => c !== 'All').map(category => {
              const categorySigns = SIGNS.filter(s => SIGN_INFO[s].category === category)
              const masteredInCategory = categorySigns.filter(s => {
                const p = progress[s]
                return p && p.attempts > 0 && (p.successes / p.attempts) >= 0.8 && p.successes >= 3
              }).length
              
              return (
                <div key={category} className="category-progress-item">
                  <span className="category-progress-name">{category}</span>
                  <div className="category-progress-bar">
                    <div 
                      className="category-progress-fill"
                      style={{ width: `${(masteredInCategory / categorySigns.length) * 100}%` }}
                    />
                  </div>
                  <span className="category-progress-count">{masteredInCategory}/{categorySigns.length}</span>
                </div>
              )
            })}
          </div>
          
          {/* Reset Progress */}
          <button 
            className="reset-btn"
            onClick={() => {
              if (window.confirm('Reset all progress? This cannot be undone.')) {
                setProgress({})
                setStats({ totalAttempts: 0, totalCorrect: 0, streak: 0, bestStreak: 0 })
                toast.info('Progress reset')
              }
            }}
          >
            Reset Progress
          </button>
        </aside>
      </div>
    </div>
  )
}

/**
 * TrainingMode Component - Redesigned
 * 
 * Interactive training interface for practicing sign language
 */
import React, { useEffect, useMemo, useState, useRef } from 'react'
import CameraPanel from './CameraPanel.jsx'
import { useToast } from './Toast.jsx'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

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
  const cameraRef = useRef(null)
  const toast = useToast()
  
  const [target, setTarget] = useState('WAVE')
  const [recent, setRecent] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [detectionFeedback, setDetectionFeedback] = useState(null)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationStatus, setCalibrationStatus] = useState(null) // 'success', 'error', 'no-hand'
  const [uprightOffsetDeg, setUprightOffsetDeg] = useState(() => {
    try { return Number(localStorage.getItem('uprightOffsetDeg') || '0') } catch { return 0 }
  })
  
  // Comprehensive progress tracking with persistence
  const [signStats, setSignStats] = useState(() => {
    try {
      const saved = localStorage.getItem('signStats')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load signStats from localStorage:', error)
    }
    
    // Initialize empty stats for all signs
    const initialStats = {}
    ALL_SIGNS.forEach(sign => {
      initialStats[sign] = {
        attempts: 0,
        successes: 0,
        firstAttempt: null,
        lastPracticed: null,
        masteredAt: null,
        accuracy: 0,
        mastered: false
      }
    })
    return initialStats
  })
  
  // Session tracking (resets on page load)
  const [sessionAttempts, setSessionAttempts] = useState(0)
  const [sessionSuccesses, setSessionSuccesses] = useState(0)
  const [consecutiveFailures, setConsecutiveFailures] = useState(0)
  
  // Mobile UX enhancements
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [swiperInstance, setSwiperInstance] = useState(null)
  const cameraSectionRef = useRef(null)
  
  // Save signStats to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('signStats', JSON.stringify(signStats))
    } catch (error) {
      console.error('Failed to save signStats to localStorage:', error)
      toast.warning('⚠️ Progress may not be saved (storage full)', { duration: 3000 })
    }
  }, [signStats, toast])

  const progress = useMemo(() => {
    const total = ALL_SIGNS.length
    const done = ALL_SIGNS.filter(sign => signStats[sign]?.mastered).length
    return { total, done, pct: Math.round((done/total)*100) }
  }, [signStats])

  // Camera event handlers
  const handleSignDetected = (sign, metadata) => {
    setRecent(sign)
    setSessionAttempts(prev => prev + 1)
    
    const now = Date.now()
    
    if (metadata.isTarget) {
      // Correct sign detected!
      setSessionSuccesses(prev => prev + 1)
      setConsecutiveFailures(0)
      setDetectionFeedback('correct')
      
      // Update comprehensive stats
      setSignStats(prev => {
        const current = prev[sign] || {
          attempts: 0,
          successes: 0,
          firstAttempt: null,
          lastPracticed: null,
          masteredAt: null,
          accuracy: 0,
          mastered: false
        }
        
        const newAttempts = current.attempts + 1
        const newSuccesses = current.successes + 1
        const newAccuracy = Math.round((newSuccesses / newAttempts) * 100)
        
        // Mastery requires 5 successful detections with 80%+ accuracy
        const isMastered = newSuccesses >= 5 && newAccuracy >= 80
        const masteredAt = isMastered && !current.mastered ? now : current.masteredAt
        
        return {
          ...prev,
          [sign]: {
            attempts: newAttempts,
            successes: newSuccesses,
            firstAttempt: current.firstAttempt || now,
            lastPracticed: now,
            masteredAt,
            accuracy: newAccuracy,
            mastered: isMastered
          }
        }
      })
      
      // Check if just achieved mastery
      const stats = signStats[sign]
      const willBeMastered = stats && (stats.successes + 1 >= 5) && !stats.mastered
      
      if (willBeMastered) {
        toast.success(`� Mastered ${FRIENDLY[sign]}! You're a pro!`, { duration: 4000 })
      } else {
        const progress = stats ? stats.successes + 1 : 1
        toast.success(`🎉 Perfect! ${FRIENDLY[sign]} (${progress}/5 for mastery)`, { duration: 3000 })
      }
      
      // Clear feedback after animation
      setTimeout(() => setDetectionFeedback(null), 2000)
    } else {
      // Wrong sign detected - track as failed attempt for target sign
      setDetectionFeedback('incorrect')
      setConsecutiveFailures(prev => prev + 1)
      
      // Update stats for the target sign (not the detected sign)
      setSignStats(prev => {
        const current = prev[target] || {
          attempts: 0,
          successes: 0,
          firstAttempt: null,
          lastPracticed: null,
          masteredAt: null,
          accuracy: 0,
          mastered: false
        }
        
        const newAttempts = current.attempts + 1
        const newAccuracy = Math.round((current.successes / newAttempts) * 100)
        
        return {
          ...prev,
          [target]: {
            ...current,
            attempts: newAttempts,
            firstAttempt: current.firstAttempt || now,
            lastPracticed: now,
            accuracy: newAccuracy
          }
        }
      })
      
      // Show helpful hint after 3 consecutive failures
      if (consecutiveFailures + 1 >= 3) {
        const hint = SIGN_DESCRIPTIONS[target] || 'Try following the description'
        toast.info(`💡 Hint: ${hint}`, { duration: 5000 })
        setConsecutiveFailures(0)
      }
      
      setTimeout(() => setDetectionFeedback(null), 1000)
    }
  }

  const handleCameraReady = () => {
    setCameraReady(true)
    setCameraError(null)
    toast.success('📹 Camera ready! Start practicing!', { duration: 2000 })
  }

  const handleCameraError = (error) => {
    setCameraError(error.message)
    setCameraReady(false)
    toast.error(`Camera error: ${error.message}`, { duration: 5000 })
  }

  const restartCamera = () => {
    if (cameraRef.current) {
      setCameraError(null)
      cameraRef.current.restart()
    }
  }

  // Sign detection is now handled via callback props in CameraPanel
  // No need for window event listeners anymore!

  /**
   * Calibrate upright orientation with proper UX feedback
   * Validates input, shows loading state, provides clear success/failure messages
   */
  async function calibrateUpright() {
    // Pre-flight checks
    if (!cameraRef.current) {
      setCalibrationStatus('error')
      toast.error('📹 Camera not ready for calibration. Please wait for camera to initialize.', { duration: 3000 })
      return
    }

    if (!cameraReady) {
      setCalibrationStatus('error')
      toast.error('⏳ Camera is still loading. Please wait a moment.', { duration: 3000 })
      return
    }
    
    // Show loading state
    setIsCalibrating(true)
    setCalibrationStatus(null)
    
    try {
      // Small delay to show loading state (UX improvement)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Get angle from camera
      const tipAngle = cameraRef.current.getUprightAngle()
      
      // Validate the angle
      if (tipAngle === null || tipAngle === undefined) {
        setCalibrationStatus('no-hand')
        toast.warning('🤚 No hand detected. Please show your hand to the camera and try again.', { duration: 3500 })
        return
      }
      
      if (typeof tipAngle !== 'number' || isNaN(tipAngle) || !isFinite(tipAngle)) {
        setCalibrationStatus('error')
        toast.error('❌ Invalid angle data. Please try again.', { duration: 3000 })
        return
      }
      
      // Calculate offset with bounds checking
      const calculatedOffset = Math.round(tipAngle + 90)
      const offset = Math.max(-45, Math.min(45, calculatedOffset))
      
      // Warn if offset is extreme
      if (Math.abs(offset) > 30) {
        toast.warning(`⚠️ Large offset detected (${offset}°). Consider adjusting camera angle.`, { duration: 4000 })
      }
      
      // Save to localStorage with error handling
      try {
        localStorage.setItem('uprightOffsetDeg', String(offset))
      } catch (storageError) {
        console.error('localStorage save failed:', storageError)
        toast.warning('⚠️ Calibrated, but settings may not persist (storage full).', { duration: 3000 })
      }
      
      // Update state
      setUprightOffsetDeg(offset)
      setCalibrationStatus('success')
      
      // Success feedback
      toast.success(`✅ Calibration successful! Offset set to ${offset}°`, { duration: 3000 })
      
      // Clear status after a delay
      setTimeout(() => setCalibrationStatus(null), 3000)
      
    } catch (error) {
      console.error('Calibration error:', error)
      setCalibrationStatus('error')
      toast.error(`❌ Calibration failed: ${error.message || 'Unknown error'}`, { duration: 3000 })
    } finally {
      setIsCalibrating(false)
    }
  }

  /**
   * Reset calibration to default with confirmation feedback
   */
  function resetCalibration() {
    setIsCalibrating(true)
    setCalibrationStatus(null)
    
    try {
      localStorage.removeItem('uprightOffsetDeg')
      setUprightOffsetDeg(0)
      setCalibrationStatus('success')
      toast.info('🔄 Calibration reset to default (0°)', { duration: 2500 })
      
      setTimeout(() => setCalibrationStatus(null), 3000)
    } catch (error) {
      console.error('Reset calibration error:', error)
      setCalibrationStatus('error')
      toast.error('❌ Failed to reset calibration. Please try again.', { duration: 2500 })
    } finally {
      setIsCalibrating(false)
    }
  }

  /**
   * Enter fullscreen camera mode for mobile practice
   */
  const enterFullscreen = () => {
    setIsFullscreen(true)
    
    // Optional: Use Fullscreen API for true fullscreen
    if (cameraSectionRef.current && cameraSectionRef.current.requestFullscreen) {
      cameraSectionRef.current.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err)
        // Fallback: Just use CSS fullscreen mode
      })
    }
  }

  /**
   * Exit fullscreen camera mode
   */
  const exitFullscreen = () => {
    setIsFullscreen(false)
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.log('Exit fullscreen failed:', err)
      })
    }
  }

  /**
   * Handle swiper slide change - update target sign
   */
  const handleSwiperSlideChange = (swiper) => {
    const newIndex = swiper.activeIndex
    if (newIndex >= 0 && newIndex < ALL_SIGNS.length) {
      setTarget(ALL_SIGNS[newIndex])
    }
  }

  const currentSignStats = signStats[target] || {
    attempts: 0,
    successes: 0,
    accuracy: 0,
    mastered: false
  }
  
  const milestones = [
    { label: 'First sign mastered', completed: progress.done >= 1, goal: 1 },
    { label: '25% progress', completed: progress.pct >= 25, goal: Math.ceil(progress.total * 0.25) },
    { label: '50% progress', completed: progress.pct >= 50, goal: Math.ceil(progress.total * 0.5) },
    { label: '75% progress', completed: progress.pct >= 75, goal: Math.ceil(progress.total * 0.75) },
    { label: 'All signs mastered!', completed: progress.pct >= 100, goal: progress.total }
  ]

  return (
    <section className="training-view" role="main" aria-labelledby="training-title">
      {/* Main Split Layout - Camera Left, Controls Right */}
      <div className="practice-split-layout">
        {/* Left Side - Camera Feed */}
        <div className="practice-camera-section">
          <div className="practice-camera-card-mini">
            {!cameraOn ? (
              <div className="camera-placeholder">
                <div className="camera-icon">📷</div>
                <h2>Ready to Practice?</h2>
                <p>Start your camera to begin practicing signs</p>
                <button className="btn-start-practice" onClick={() => setCameraOn(true)}>
                  Start Camera →
                </button>
              </div>
            ) : (
              <div className="camera-feed-active">
                <div className="camera-controls-bar">
                  <div className="camera-status">
                    <div className="indicator-dot"></div>
                    <span>{cameraReady ? 'Camera Active' : 'Loading Camera...'}</span>
                  </div>
                  {cameraError ? (
                    <button className="btn-stop-camera" onClick={restartCamera}>
                      Restart Camera
                    </button>
                  ) : (
                    <button className="btn-stop-camera" onClick={() => setCameraOn(false)}>
                      Stop Camera
                    </button>
                  )}
                </div>
                <div className="camera-video-container">
                  <CameraPanel 
                    ref={cameraRef}
                    onSignDetected={handleSignDetected}
                    onError={handleCameraError}
                    onReady={handleCameraReady}
                    targetSign={target}
                    showUI={false}
                    showSkeleton={true}
                    showConfidence={true}
                    showTargetOverlay={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Controls and Recognition Mode */}
        <div className="practice-controls-section">
          {/* Camera Controls */}
          <div className="media-controls-card">
            <div className="media-toggle-buttons">
              <button 
                className={`media-toggle-btn ${cameraOn ? 'active' : ''}`}
                onClick={() => setCameraOn(!cameraOn)}
                title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                <svg className="media-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {cameraOn ? (
                    <>
                      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M7 7H4C3.44772 7 3 7.44772 3 8V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 10.5V8C17 7.44772 16.5523 7 16 7H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 10.5L21 7.5V16.5L17 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </>
                  ) : (
                    <>
                      <path d="M3 8C3 7.44772 3.44772 7 4 7H16C16.5523 7 17 7.44772 17 8V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M17 10.5L21 7.5V16.5L17 13.5V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </>
                  )}
                </svg>
                <span className="media-label">Camera</span>
              </button>
              <button 
                className="media-toggle-btn"
                disabled
                title="Microphone (coming soon)"
              >
                <svg className="media-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V23M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="media-label">Microphone</span>
              </button>
            </div>
          </div>

          {/* Recognition Mode Card - Gestures Only - Only show when camera is on */}
          {cameraOn && (
            <div className="recognition-mode-card">
              <h3>Recognition Mode</h3>
              <div className="recognition-mode-pills-vertical">
                <button className="mode-pill-large active">
                  <span className="pill-icon">👋</span>
                  <div className="pill-content">
                    <span className="pill-title">Daily Gestures</span>
                    <span className="pill-desc">Practice common hand signs</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Info Card when camera is off */}
          {!cameraOn && (
            <div className="home-info-card">
              <h3>✨ Start Practicing</h3>
              <p>Turn on your camera to begin practicing sign language with real-time feedback. Choose from {ALL_SIGNS.length} different signs to master!</p>
            </div>
          )}

          {/* Current Sign Display - Only show when camera is on */}
          {cameraOn && (
            <div className="training-card sign-selector-card">
            <div className="training-card-header">
              <h3 className="training-card-title">Current Sign</h3>
            </div>

            <div className="current-sign-display">
              <div className="current-sign-name">{FRIENDLY[target] || target}</div>
              <div className={`current-sign-status ${currentSignStats.mastered ? 'learned' : 'learning'}`}>
                <span>{currentSignStats.mastered ? '✓' : '○'}</span>
                {currentSignStats.mastered ? 'Mastered!' : 'Keep Practicing'}
              </div>
            </div>

            <div className="sign-hint">
              <p className="sign-hint-text">
                <strong>How to do it:</strong> {SIGN_DESCRIPTIONS[target] || 'Show the sign clearly to the camera.'}
              </p>
            </div>
            
            {/* Current Sign Progress */}
            {currentSignStats.attempts > 0 && (
              <div className="sign-progress-card">
                <div className="sign-progress-stats">
                  <div className="sign-progress-item">
                    <span className="sign-progress-label">Progress:</span>
                    <span className="sign-progress-value">
                      {currentSignStats.successes}/5 {currentSignStats.mastered && '🎓'}
                    </span>
                  </div>
                  <div className="sign-progress-item">
                    <span className="sign-progress-label">Accuracy:</span>
                    <span className="sign-progress-value">{currentSignStats.accuracy}%</span>
                  </div>
                </div>
                {currentSignStats.mastered && (
                  <div className="mastery-badge">✨ Mastered!</div>
                )}
              </div>
            )}
          </div>
          )}

          {/* Session Stats - Only show when camera is on */}
          {cameraOn && (
            <div className="training-card stats-card">
            <div className="training-card-header">
              <h3 className="training-card-title">Session Stats</h3>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{sessionAttempts}</div>
                <div className="stat-label">Attempts</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{sessionSuccesses}</div>
                <div className="stat-label">Successful</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {sessionAttempts > 0 ? Math.round((sessionSuccesses / sessionAttempts) * 100) : 0}%
                </div>
                <div className="stat-label">Accuracy</div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Sign Selector and Progress */}
      <div className="practice-bottom-section">
        {/* Progress Card */}
        <div className="practice-time-card">
          <div className="practice-user-info">
            <div className="practice-avatar-small">🎓</div>
            <div>
              <h3>Training Progress</h3>
              <p>{progress.done} / {progress.total} signs mastered</p>
            </div>
          </div>
          <div className="progress-inline-full">
            <span className="progress-label">Overall Progress</span>
            <div className="progress-wrapper">
              <div className="progress-bar-full">
                <div className="progress-fill-full" style={{ width: `${progress.pct}%` }}></div>
              </div>
              <span className="progress-value">{progress.pct}% ⭐</span>
            </div>
          </div>
        </div>

        {/* Sign Selector Dropdown */}
        <div className="practice-rewards-card-compact">
          <h3>🎯 Select Sign</h3>
          <select 
            className="sign-selector-dropdown" 
            value={target} 
            onChange={e => setTarget(e.target.value)}
          >
            {ALL_SIGNS.map(s => {
              const stats = signStats[s]
              const masteryIcon = stats?.mastered ? '🎓' : stats?.successes > 0 ? `${stats.successes}/5` : ''
              return (
                <option key={s} value={s}>
                  {FRIENDLY[s] || s} {masteryIcon}
                </option>
              )
            })}
          </select>
        </div>

        {/* Calibration Card */}
        <div className="practice-character-card-compact">
          <h3>⚙️ Settings</h3>
          <div className="calibration-actions-compact">
            <button 
              className="btn-secondary-compact" 
              onClick={calibrateUpright}
              disabled={isCalibrating || !cameraReady}
            >
              {isCalibrating ? 'Calibrating...' : '📐 Calibrate'}
            </button>
            <button 
              className="btn-secondary-compact" 
              onClick={resetCalibration}
              disabled={isCalibrating}
            >
              🔄 Reset
            </button>
          </div>
          <div className="calibration-status-compact">
            Offset: {uprightOffsetDeg}°
          </div>
        </div>
      </div>

    </section>
  )
}

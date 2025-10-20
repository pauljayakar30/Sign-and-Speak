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
      {/* Header with Progress */}
      <div className="training-header" role="banner">
        <div className="training-title-row">
          <h1 className="training-title" id="training-title">
            <span aria-hidden="true">🎓</span>
            Training Mode
          </h1>
          <div 
            className="training-progress-badge"
            role="status"
            aria-label={`Progress: ${progress.done} out of ${progress.total} signs mastered`}
          >
            <span aria-hidden="true">⭐</span>
            {progress.done} / {progress.total} Signs
          </div>
        </div>

        <div 
          className="progress-bar-container"
          role="progressbar"
          aria-valuenow={progress.pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall progress: ${progress.pct}% complete`}
        >
          <div className="progress-bar" style={{ width: `${progress.pct}%` }}></div>
        </div>
        <p className="progress-text" role="status" aria-live="polite">
          {progress.pct === 0 && "Let's start learning! Choose a sign below."}
          {progress.pct > 0 && progress.pct < 25 && `Great start! ${progress.done} signs learned.`}
          {progress.pct >= 25 && progress.pct < 50 && `You're doing awesome! Keep going!`}
          {progress.pct >= 50 && progress.pct < 75 && `Over halfway there! You're a star! 🌟`}
          {progress.pct >= 75 && progress.pct < 100 && `Almost there! Just a few more!`}
          {progress.pct === 100 && `🎉 Amazing! You've mastered all signs!`}
        </p>
      </div>

      {/* Screen Reader Announcements for Sign Detection */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
        style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        {recent && `Detected: ${FRIENDLY[recent] || recent}`}
      </div>
      
      {/* Screen Reader Announcements for Mastery */}
      <div 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
        style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        {currentSignStats.mastered && `Congratulations! You've mastered ${FRIENDLY[target] || target}!`}
      </div>

      {/* Main Content */}
      <div className="training-content" role="complementary"  aria-label="Training controls and camera">
        {/* Desktop Sign Selector Dropdown */}
        <div className="training-card sign-selector-card desktop-only" role="region" aria-labelledby="current-sign-title">
          <div className="training-card-header">
            <span className="training-card-icon" aria-hidden="true">🎯</span>
            <h2 className="training-card-title" id="current-sign-title">Current Sign</h2>
          </div>

          <div className="current-sign-display">
            <div className="current-sign-label">Now Practicing</div>
            <div className="current-sign-name">{FRIENDLY[target] || target}</div>
            <div 
              className={`current-sign-status ${currentSignStats.mastered ? 'learned' : 'learning'}`}
              role="status"
              aria-label={currentSignStats.mastered ? `${FRIENDLY[target]} is mastered` : `${FRIENDLY[target]} is in progress`}
            >
              <span aria-hidden="true">{currentSignStats.mastered ? '✓' : '○'}</span>
              {currentSignStats.mastered ? 'Mastered!' : 'Keep Practicing'}
            </div>
          </div>

          <label className="sign-selector-label" htmlFor="sign-selector-dropdown">
            Choose a different sign:
          </label>
          <select 
            className="sign-selector-dropdown" 
            id="sign-selector-dropdown"
            value={target} 
            onChange={e => setTarget(e.target.value)}
            aria-label="Select a sign to practice"
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

          <div className="sign-hint" role="note" aria-label="Instructions for current sign">
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
                {currentSignStats.lastPracticed && (
                  <div className="sign-progress-item">
                    <span className="sign-progress-label">Last practiced:</span>
                    <span className="sign-progress-value">
                      {new Date(currentSignStats.lastPracticed).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              {currentSignStats.mastered && (
                <div className="mastery-badge">✨ Mastered!</div>
              )}
            </div>
          )}

          {recent && (
            <div className="recent-detection">
              <p className="recent-detection-text">Last detected:</p>
              <p className="recent-detection-value">{FRIENDLY[recent] || recent}</p>
            </div>
          )}
        </div>

        {/* Mobile Swipeable Sign Selector */}
        <div className="training-card sign-swiper-card">
          <div className="training-card-header">
            <span className="training-card-icon">👆</span>
            <h2 className="training-card-title">Swipe to Choose Sign</h2>
          </div>

          <div className="sign-swiper-container">
            <Swiper
              modules={[Pagination, Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              centeredSlides={true}
              pagination={{ clickable: true }}
              initialSlide={ALL_SIGNS.indexOf(target)}
              onSwiper={setSwiperInstance}
              onSlideChange={handleSwiperSlideChange}
              breakpoints={{
                640: {
                  slidesPerView: 1.5,
                  spaceBetween: 30
                }
              }}
            >
              {ALL_SIGNS.map((sign, index) => {
                const stats = signStats[sign]
                const isActive = sign === target
                const masteryBadge = stats?.mastered 
                  ? '🎓 Mastered' 
                  : stats?.successes > 0 
                    ? `${stats.successes}/5 to master`
                    : 'Not started'
                
                return (
                  <SwiperSlide key={sign}>
                    <div 
                      className={`sign-swiper-card-item ${isActive ? 'active' : ''} ${stats?.mastered ? 'mastered' : ''}`}
                      onClick={() => setTarget(sign)}
                    >
                      <div className="sign-swiper-emoji">
                        {sign === 'WAVE' && '👋'}
                        {sign === 'SALUTE' && '🫡'}
                        {sign === 'THUMBS_UP' && '👍'}
                        {sign === 'THUMBS_DOWN' && '👎'}
                        {sign === 'OK' && '👌'}
                        {sign === 'PEACE' && '✌️'}
                        {sign === 'STOP' && '✋'}
                        {sign === 'POINT' && '☝️'}
                        {sign === 'FIST_BUMP' && '👊'}
                        {sign === 'HIGH_FIVE' && '🙌'}
                        {sign === 'APPLAUSE' && '👏'}
                        {sign === 'CROSSED_FINGERS' && '🤞'}
                        {sign === 'COME_HERE' && '👈'}
                        {sign === 'SHHH' && '🤫'}
                        {sign === 'FACEPALM' && '🤦'}
                        {sign === 'AIR_QUOTES' && '✌️'}
                        {sign === 'HANDSHAKE' && '🤝'}
                        {sign === 'MILK' && '✊'}
                      </div>
                      <div className="sign-swiper-name">{FRIENDLY[sign] || sign}</div>
                      <div className={`sign-swiper-badge ${stats?.mastered ? 'mastered' : ''}`}>
                        {masteryBadge}
                      </div>
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          </div>

          <div className="sign-hint">
            <p className="sign-hint-text">
              <strong>How to do it:</strong> {SIGN_DESCRIPTIONS[target] || 'Show the sign clearly to the camera.'}
            </p>
          </div>
          
          {/* Current Sign Progress - Mobile */}
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
                {currentSignStats.lastPracticed && (
                  <div className="sign-progress-item">
                    <span className="sign-progress-label">Last practiced:</span>
                    <span className="sign-progress-value">
                      {new Date(currentSignStats.lastPracticed).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              {currentSignStats.mastered && (
                <div className="mastery-badge">✨ Mastered!</div>
              )}
            </div>
          )}
        </div>

        {/* Practice Stats - Session Only */}
        <div className="training-card stats-card">
          <div className="training-card-header">
            <span className="training-card-icon">📊</span>
            <h2 className="training-card-title">Session Stats</h2>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{sessionAttempts}</div>
              <div className="stat-label">Total Attempts</div>
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

          {consecutiveFailures >= 2 && (
            <div className="hint-banner">
              <p>💡 <strong>Tip:</strong> {SIGN_DESCRIPTIONS[target] || 'Check the description above'}</p>
            </div>
          )}
        </div>

        {/* Calibration Settings */}
        <div className={`training-card calibration-card ${calibrationStatus === 'success' ? 'calibration-success' : ''} ${calibrationStatus === 'error' ? 'calibration-error' : ''}`}>
          <div className="training-card-header">
            <span className="training-card-icon">⚙️</span>
            <h2 className="training-card-title">Settings</h2>
            {calibrationStatus === 'success' && <span className="calibration-badge success">✓ Calibrated</span>}
            {calibrationStatus === 'error' && <span className="calibration-badge error">✗ Error</span>}
            {calibrationStatus === 'no-hand' && <span className="calibration-badge warning">⚠ No Hand</span>}
          </div>

          <div className="calibration-status">
            <span className="calibration-label">Upright Offset</span>
            <span className={`calibration-value ${isCalibrating ? 'calibrating' : ''}`}>
              {isCalibrating ? '...' : `${uprightOffsetDeg}°`}
            </span>
          </div>

          <div className="calibration-actions">
            <button 
              className="btn-secondary" 
              onClick={calibrateUpright}
              disabled={isCalibrating || !cameraReady}
            >
              {isCalibrating ? (
                <>
                  <span className="spinner"></span>
                  Calibrating...
                </>
              ) : (
                <>
                  <span>📐</span>
                  Calibrate Upright
                </>
              )}
            </button>
            <button 
              className="btn-secondary" 
              onClick={resetCalibration}
              disabled={isCalibrating}
            >
              {isCalibrating ? (
                <>
                  <span className="spinner"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Reset Calibration
                </>
              )}
            </button>
          </div>

          <div className="calibration-info">
            <p className="calibration-info-text">
              <strong>💡 How to calibrate:</strong> Hold your hand upright (fingers pointing up) in front of the camera, then click "Calibrate Upright". This helps improve sign detection accuracy.
            </p>
            {!cameraReady && (
              <p className="calibration-warning">
                ⏳ Waiting for camera to be ready...
              </p>
            )}
          </div>
        </div>

        {/* Milestones Checklist */}
        <div className="training-card checklist-card">
          <div className="training-card-header">
            <span className="training-card-icon">📋</span>
            <h2 className="training-card-title">Milestones</h2>
          </div>

          <ul className="checklist-items">
            {milestones.map((milestone, i) => (
              <li key={i} className={`checklist-item ${milestone.completed ? 'completed' : ''}`}>
                <span className="checklist-icon">{milestone.completed ? '✅' : '⭕'}</span>
                <p className="checklist-text">{milestone.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Camera Panel */}
      <div 
        ref={cameraSectionRef}
        className={`training-card camera-section ${detectionFeedback === 'correct' ? 'detected-correct' : ''} ${detectionFeedback === 'incorrect' ? 'detected-incorrect' : ''} ${isFullscreen ? 'fullscreen-mode' : ''}`}
      >
        {isFullscreen && (
          <div className="fullscreen-overlay">
            <button 
              className="fullscreen-exit-button"
              onClick={exitFullscreen}
              aria-label="Exit fullscreen"
            >
              <span>✕</span>
              Exit Fullscreen
            </button>
            <div className="fullscreen-sign-display">
              {FRIENDLY[target] || target}
            </div>
          </div>
        )}

        <div className="camera-header">
          <h2 className="camera-title">
            <span>📹</span>
            Live Practice
          </h2>
          <div className="camera-live-badge">
            <span className="live-dot"></span>
            {cameraReady ? 'LIVE' : 'LOADING'}
          </div>
        </div>
        
        {cameraError && (
          <div style={{ marginBottom: '1rem' }}>
            <button 
              className="btn-primary" 
              onClick={restartCamera}
              style={{ width: '100%' }}
            >
              🔄 Restart Camera
            </button>
          </div>
        )}
        
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
        
        {/* Camera Controls */}
        {cameraReady && !cameraError && (
          <div className="camera-controls" role="group" aria-label="Camera controls">
            <button 
              className="fullscreen-button"
              onClick={enterFullscreen}
              title="Practice in fullscreen mode"
              aria-label="Enter fullscreen mode for immersive practice"
            >
              <span aria-hidden="true">⛶</span>
              Fullscreen Mode
            </button>
            <button 
              className="btn-secondary camera-control-btn"
              onClick={restartCamera}
              title="Restart camera"
              aria-label="Restart camera if detection is not working"
            >
              <span aria-hidden="true">🔄</span>
              Restart Camera
            </button>
            <button 
              className="btn-secondary camera-control-btn"
              onClick={calibrateUpright}
              disabled={isCalibrating}
              title="Calibrate hand detection"
              aria-label={isCalibrating ? "Calibrating hand detection, please wait" : "Calibrate hand detection for better accuracy"}
            >
              {isCalibrating ? (
                <>
                  <span className="spinner"></span>
                  Calibrating...
                </>
              ) : (
                <>
                  <span>📐</span>
                  Quick Calibrate
                </>
              )}
            </button>
          </div>
        )}
        
        {detectionFeedback === 'correct' && (
          <div 
            className="detection-overlay success" 
            role="alert" 
            aria-live="assertive"
            aria-label="Correct sign detected"
          >
            <div className="detection-message">
              <span aria-hidden="true">✅</span> Perfect! Keep going!
            </div>
          </div>
        )}
      </div>

      {/* Sign Grid */}
      <div className="training-card sign-grid-card" role="region" aria-labelledby="sign-grid-title">
        <div className="training-card-header">
          <span className="training-card-icon" aria-hidden="true">🎨</span>
          <h2 className="training-card-title" id="sign-grid-title">All Signs ({progress.done}/{progress.total})</h2>
        </div>

        <div 
          className="sign-grid" 
          role="grid" 
          aria-label="Grid of all available signs to practice"
        >
          {ALL_SIGNS.map((sign, index) => {
            const signMastered = signStats[sign]?.mastered || false
            return (
              <div
                key={sign}
                className={`sign-grid-item ${signMastered ? 'learned' : ''} ${sign === target ? 'active' : ''}`}
                onClick={() => setTarget(sign)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setTarget(sign)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${FRIENDLY[sign] || sign}${signMastered ? ', mastered' : ''}${sign === target ? ', currently selected' : ''}`}
                aria-pressed={sign === target}
              >
                <p className="sign-grid-name">{FRIENDLY[sign] || sign}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

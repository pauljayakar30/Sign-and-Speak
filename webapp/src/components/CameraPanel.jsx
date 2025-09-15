import React, { useEffect, useRef, useState } from 'react'

export default function CameraPanel() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [label, setLabel] = useState('Show me a sign!')
  const [mood, setMood] = useState('Neutral')
  const [lastEarned, setLastEarned] = useState('')
  const [stars, setStars] = useState(() => {
    try { return Number(localStorage.getItem('stars') || '0') } catch { return 0 }
  })
  const [transcript, setTranscript] = useState('')

  // Speech debounce
  const lastSpokenRef = useRef({ text: '', t: 0 })
  function speak(text) {
    const now = Date.now()
    const { text: last, t } = lastSpokenRef.current
    if (last === text && (now - t) < 3000) return
    const u = new SpeechSynthesisUtterance(text)
    window.speechSynthesis?.speak(u)
    lastSpokenRef.current = { text, t: now }
  }

  function addStar(signLabel) {
    try {   
      const next = stars + 1
      setStars(next)
      localStorage.setItem('stars', String(next))
      setLastEarned(signLabel)
      // notify others
      try { window.dispatchEvent(new CustomEvent('starsUpdated', { detail: next })) } catch {}
    } catch {}
  }

  function appendTranscript(word) {
    setTranscript((prev) => {
      const sep = prev && !prev.endsWith(' ') ? ' ' : ''
      const next = (prev + sep + word).trim()
      return next
    })
  }

  async function sendChildEvent(event) {
    try {
      const code = sessionStorage.getItem('pairCode')
      if (!code) return
      await fetch('/pair/event', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...event })
      })
    } catch {}
  }

  useEffect(() => {
  let hands = null
    let faceMesh = null
    let camera = null
    let cameraRunning = false
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

  // Gesture state (multi-hand, immediate recognition with smoothing + cooldown)
  const frameHistory = [] // array of Sets of labels per frame
  const N_FRAMES = 7
  const STABLE_COUNT = 4
  const STABLE_DYNAMIC = 2
  const stableThresholdMap = {
    // Static signs (need more stability)
    STOP: 4, OK: 4, THUMBS_UP: 4, THUMBS_DOWN: 4, PEACE: 4, POINT: 3,
    // Motion or two-hand patterns (need fewer frames)
    WAVE: 2, APPLAUSE: 2, COME_HERE: 2, HIGH_FIVE: 2, FIST_BUMP: 2, HANDSHAKE: 3,
    SALUTE: 3, SHHH: 3, FACEPALM: 3, AIR_QUOTES: 3, CROSSED_FINGERS: 3, MILK: 3
  }
  const signCooldown = {}
  const SIGN_COOLDOWN_MS = 1200
  const WAVE_COOLDOWN_MS = 1500
  let lastWaveAt = 0
  const wristTrail = []
  const lastTipAngleRef = { angle: null }
  let uprightOffsetDeg = 0
  try { uprightOffsetDeg = Number(localStorage.getItem('uprightOffsetDeg') || '0') } catch {}
    // Face landmarks cache for face-aware gestures
    let latestFace = null
    // Combined-hand trails
    const palmDistanceTrail = [] // track distance between palms over time for clap/handshake
    const indexCurlTrail = [] // track index tip distance oscillation for "come here"

    const getDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y)
    const getAngleDeg = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
    const getPalmCenter = (lm) => {
      const ids = [0,5,9,13,17]
      let x = 0, y = 0
      ids.forEach(i => { x += lm[i].x; y += lm[i].y })
      return { x: x/ids.length, y: y/ids.length }
    }
    const getHandSize = (lm) => getDistance(lm[0], lm[9]) || 1
    function majorityLabel(buf) {
      const counts = {}
      for (const l of buf) counts[l] = (counts[l]||0)+1
      let best = 'NONE', bestC = 0
      for (const k in counts) {
        if (k === 'NONE') continue
        if (counts[k] > bestC) { best = k; bestC = counts[k] }
      }
      return { label: best, count: bestC }
    }
    function trackWrist(w) {
      const now = Date.now()
      wristTrail.push({ t: now, x: w.x, y: w.y })
      while (wristTrail.length && now - wristTrail[0].t > 1500) wristTrail.shift()
    }
    function hasLowMotion() {
      if (wristTrail.length < 5) return false
      let sx = 0, sy = 0
      for (let i = 1; i < wristTrail.length; i++) {
        sx += Math.abs(wristTrail[i].x - wristTrail[i-1].x)
        sy += Math.abs(wristTrail[i].y - wristTrail[i-1].y)
      }
      const avg = (sx + sy) / (wristTrail.length - 1)
      return avg < 0.02 // stationary if very little movement
    }
    function hasWristOscillation() {
      if (wristTrail.length < 6) return false
      const xs = wristTrail.map(p => p.x)
      const min = Math.min(...xs), max = Math.max(...xs)
      const range = max - min
      if (range < 0.06) return false
      let changes = 0
      for (let i = 2; i < xs.length; i++) {
        const a = xs[i] - xs[i-1]
        const b = xs[i-1] - xs[i-2]
        if (a*b < 0) changes++
      }
      return changes >= 2
    }

          function trackPalmDistance(d) {
            const now = Date.now()
            palmDistanceTrail.push({ t: now, d })
            while (palmDistanceTrail.length && now - palmDistanceTrail[0].t > 1200) palmDistanceTrail.shift()
          }
          function hasClapPattern() {
            if (palmDistanceTrail.length < 6) return false
            const ds = palmDistanceTrail.map(p => p.d)
            const min = Math.min(...ds), max = Math.max(...ds)
            if (max - min < 0.10) return false
            if (min > 0.06) return false
            let changes = 0
            for (let i = 2; i < ds.length; i++) {
              const a = ds[i] - ds[i-1]
              const b = ds[i-1] - ds[i-2]
              if (a*b < 0) changes++
            }
            return changes >= 2
          }
          function trackIndexCurl(dist) {
            const now = Date.now()
            indexCurlTrail.push({ t: now, dist })
            while (indexCurlTrail.length && now - indexCurlTrail[0].t > 1200) indexCurlTrail.shift()
          }
          function hasComeHerePattern(thresholdNear, thresholdFar) {
            if (indexCurlTrail.length < 6) return false
            const ds = indexCurlTrail.map(p => p.dist)
            const min = Math.min(...ds), max = Math.max(...ds)
            if (min > thresholdNear) return false
            if (max < thresholdFar) return false
            let changes = 0
            for (let i = 2; i < ds.length; i++) {
              const a = ds[i] - ds[i-1]
              const b = ds[i-1] - ds[i-2]
              if (a*b < 0) changes++
            }
            return changes >= 2
          }

    function processStable(labelsInFrame) {
      // Deduplicate within frame
      const frameSet = new Set(labelsInFrame.filter(l => l && l !== 'NONE'))
      // Record history
      frameHistory.push(frameSet)
      if (frameHistory.length > N_FRAMES) frameHistory.shift()
      // Count across frames: a label is stable if it appears in >= STABLE_COUNT different frames
      const counts = {}
      for (const s of frameHistory) {
        for (const l of s) counts[l] = (counts[l]||0) + 1
      }
  const stable = Object.keys(counts).filter(k => counts[k] >= (stableThresholdMap[k] || STABLE_COUNT))
      if (stable.length) {
        setLabel(`Detected: ${stable.map(s => s.replace('_',' ')).join(', ')}`)
        const now = Date.now()
        // Handle each stable sign with cooldowns
          const wordsMap = {
            'STOP':'stop', 'MILK':'milk', 'THUMBS_UP':'yes', 'PEACE':'peace', 'POINT':'look', 'WAVE':'hello',
            'THUMBS_DOWN':'no', 'OK':'okay', 'APPLAUSE':'clap', 'COME_HERE':'come here', 'SHHH':'shh',
            'HIGH_FIVE':'high five', 'FIST_BUMP':'boom', 'CROSSED_FINGERS':'good luck', 'HANDSHAKE':'nice to meet you',
            'SALUTE':'salute', 'FACEPALM':'oh no', 'AIR_QUOTES':'quote'
          }
        let spokenAny = false
        const wordsToSpeak = []
        for (const s of stable) {
          if (s === 'WAVE') {
            if (now - lastWaveAt > WAVE_COOLDOWN_MS) {
              lastWaveAt = now
              sendChildEvent({ type: 'sign', payload: { value: 'WAVE' } })
              try { window.dispatchEvent(new CustomEvent('signDetected', { detail: { value: 'WAVE' } })) } catch {}
              wordsToSpeak.push('hello')
              appendTranscript('hello')
              try { window.confetti?.({ particleCount: 30, spread: 50, origin: { y: 0.7 } }) } catch {}
            }
            continue
          }
          const lastAt = signCooldown[s] || 0
          if (now - lastAt > SIGN_COOLDOWN_MS) {
            signCooldown[s] = now
            sendChildEvent({ type: 'sign', payload: { value: s } })
            try { window.dispatchEvent(new CustomEvent('signDetected', { detail: { value: s } })) } catch {}
            const word = wordsMap[s] || s.toLowerCase()
            wordsToSpeak.push(word)
            appendTranscript(word)
            try { window.confetti?.({ particleCount: 24, spread: 40, origin: { y: 0.7 } }) } catch {}
            addStar(s.replace('_',' '))
            spokenAny = true
          }
        }
        if (wordsToSpeak.length) speak(wordsToSpeak.join(' '))
      } else {
        setLabel('Show me a sign!')
      }
    }

    function recognizeSign(landmarks) {
      const wrist = landmarks[0]
      const thumbTip = landmarks[4]
      const thumbIp = landmarks[3]
      const indexTip = landmarks[8]
      const middleTip = landmarks[12]
      const ringTip = landmarks[16]
      const pinkyTip = landmarks[20]
      const palmCenter = getPalmCenter(landmarks)
  const handSize = getHandSize(landmarks)
  if (handSize < 0.06) return 'NONE' // too small/far for reliable recognition
      const EXT_THRESH = 0.30
      const isExtended = (tip) => getDistance(tip, palmCenter) > EXT_THRESH * handSize
      const indexExt = isExtended(indexTip)
      const middleExt = isExtended(middleTip)
      const ringExt = isExtended(ringTip)
      const pinkyExt = isExtended(pinkyTip)
      const thumbExt = (getDistance(thumbTip, thumbIp) > 0.05) || isExtended(thumbTip)
      const spread = getDistance(indexTip, pinkyTip) / handSize
      const is_open_palm = (indexExt && middleExt && ringExt && pinkyExt) && spread > 0.7
      const is_fist = !indexExt && !middleExt && !ringExt && !pinkyExt && !thumbExt
      const is_thumbs_up = thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt && (thumbTip.y < wrist.y - 0.02)
      const is_thumbs_down = thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt && (thumbTip.y > wrist.y + 0.02)
      const is_peace = indexExt && middleExt && !ringExt && !pinkyExt
      const is_point = indexExt && !middleExt && !ringExt && !pinkyExt
      const okCircle = (getDistance(thumbTip, indexTip) / handSize) < 0.15
      const is_ok = okCircle && (indexExt || thumbExt)
      // Upright orientation: average of fingertips should be above palm center (fingers pointing up)
      const tipAvg = { x: (indexTip.x + middleTip.x + ringTip.x + pinkyTip.x)/4, y: (indexTip.y + middleTip.y + ringTip.y + pinkyTip.y)/4 }
  const tipAngle = getAngleDeg(palmCenter, tipAvg) // -90 deg is straight up
  lastTipAngleRef.angle = tipAngle
  const targetUp = -90 + uprightOffsetDeg
  const is_upright = Math.abs(tipAngle - targetUp) < 25 && tipAvg.y < palmCenter.y - 0.02
      trackWrist(wrist)
      const is_wave = is_open_palm && is_upright && hasWristOscillation()
      // Face-aware helpers
      let is_salute = false
      let is_shhh = false
      let is_facepalm = false
      let is_crossed_fingers = false
      if (latestFace) {
        const leftEyeOuter = latestFace[33]
        const rightEyeOuter = latestFace[263]
        const eyesY = (leftEyeOuter.y + rightEyeOuter.y) / 2
        const mouthTop = latestFace[13], mouthBot = latestFace[14]
        const mouthMid = { x: (mouthTop.x + mouthBot.x)/2, y: (mouthTop.y + mouthBot.y)/2 }
        const nose = latestFace[1]
        // Salute: open palm near/above eye line
        if (is_open_palm && palmCenter.y < eyesY + 0.02 && getDistance(palmCenter, leftEyeOuter) < 0.20) {
          is_salute = true
        }
        // Shhh: index tip close to mouth
        if (indexExt && !middleExt && !ringExt && getDistance(indexTip, mouthMid) < 0.06) {
          is_shhh = true
        }
        // Facepalm: open palm near face center
        if (is_open_palm && getDistance(palmCenter, nose) < 0.10) {
          is_facepalm = true
        }
      }
      // STOP: open palm, fingers up (upright), and not too close to face
      let is_stop = false
  const farFromFace = latestFace ? (getDistance(palmCenter, latestFace[1]) > 0.14) : true
  if (is_open_palm && is_upright && farFromFace && hasLowMotion()) is_stop = true
      // Crossed fingers: index and middle tips very close, others curled
      if (indexExt && middleExt && !ringExt && !pinkyExt && (getDistance(indexTip, middleTip) / handSize) < 0.07) {
        is_crossed_fingers = true
      }
      let raw = 'NONE'
      if (is_wave) raw = 'WAVE'
      else if (is_facepalm) raw = 'FACEPALM'
      else if (is_salute) raw = 'SALUTE'
      else if (is_shhh) raw = 'SHHH'
      else if (is_ok) raw = 'OK'
      else if (is_thumbs_up) raw = 'THUMBS_UP'
      else if (is_thumbs_down) raw = 'THUMBS_DOWN'
      else if (is_peace) raw = 'PEACE'
      else if (is_point) raw = 'POINT'
      else if (is_crossed_fingers) raw = 'CROSSED_FINGERS'
      else if (is_fist) raw = 'MILK'
      else if (is_stop) raw = 'STOP'
      return raw
    }


    function recognizeMood(lm) {
      if (!lm || lm.length < 468) return 'Neutral'
      // Normalization anchors
      const leftCheek = lm[234]
      const rightCheek = lm[454]
      const faceWidth = getDistance(leftCheek, rightCheek) || 1

      // Eyes (openness normalized by eye width)
      const lEyeTop = lm[159], lEyeBot = lm[145]
      const rEyeTop = lm[386], rEyeBot = lm[374]
      const lEyeOuter = lm[33], lEyeInner = lm[133]
      const rEyeInner = lm[362], rEyeOuter = lm[263]
      const lEyeOpen = getDistance(lEyeTop, lEyeBot) / (getDistance(lEyeOuter, lEyeInner) || 1)
      const rEyeOpen = getDistance(rEyeTop, rEyeBot) / (getDistance(rEyeInner, rEyeOuter) || 1)
      const eyeOpen = (lEyeOpen + rEyeOpen) / 2

      // Mouth
      const mouthL = lm[61], mouthR = lm[291]
      const mouthTop = lm[13], mouthBot = lm[14]
      const mouthW = getDistance(mouthL, mouthR) / faceWidth
      const mouthOpen = getDistance(mouthTop, mouthBot) / faceWidth
      const mouthMidY = (mouthTop.y + mouthBot.y) / 2
      const cornersAvgY = (mouthL.y + mouthR.y) / 2
      const smileCurve = (mouthMidY - cornersAvgY) // positive when corners higher than middle (smile), y-axis downwards

      // Head roll (confusion cue)
      const leftEyeOuter = lm[33]
      const rightEyeOuter = lm[263]
      const rollDeg = getAngleDeg(leftEyeOuter, rightEyeOuter) // ~0 when level

      // Heuristic scoring per mood
      const scores = { Happy:0, Sad:0, Surprised:0, Angry:0, Fear:0, Confused:0, Neutral:0 }
      // Happy: corners up, wider mouth
      if (smileCurve > 0) scores.Happy += Math.min(1, smileCurve * 18)
      if (mouthW > 0.35) scores.Happy += Math.min(1, (mouthW - 0.35) * 4)
      // Sad: corners down, narrow mouth, slightly closed eyes
      if (smileCurve < 0) scores.Sad += Math.min(1, (-smileCurve) * 18)
      if (mouthW < 0.35) scores.Sad += Math.min(1, (0.35 - mouthW) * 4)
      if (eyeOpen < 0.22) scores.Sad += Math.min(1, (0.22 - eyeOpen) * 6)
      // Surprised: big eyes + big mouth open
      if (eyeOpen > 0.28) scores.Surprised += Math.min(1, (eyeOpen - 0.28) * 6)
      if (mouthOpen > 0.07) scores.Surprised += Math.min(1, (mouthOpen - 0.07) * 30)
      // Fear: very wide eyes, medium mouth open
      if (eyeOpen > 0.30) scores.Fear += Math.min(1, (eyeOpen - 0.30) * 6)
      if (mouthOpen > 0.04 && mouthOpen < 0.09) scores.Fear += 0.6
      // Angry: narrowed eyes + pressed lips
      if (eyeOpen < 0.19) scores.Angry += Math.min(1, (0.19 - eyeOpen) * 8)
      if (mouthOpen < 0.02 && mouthW < 0.38) scores.Angry += 0.6
      // Confused: noticeable head tilt
      if (Math.abs(rollDeg) > 10) scores.Confused += Math.min(1, (Math.abs(rollDeg) - 10) / 20)

      // Pick best
      let best = 'Neutral', bestScore = 0.2 // small bias to avoid flipping
      for (const k in scores) { if (scores[k] > bestScore) { best = k; bestScore = scores[k] } }
      return best
    }

    let lastMood = ''
    let lastMoodSentAt = 0
    const moodBuffer = []

    function onFaceResults(results) {
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return
      const landmarks = results.multiFaceLandmarks[0]
        latestFace = landmarks
      const raw = recognizeMood(landmarks)
      const N = 7
      moodBuffer.push(raw)
      if (moodBuffer.length > N) moodBuffer.shift()
      const counts = {}
      for (const l of moodBuffer) counts[l] = (counts[l]||0)+1
      let maj = 'Neutral', cmax = 0
      for (const k in counts) { if (counts[k] > cmax) { cmax = counts[k]; maj = k } }
      setMood(maj)
      const now = Date.now()
      if (maj !== lastMood && (now - lastMoodSentAt) > 5000) {
        lastMood = maj; lastMoodSentAt = now
        sendChildEvent({ type: 'mood', payload: { value: maj } })
      }
    }

    function onHandResults(results) {
      if (!ctx || !canvas) return
      const img = results.image
      // Resize canvas if needed
      if (canvas.width !== img.width) canvas.width = img.width
      if (canvas.height !== img.height) canvas.height = img.height
      ctx.save()
      ctx.clearRect(0,0,canvas.width,canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        let labelsInFrame = []
        const handsLms = results.multiHandLandmarks || []
        if (handsLms.length > 0) {
          for (const landmarks of handsLms) {
          try {
            window.drawConnectors?.(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 })
            window.drawLandmarks?.(ctx, landmarks, { color: '#FF0000', lineWidth: 2 })
          } catch {}
          const raw = recognizeSign(landmarks)
            labelsInFrame.push(raw)
            // Track index curl distance for beckon pattern
            const palmCenter = getPalmCenter(landmarks)
            const handSize = getHandSize(landmarks)
            const indexTip = landmarks[8]
            const indexDist = getDistance(indexTip, palmCenter) / (handSize || 1)
            trackIndexCurl(indexDist)
        }
          // Two-hand combined gestures
          if (handsLms.length >= 2) {
            const lm1 = handsLms[0], lm2 = handsLms[1]
            const c1 = getPalmCenter(lm1), c2 = getPalmCenter(lm2)
            const size1 = getHandSize(lm1), size2 = getHandSize(lm2)
            const d = getDistance(c1, c2)
            trackPalmDistance(d)
            const EXT = 0.30
            const isExt = (lm, tip) => getDistance(lm[tip], getPalmCenter(lm)) > EXT * getHandSize(lm)
            const allExt = (lm) => [8,12,16,20].every(i => isExt(lm, i))
            const noneExt = (lm) => [8,12,16,20].every(i => !isExt(lm, i))
            const bothOpen = allExt(lm1) && allExt(lm2)
            const bothFist = noneExt(lm1) && noneExt(lm2)
            const eyesY = latestFace ? ((latestFace[33].y + latestFace[263].y) / 2) : 0.4
            // Applause (clapping)
            if (hasClapPattern() && bothOpen) labelsInFrame.push('APPLAUSE')
            // High-five: both open palms high and near each other
            if (bothOpen && c1.y < eyesY - 0.05 && c2.y < eyesY - 0.05 && d < 0.14) labelsInFrame.push('HIGH_FIVE')
            // Fist bump: both fists and close quickly
            const prevD = palmDistanceTrail.length > 1 ? palmDistanceTrail[palmDistanceTrail.length - 2].d : d
            if (bothFist && d < 0.10 && (prevD - d) > 0.02) labelsInFrame.push('FIST_BUMP')
            // Handshake: hands close and at similar height
            if (d < 0.14 && Math.abs(c1.y - c2.y) < 0.05) labelsInFrame.push('HANDSHAKE')
            // Air quotes: both hands with index+middle extended (peace) near head
            const isPeace1 = isExt(lm1,8) && isExt(lm1,12) && !isExt(lm1,16) && !isExt(lm1,20)
            const isPeace2 = isExt(lm2,8) && isExt(lm2,12) && !isExt(lm2,16) && !isExt(lm2,20)
            if (isPeace1 && isPeace2 && c1.y < eyesY + 0.05 && c2.y < eyesY + 0.05) {
              labelsInFrame = labelsInFrame.filter(l => l !== 'PEACE')
              labelsInFrame.push('AIR_QUOTES')
            }
          // If HIGH_FIVE present, suppress STOP/WAVE in this frame to avoid conflict
          if (labelsInFrame.includes('HIGH_FIVE')) {
            labelsInFrame = labelsInFrame.filter(l => l !== 'STOP' && l !== 'WAVE')
          }
          }
        // Global pattern: Come Here via index curl oscillation
        if (hasComeHerePattern(0.20, 0.36)) {
          labelsInFrame.push('COME_HERE')
        }
      }
      processStable(labelsInFrame)
      ctx.restore()
    }

  async function start() {
      const { Hands } = window
      const { FaceMesh } = window
      const { Camera } = window
      if (!Hands || !Camera) return
  hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
  hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
      hands.onResults(onHandResults)
      if (FaceMesh) {
        try {
          faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` })
          faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
          faceMesh.onResults(onFaceResults)
        } catch {}
      }
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current })
          if (faceMesh) {
            try { await faceMesh.send({ image: videoRef.current }) } catch {}
          }
        },
        width: 640,
        height: 480
      })
      camera.start()
      cameraRunning = true
      setReady(true)
    }

  // Wait for scripts to be present
    let tries = 0
    const iv = setInterval(() => {
      if (window.Hands && window.Camera) {
        clearInterval(iv)
        start()
      } else if (++tries > 60) {
        clearInterval(iv)
      }
    }, 250)

    function cleanup() {
      try { camera?.stop?.() } catch {}
      try {
        const stream = videoRef.current?.srcObject
        if (stream && typeof stream.getTracks === 'function') stream.getTracks().forEach(t => { try { t.stop() } catch {} })
        if (videoRef.current) videoRef.current.srcObject = null
      } catch {}
      cameraRunning = false
      hands = null
      faceMesh = null
    }

    // Provide upright angle for calibration
    function onRequestUpright() {
      try { window.dispatchEvent(new CustomEvent('replyUprightAngle', { detail: { tipAngle: lastTipAngleRef.angle } })) } catch {}
    }

    // Pause when tab hidden
    function onVisibility() {
      if (document.hidden) {
        try { camera?.stop?.() } catch {}
      } else {
        try { camera?.start?.() } catch {}
      }
    }
    window.addEventListener('requestUprightAngle', onRequestUpright)
    document.addEventListener('visibilitychange', onVisibility)

    return () => { document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('requestUprightAngle', onRequestUpright); cleanup() }
  }, [])

  return (
    <div className="camera-panel">
      <div className="video-wrap">
        <video ref={videoRef} autoPlay playsInline />
        <canvas ref={canvasRef} width={640} height={480} />
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <strong>{label}</strong>
        <span style={{ marginLeft: 'auto' }}>Mood: {mood}</span>
      </div>
      {!ready && <p className="muted">Loading camera… If prompted, allow camera access.</p>}
      {transcript && (
        <div className="card" style={{ marginTop: 10 }}>
          <h3>Live Transcript</h3>
          <p style={{ margin: 0 }}>{transcript}</p>
          <div className="row" style={{ marginTop: 6 }}>
            <button className="secondary" onClick={() => setTranscript('')}>Clear</button>
          </div>
        </div>
      )}
      {lastEarned && (
        <div className="card reward" style={{ marginTop: 10 }}>
          <strong>Great job!</strong>
          <p className="muted">You earned a star for {lastEarned}.</p>
          <div className="row">
            <button className="primary" onClick={() => setLastEarned('')}>Yay!</button>
            <div className="stars-pill">⭐ {stars}</div>
          </div>
        </div>
      )}
    </div>
  )
}

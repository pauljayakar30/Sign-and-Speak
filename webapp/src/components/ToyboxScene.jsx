import React, { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function ToyboxScene({ onStartChild, onOpenParent }) {
  const prefersReduced = useReducedMotion()
  const [mx, setMx] = useState(0)
  const [my, setMy] = useState(0)
  const [age, setAge] = useState(() => localStorage.getItem('ageGroup') || '4-6')

  useEffect(() => {
    function onMove(e) {
      const el = document.querySelector('.toybox')
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      setMx(x); setMy(y)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  function setGroup(g) {
    setAge(g)
    try { localStorage.setItem('ageGroup', g) } catch {}
  }

  const config = useMemo(() => {
    // Adjust density and wobble by age
    if (age === '1-3') return { clouds: 2, trees: 1, wobble: 0.6, speed: 0.4 }
    if (age === '7-10') return { clouds: 4, trees: 3, wobble: 1.1, speed: 1.0 }
    return { clouds: 3, trees: 2, wobble: 0.9, speed: 0.7 }
  }, [age])

  const tiltX = (my - 0.5) * (prefersReduced ? 0 : 6)
  const tiltY = (mx - 0.5) * (prefersReduced ? 0 : -8)

  const Cloud = ({ i }) => (
    <motion.div className="cloud clay" style={{ left: `${10 + i*20}%`, top: `${10 + (i%2)*6}%` }}
      animate={{ y: [0, 6, 0] }} transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }} />
  )

  const Tree = ({ i }) => (
    <motion.div className="tree" style={{ left: `${20 + i*18}%`, bottom: `${12 + (i%2)*3}%` }}
      animate={{ scaleY: [1, 0.97, 1] }} transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}>
      <div className="trunk clay" />
      <div className="cap felt" />
    </motion.div>
  )

  return (
    <div className="toybox">
      <motion.div className="stage" style={{ transformStyle: 'preserve-3d' }} animate={{ rotateX: tiltX, rotateY: tiltY }} transition={{ type: 'spring', stiffness: 100, damping: 15 }}>
        <div className="wood-base" />
        <div className="felt grass" />
        <div className="hill clay" />

        {[...Array(config.clouds)].map((_, i) => <Cloud key={i} i={i} />)}
        {[...Array(config.trees)].map((_, i) => <Tree key={i} i={i} />)}

        <motion.div className="buddy clay" whileHover={{ scale: 1.03 }} whileTap={{ scaleY: 0.95, scaleX: 1.02 }}>
          <span role="img" aria-label="Otter">🦦</span>
        </motion.div>

        <div className="ui-layer">
          <div className="age-pill">
            <button className={`chip ${age==='1-3'?'active':''}`} onClick={() => setGroup('1-3')}>1–3</button>
            <button className={`chip ${age==='4-6'?'active':''}`} onClick={() => setGroup('4-6')}>4–6</button>
            <button className={`chip ${age==='7-10'?'active':''}`} onClick={() => setGroup('7-10')}>7–10</button>
          </div>
          <div className="row ctas">
            <motion.button className="gummy-btn" whileHover={{ y: -2 }} whileTap={{ scaleY: 0.94 }} onClick={onStartChild}>
              I’m a Child
            </motion.button>
            <motion.button className="gummy-btn alt" whileHover={{ y: -2 }} whileTap={{ scaleY: 0.94 }} onClick={onOpenParent}>
              Parent Dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="light-orb" style={{ left: `${mx*100}%`, top: `${my*100}%` }} />
    </div>
  )
}

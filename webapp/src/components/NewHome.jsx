/**
 * NewHome Component
 * 
 * Modern landing page showcasing Sign & Speak's features and value proposition.
 * 
 * Features:
 * - Hero section with gradient text and animated CTAs
 * - Statistics showcase (15+ signs, 7 moods, 100% private)
 * - Floating animated cards (mascot, emojis, rewards)
 * - 6-feature grid highlighting platform capabilities
 * - Interactive sign showcase with 8 recognized gestures
 * - Final CTA section encouraging user activation
 * 
 * Animations:
 * - Uses Framer Motion for smooth page transitions
 * - Floating cards with infinite loop animations
 * - Scroll-triggered reveal effects (whileInView)
 * - Hover interactions on features and sign badges
 * 
 * Navigation:
 * - onStartChild: Switches to child learning interface
 * - onOpenParent: Opens parent dashboard
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function NewHome({ onStartChild, onOpenParent }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const features = [
    { id: 1, icon: '👋', title: 'Real-time Recognition', desc: 'Detects 15+ signs instantly using your camera' },
    { id: 2, icon: '🎯', title: 'Guided Training', desc: 'Practice mode with hints and rewards' },
    { id: 3, icon: '📊', title: 'Parent Insights', desc: 'Track progress with smart analytics' },
    { id: 4, icon: '🎨', title: 'Playful Rewards', desc: 'Earn stars, stickers, and unlock characters' },
    { id: 5, icon: '🔒', title: 'Privacy First', desc: 'All video processing stays on your device' },
    { id: 6, icon: '🤖', title: 'AI Coach', desc: 'Personalized tips powered by OpenAI' }
  ]

  const signs = [
    { emoji: '👋', name: 'Wave' },
    { emoji: '✋', name: 'Stop' },
    { emoji: '👍', name: 'Good' },
    { emoji: '👎', name: 'No' },
    { emoji: '👌', name: 'OK' },
    { emoji: '☮️', name: 'Peace' },
    { emoji: '👏', name: 'Clap' },
    { emoji: '🙋', name: 'Hi-Five' }
  ]

  return (
    <div className="home-hero">
      {/* Hero Section */}
      <section className="hero-main">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="badge-icon">✨</span>
            <span>Powered by AI & Computer Vision</span>
          </motion.div>

          <h1 className="hero-title">
            Turn Gestures Into
            <span className="gradient-text"> Words</span>
          </h1>

          <p className="hero-subtitle">
            An interactive platform that recognizes hand signs and facial expressions in real-time, 
            helping children communicate and learn with joy.
          </p>

          <div className="hero-actions">
            <motion.button 
              className="btn-primary large"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartChild}
            >
              <span>Start Learning</span>
              <span className="btn-icon">🚀</span>
            </motion.button>

            <motion.button 
              className="btn-secondary large"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenParent}
            >
              <span>Parent Dashboard</span>
              <span className="btn-icon">📊</span>
            </motion.button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">15+</div>
              <div className="stat-label">Hand Signs</div>
            </div>
            <div className="stat">
              <div className="stat-value">7</div>
              <div className="stat-label">Moods Detected</div>
            </div>
            <div className="stat">
              <div className="stat-value">100%</div>
              <div className="stat-label">Private & Safe</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="visual-container">
            <motion.div 
              className="floating-card main"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="card-icon">🦦</div>
              <div className="card-content">
                <div className="card-title">Otter Coach</div>
                <div className="card-desc">Your friendly learning companion</div>
              </div>
            </motion.div>

            <motion.div 
              className="floating-card accent-1"
              animate={{ y: [0, 8, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <span className="emoji-lg">👋</span>
              <span className="emoji-label">Wave</span>
            </motion.div>

            <motion.div 
              className="floating-card accent-2"
              animate={{ y: [0, -12, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <span className="emoji-lg">😊</span>
              <span className="emoji-label">Happy</span>
            </motion.div>

            <motion.div 
              className="floating-card accent-3"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <span className="emoji-lg">⭐</span>
              <span className="emoji-label">+5 Stars</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Everything You Need to Learn & Grow
        </motion.h2>

        <div className="features-grid">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              className={`feature-card ${hoveredFeature === feature.id ? 'hovered' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onHoverStart={() => setHoveredFeature(feature.id)}
              onHoverEnd={() => setHoveredFeature(null)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Signs Showcase */}
      <section className="signs-section">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Signs We Recognize
        </motion.h2>
        <p className="section-subtitle">...and many more!</p>

        <div className="signs-showcase">
          {signs.map((sign, idx) => (
            <motion.div
              key={idx}
              className="sign-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="sign-emoji">{sign.emoji}</span>
              <span className="sign-name">{sign.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div 
          className="cta-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="cta-title">Ready to Start?</h2>
          <p className="cta-desc">
            Join thousands of families using Sign & Speak to bridge communication gaps with joy and confidence.
          </p>
          <div className="cta-actions">
            <motion.button 
              className="btn-primary large"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartChild}
            >
              Begin Your Journey
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

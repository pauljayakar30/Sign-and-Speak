/**
 * NewHome Component
 * 
 * Modern landing page for sign language practice.
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function NewHome({ onStartChild, onOpenParent }) {
  const [hoveredCard, setHoveredCard] = useState(null)

  const userPaths = [
    { 
      id: 'child', 
      icon: '', 
      title: 'For Children', 
      desc: 'Learn sign language through interactive games and earn rewards',
      features: ['Playful interface', 'Star rewards', 'Real-time feedback'],
      action: 'Start Learning',
      onClick: onStartChild
    },
    { 
      id: 'adult', 
      icon: '', 
      title: 'For Adults', 
      desc: 'Practice essential signs with progress tracking and organized categories',
      features: ['Common signs library', 'Progress tracking', 'Category filters'],
      action: 'Begin Practice',
      onClick: onStartChild
    },
    { 
      id: 'parent', 
      icon: '', 
      title: 'For Parents', 
      desc: 'Monitor your child'\''s learning journey with insights and AI coaching',
      features: ['Learning analytics', 'AI tips', 'Milestone tracking'],
      action: 'View Dashboard',
      onClick: onOpenParent
    }
  ]

  return (
    <div className="home-minimal">
      {/* What is Sign & Speak */}
      <section className="info-section">
        <motion.div 
          className="info-block"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="info-title">What is Sign & Speak?</h2>
          <p className="info-text">
            A browser-based platform that uses computer vision and machine learning to recognize hand signs in real-time. 
            All processing happens locally in your browser - no uploads, no servers, complete privacy.
          </p>
        </motion.div>

        <motion.div 
          className="info-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="info-card">
            <div className="info-icon"></div>
            <h3>ML-Powered Recognition</h3>
            <p>Uses machine learning to recognize Indian Sign Language characters and common gestures in real-time.</p>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <h3>Instant Feedback</h3>
            <p>See your signs recognized live as you practice. No waiting, no uploads - everything happens instantly.</p>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <h3>Gamified Learning</h3>
            <p>Earn stars, collect stickers, and unlock achievements. Learning made fun for all ages.</p>
          </div>
        </motion.div>
      </section>

      {/* Choose Your Path */}
      <section className="paths-section">
        <motion.h2 
          className="section-title-minimal"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Choose Your Path
        </motion.h2>

        <div className="paths-grid">
          {userPaths.map((path, idx) => (
            <motion.div
              key={path.id}
              className={`path-card ${hoveredCard === path.id ? 'hovered' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onHoverStart={() => setHoveredCard(path.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <div className="path-icon">{path.icon}</div>
              <h3 className="path-title">{path.title}</h3>
              <p className="path-desc">{path.desc}</p>
              
              <ul className="path-features">
                {path.features.map((feature, i) => (
                  <li key={i}> {feature}</li>
                ))}
              </ul>

              <motion.button 
                className="path-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={path.onClick}
              >
                {path.action} 
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <motion.h2 
          className="section-title-minimal"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>

        <motion.div 
          className="steps-container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Allow Camera Access</h3>
              <p>Grant permission for your browser to use your webcam. All processing stays local.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Practice Signs</h3>
              <p>Follow the on-screen guides and perform signs in front of your camera.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Get Instant Feedback</h3>
              <p>See real-time recognition results and earn rewards as you learn.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Technology Info */}
      <section className="tech-section">
        <motion.div 
          className="tech-info"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title-minimal">Built With Modern Technology</h2>
          <div className="tech-details">
            <div className="tech-item">
              <strong>MediaPipe Hands</strong>
              <span>Extracts hand landmarks for precise tracking and recognition</span>
            </div>
            <div className="tech-item">
              <strong>TensorFlow ML Model</strong>
              <span>Trained neural network for accurate sign language detection</span>
            </div>
            <div className="tech-item">
              <strong>Client-Side Processing</strong>
              <span>Everything runs in your browser for complete privacy</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

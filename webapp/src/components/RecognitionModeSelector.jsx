/**
 * Recognition Mode Selector
 * Allows users to choose between different hand gesture recognition modes
 */

import React from 'react';
import './RecognitionModeSelector.css';

const RECOGNITION_MODES = [
  {
    id: 'isl',
    name: 'Indian Sign Language',
    description: 'AI-powered ISL alphabet recognition (A-Z)',
    icon: '🇮🇳',
    requiresML: true,
    accuracy: '99.75%',
    status: 'available'
  },
  {
    id: 'asl',
    name: 'American Sign Language',
    description: 'ASL alphabet recognition (Coming Soon)',
    icon: '🇺🇸',
    requiresML: true,
    accuracy: 'N/A',
    status: 'coming-soon'
  },
  {
    id: 'gestures',
    name: 'Daily Gestures',
    description: 'Common hand gestures (thumbs up, peace, etc.)',
    icon: '👋',
    requiresML: false,
    accuracy: 'Rule-based',
    status: 'available'
  },
  {
    id: 'custom',
    name: 'Custom Signs',
    description: 'Create and train your own gestures',
    icon: '✨',
    requiresML: false,
    accuracy: 'User-defined',
    status: 'coming-soon'
  }
];

function RecognitionModeSelector({ 
  selectedMode, 
  currentMode,  // Support both prop names for compatibility
  onModeChange, 
  mlApiStatus,
  className = '' 
}) {
  // Use selectedMode if provided, fall back to currentMode
  const activeMode = selectedMode || currentMode;
  
  const handleModeClick = (mode) => {
    if (mode.status === 'coming-soon') {
      alert(`${mode.name} is coming soon! Stay tuned for updates.`);
      return;
    }
    
    if (mode.requiresML && !mlApiStatus?.online) {
      const startServer = window.confirm(
        `${mode.name} requires the ML prediction server.\n\n` +
        `The server appears to be offline. Would you like instructions to start it?`
      );
      
      if (startServer) {
        alert(
          'To start the ML server:\n\n' +
          '1. Open a terminal\n' +
          '2. cd ml_training\n' +
          '3. .\\start_api.bat\n\n' +
          'Then refresh this page.'
        );
      }
      return;
    }
    
    console.log('Switching to mode:', mode.id);
    onModeChange(mode.id);
  };
  
  return (
    <div className={`recognition-mode-selector ${className}`}>
      <div className="mode-selector-header">
        <h3>Recognition Mode</h3>
        {mlApiStatus && (
          <div className={`ml-status-badge ${mlApiStatus.online ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            ML Server: {mlApiStatus.online ? 'Online' : 'Offline'}
          </div>
        )}
      </div>
      
      <div className="mode-grid">
        {RECOGNITION_MODES.map((mode) => {
          const isActive = activeMode === mode.id;
          const isDisabled = mode.status === 'coming-soon' || 
                           (mode.requiresML && !mlApiStatus?.online);
          
          return (
            <button
              key={mode.id}
              className={`mode-card ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => handleModeClick(mode)}
              disabled={isDisabled}
              title={isDisabled ? 'Not available yet' : `Switch to ${mode.name}`}
            >
              <div className="mode-icon">{mode.icon}</div>
              <div className="mode-content">
                <div className="mode-name">{mode.name}</div>
                <div className="mode-description">{mode.description}</div>
                <div className="mode-meta">
                  <span className="mode-accuracy">{mode.accuracy}</span>
                  {mode.requiresML && (
                    <span className="mode-badge ml-badge">ML</span>
                  )}
                  {mode.status === 'coming-soon' && (
                    <span className="mode-badge coming-soon-badge">Soon</span>
                  )}
                </div>
              </div>
              {isActive && <div className="active-indicator">✓</div>}
            </button>
          );
        })}
      </div>
      
      <div className="mode-info">
        {activeMode === 'isl' && (
          <div className="info-box isl">
            <strong>🎯 ISL Mode Active</strong>
            <p>Using trained AI model with 99.75% accuracy. Show ISL alphabet signs (A-Z) to the camera.</p>
          </div>
        )}
        {activeMode === 'gestures' && (
          <div className="info-box gestures">
            <strong>👋 Gestures Mode Active</strong>
            <p>Recognizing common hand gestures: thumbs up, peace sign, OK sign, and more.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecognitionModeSelector;

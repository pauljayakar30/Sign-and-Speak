# 🔌 Integrating Recognition Modes with CameraPanel

## Overview
This guide shows how to update `CameraPanel.jsx` to support multiple recognition modes (ISL, ASL, Gestures, Custom).

---

## Step 1: Add Imports

Add these imports at the top of `CameraPanel.jsx`:

```javascript
import { useState, useEffect, useRef } from 'react';
import RecognitionModeSelector from './RecognitionModeSelector';
import { islApi } from '../services/islApi';
import { extractHandAngles, validateFeatures } from '../utils/handAngles';
```

---

## Step 2: Add State Variables

Add these state variables in your component:

```javascript
function CameraPanel() {
  // Existing state...
  
  // NEW: Recognition mode state
  const [recognitionMode, setRecognitionMode] = useState('gestures'); // 'isl', 'asl', 'gestures', 'custom'
  const [mlApiStatus, setMlApiStatus] = useState({ online: false, checking: true });
  const [mlPrediction, setMlPrediction] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  
  // Throttling for ML predictions
  const lastPredictionTime = useRef(0);
  const PREDICTION_INTERVAL = 500; // ms - predict every 500ms
  
  // ... rest of your component
}
```

---

## Step 3: Check ML API Status on Mount

Add this useEffect to check if the ML server is running:

```javascript
// Check ML API status on mount
useEffect(() => {
  async function checkMLAPI() {
    const status = await islApi.healthCheck();
    setMlApiStatus(status);
    
    if (!status.online) {
      console.warn('ML API is offline. ISL mode will not be available.');
      console.info('To start the ML server: cd ml_training && .\\start_api.bat');
    }
  }
  
  checkMLAPI();
  
  // Recheck every 30 seconds
  const interval = setInterval(checkMLAPI, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## Step 4: Create Unified Recognition Function

Replace or modify your existing recognition function:

```javascript
async function recognizeHandSign(results) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    setMlPrediction(null);
    return null;
  }
  
  const leftHand = results.multiHandedness[0]?.label === 'Left' 
    ? results.multiHandLandmarks[0] 
    : results.multiHandLandmarks[1];
    
  const rightHand = results.multiHandedness[0]?.label === 'Right' 
    ? results.multiHandLandmarks[0] 
    : results.multiHandLandmarks[1];
  
  let prediction = null;
  
  // Route to appropriate recognition method based on mode
  switch (recognitionMode) {
    case 'isl':
      prediction = await recognizeISL(leftHand, rightHand);
      break;
      
    case 'asl':
      // ASL recognition (coming soon)
      prediction = { sign: 'Coming Soon', confidence: 0, mode: 'asl' };
      break;
      
    case 'gestures':
      prediction = recognizeDailyGestures(leftHand, rightHand);
      break;
      
    case 'custom':
      // Custom gestures (coming soon)
      prediction = { sign: 'Coming Soon', confidence: 0, mode: 'custom' };
      break;
      
    default:
      prediction = null;
  }
  
  if (prediction) {
    setMlPrediction(prediction);
    
    // Add to history
    setPredictionHistory(prev => {
      const newHistory = [prediction, ...prev].slice(0, 10); // Keep last 10
      return newHistory;
    });
  }
  
  return prediction;
}
```

---

## Step 5: Add ISL Recognition Function

Add this function for ML-powered ISL recognition:

```javascript
async function recognizeISL(leftHand, rightHand) {
  // Throttle predictions to avoid overwhelming the API
  const now = Date.now();
  if (now - lastPredictionTime.current < PREDICTION_INTERVAL) {
    return null; // Skip this frame
  }
  
  if (!mlApiStatus?.online) {
    console.warn('ML API offline - cannot recognize ISL');
    return {
      sign: 'ML Offline',
      confidence: 0,
      mode: 'isl',
      error: 'ML server not running'
    };
  }
  
  try {
    // Extract hand angles
    const features = extractHandAngles(leftHand, rightHand);
    
    // Validate features
    if (!validateFeatures(features)) {
      console.error('Invalid features extracted');
      return null;
    }
    
    // Get prediction from ML API
    const result = await islApi.predict(features);
    
    lastPredictionTime.current = now;
    
    if (result.success) {
      return {
        sign: result.predicted_sign,
        confidence: result.confidence,
        mode: 'isl',
        allPredictions: result.all_predictions?.slice(0, 3) // Top 3
      };
    } else {
      console.error('ML prediction failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('ISL recognition error:', error);
    return null;
  }
}
```

---

## Step 6: Add Daily Gestures Recognition (Rule-based)

Keep your existing rule-based recognition:

```javascript
function recognizeDailyGestures(leftHand, rightHand) {
  // Use your existing rule-based recognition logic
  // Example gestures: thumbs up, peace sign, OK sign, etc.
  
  const landmarks = leftHand || rightHand;
  if (!landmarks) return null;
  
  // Example: Thumbs up detection
  const thumb = landmarks[4];
  const index = landmarks[8];
  
  if (thumb.y < index.y) {
    return {
      sign: '👍 Thumbs Up',
      confidence: 0.9,
      mode: 'gestures'
    };
  }
  
  // Add more gesture detections...
  
  return null;
}
```

---

## Step 7: Update Your Render/JSX

Add the mode selector and prediction display to your JSX:

```jsx
return (
  <div className="camera-panel">
    {/* Recognition Mode Selector */}
    <RecognitionModeSelector
      currentMode={recognitionMode}
      onModeChange={setRecognitionMode}
      mlApiStatus={mlApiStatus}
      className="mode-selector-panel"
    />
    
    {/* Prediction Display */}
    {mlPrediction && (
      <div className="prediction-display">
        <div className="current-prediction">
          <h2>{mlPrediction.sign}</h2>
          <div className="confidence-bar">
            <div 
              className="confidence-fill"
              style={{ width: `${mlPrediction.confidence * 100}%` }}
            />
          </div>
          <p>{(mlPrediction.confidence * 100).toFixed(1)}% confident</p>
        </div>
        
        {/* Top predictions (for ISL mode) */}
        {mlPrediction.allPredictions && (
          <div className="top-predictions">
            <h4>Top Predictions:</h4>
            <ul>
              {mlPrediction.allPredictions.map((pred, i) => (
                <li key={i}>
                  {pred.sign}: {(pred.confidence * 100).toFixed(1)}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
    
    {/* Your existing video/canvas elements */}
    <video ref={videoRef} />
    <canvas ref={canvasRef} />
    
    {/* Prediction History */}
    <div className="prediction-history">
      <h4>Recent Predictions:</h4>
      <div className="history-list">
        {predictionHistory.slice(0, 5).map((pred, i) => (
          <span key={i} className="history-item">
            {pred.sign}
          </span>
        ))}
      </div>
    </div>
  </div>
);
```

---

## Step 8: Add CSS Styles

Add these styles to your CameraPanel CSS file:

```css
/* Mode Selector Panel */
.mode-selector-panel {
  margin-bottom: 24px;
}

/* Prediction Display */
.prediction-display {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.current-prediction h2 {
  font-size: 3rem;
  margin: 0 0 12px 0;
  color: #6366f1;
  text-align: center;
}

.confidence-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #6366f1);
  transition: width 0.3s ease;
}

.current-prediction p {
  text-align: center;
  color: #6b7280;
  margin: 0;
}

.top-predictions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.top-predictions h4 {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.top-predictions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.top-predictions li {
  padding: 4px 0;
  font-size: 0.875rem;
  color: #4b5563;
}

/* Prediction History */
.prediction-history {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.prediction-history h4 {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.history-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.history-item {
  padding: 6px 12px;
  background: white;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

---

## Complete Flow

1. **User selects recognition mode** → `RecognitionModeSelector`
2. **Mode change updates state** → `setRecognitionMode('isl')`
3. **Camera detects hands** → MediaPipe `onResults`
4. **Recognition function called** → `recognizeHandSign(results)`
5. **Routes to appropriate recognizer** → `recognizeISL()` or `recognizeDailyGestures()`
6. **For ISL mode:**
   - Extract angles → `extractHandAngles()`
   - Call ML API → `islApi.predict(features)`
   - Display result → `setMlPrediction()`
7. **For Gestures mode:**
   - Use rule-based detection
   - No ML API needed

---

## Testing Checklist

- [ ] ML API server is running (port 5000)
- [ ] Mode selector displays correctly
- [ ] Can switch between modes
- [ ] ISL mode shows "offline" if API not running
- [ ] ISL predictions appear when showing signs
- [ ] Confidence bars update smoothly
- [ ] Gestures mode works without ML server
- [ ] Prediction history shows recent signs
- [ ] Top predictions list appears in ISL mode

---

## Troubleshooting

**"ML Offline" error:**
- Start the ML server: `cd ml_training && .\\start_api.bat`
- Check http://localhost:5000/health in browser

**No predictions appearing:**
- Check browser console for errors
- Verify hands are detected (MediaPipe working)
- Ensure mode selector shows correct mode

**Low accuracy:**
- Make sure lighting is good
- Hold hand steady for 500ms
- Try adjusting camera distance

---

## Next Steps

1. Test ISL mode with actual signs
2. Implement ASL support (train new model)
3. Add more daily gestures
4. Create custom gesture trainer
5. Add gesture recording/playback
6. Implement prediction confidence threshold

---

Need help? Check:
- `ml_training/README.md` - ML API documentation
- `NEXT-STEPS.md` - Integration guide
- Browser console - Error messages

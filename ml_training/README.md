# ISL Model Training & Deployment

## 🎉 What We've Built

Successfully trained an **Indian Sign Language (ISL) recognition model** with:
- **99.86%** training accuracy
- **99.75%** validation accuracy  
- **31,928 samples** across **26 ISL characters** (A-Z)
- **Flask REST API** for real-time predictions running on **http://localhost:5000**

---

## 📁 Project Structure

```
ml_training/
├── isl_env/                          # Python virtual environment
├── models/
│   └── isl_angles_model/
│       ├── model.keras               # Trained model (191 KB) ✅
│       ├── saved_model/              # TensorFlow SavedModel format
│       ├── labels.json               # 26 ISL characters
│       ├── features.json             # 17 hand angle features
│       ├── scaler.json               # Feature normalization params
│       ├── training_history.png      # Training metrics graph
│       └── confusion_matrix.png      # Model performance visualization
├── hand_angles_datasets.csv          # Training dataset (31,928 samples)
├── train_hand_angles.py              # Training script
├── prediction_api.py                 # Flask REST API ⭐
├── test_api.py                       # API testing script
├── start_api.bat                     # Quick start script (Windows)
└── requirements.txt                  # Python dependencies
```

---

## 🚀 Quick Start Guide

### 1. Start the Prediction API

**Option A: Using batch script (Windows)**
```batch
cd ml_training
start_api.bat
```

**Option B: Manual start**
```bash
cd ml_training
.\isl_env\Scripts\Activate.ps1   # Windows PowerShell
# OR
source isl_env/bin/activate       # Linux/Mac

python prediction_api.py
```

The API will start on **http://localhost:5000** ✅

### 2. Test the API

In a new terminal:
```bash
cd ml_training
.\isl_env\Scripts\Activate.ps1
python test_api.py
```

This will:
- ✅ Check folder structure
- ✅ Count images per class
- ✅ Test MediaPipe landmark extraction
- ✅ Save sample annotated images

### 4. Train the Model

```bash
python train_isl_model.py --dataset_path ./isl_dataset --epochs 50
```

**Training Options:**
- `--epochs 50` - Number of training iterations (default: 50)
- `--batch_size 32` - Batch size (default: 32)
- `--test_size 0.2` - Validation split (default: 20%)
- `--output_dir ./models/isl_model` - Where to save model

### 5. Convert to TensorFlow.js

After training completes, convert the model:

```bash
tensorflowjs_converter \
  --input_format=tf_saved_model \
  ./models/isl_model/saved_model \
  ./models/isl_model/tfjs_model
```

### 6. Deploy to App

Copy the trained model to your webapp:

```bash
# Create models directory in webapp
mkdir -p ../webapp/public/models

# Copy TensorFlow.js model
cp -r ./models/isl_model/tfjs_model ../webapp/public/models/isl_model
cp ./models/isl_model/labels.json ../webapp/public/models/isl_model/
```

## 📊 What Gets Created

After training, you'll have:

```
models/isl_model/
├── saved_model/              # TensorFlow SavedModel format
├── tfjs_model/               # TensorFlow.js format (after conversion)
│   ├── model.json
│   ├── group1-shard1of1.bin
│   └── ...
├── labels.json               # Sign/character labels
└── training_history.png      # Training metrics visualization
```

## 🎓 Training Tips

### For Best Results:

1. **Dataset Size**: 100+ images per sign/character (more is better)
2. **Variety**: Different people, lighting, angles, backgrounds
3. **Quality**: Clear, well-lit images with visible hands
4. **Balance**: Similar number of images per class

### If Training Fails:

**Low accuracy (<70%)**:
- Add more training images
- Ensure images have clear hand gestures
- Check for mislabeled data

**Model overfits**:
- Increase dropout rate (edit `train_isl_model.py`)
- Add more data augmentation
- Use early stopping (already enabled)

**Out of memory**:
- Reduce `--batch_size` (try 16 or 8)
- Use smaller images
- Train on GPU if available

---

## � API Endpoints

### 🔍 Health Check
```http
GET http://localhost:5000/health
```
Returns API status and model info.

### 🏷️ Get All Labels
```http
GET http://localhost:5000/api/labels
```
Returns all 26 ISL characters (A-Z).

### 📋 Get Required Features
```http
GET http://localhost:5000/api/features
```
Returns the 17 hand angle features needed for prediction.

### 🎯 Make Prediction
```http
POST http://localhost:5000/api/predict
Content-Type: application/json

{
  "features": {
    "both_hands": 1,
    "thumb_Left": 45.2,
    "index_finger_Left": 90.1,
    "middle_finger_Left": 85.3,
    "ring_finger_Left": 80.5,
    "pinky_Left": 75.8,
    "palm_angle_Left_left": 120.0,
    "palm_angle_Left_right": 60.0,
    "hand_Left_ground_angle": 15.5,
    "thumb_Right": 42.8,
    "index_finger_Right": 88.9,
    "middle_finger_Right": 83.2,
    "ring_finger_Right": 79.1,
    "pinky_Right": 74.6,
    "palm_angle_Right_left": 118.5,
    "palm_angle_Right_right": 61.2,
    "hand_Right_ground_angle": 14.8
  }
}
```

**Response:**
```json
{
  "predicted_sign": "A",
  "confidence": 0.985,
  "all_predictions": [
    {"sign": "A", "confidence": 0.985},
    {"sign": "B", "confidence": 0.012}
  ]
}
```

---

## 🔗 Integration with React Frontend

### Step 1: Create API Service

Create `webapp/src/services/islApi.js`:

```javascript
const API_URL = 'http://localhost:5000';

export const islApi = {
  async predict(features) {
    const response = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    return response.json();
  },
  
  async getLabels() {
    const response = await fetch(`${API_URL}/api/labels`);
    return response.json();
  },
  
  async healthCheck() {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
  }
};
```

### Step 2: Extract Hand Angles in CameraPanel.jsx

```javascript
import { islApi } from '../services/islApi';

// Calculate angles from MediaPipe hand landmarks
function calculateHandAngles(leftHand, rightHand) {
  const features = {
    both_hands: (leftHand && rightHand) ? 1 : 0,
  };
  
  if (leftHand) {
    // Calculate finger angles using landmarks
    features.thumb_Left = calculateFingerAngle(leftHand, [0, 1, 2, 3, 4]);
    features.index_finger_Left = calculateFingerAngle(leftHand, [0, 5, 6, 7, 8]);
    features.middle_finger_Left = calculateFingerAngle(leftHand, [0, 9, 10, 11, 12]);
    features.ring_finger_Left = calculateFingerAngle(leftHand, [0, 13, 14, 15, 16]);
    features.pinky_Left = calculateFingerAngle(leftHand, [0, 17, 18, 19, 20]);
    // Add palm and ground angles...
  }
  
  // Same for right hand...
  
  return features;
}

// In your detection loop
const angles = calculateHandAngles(leftHand, rightHand);
const prediction = await islApi.predict(angles);
console.log(`Detected: ${prediction.predicted_sign} (${prediction.confidence * 100}%)`);
```

---

## 🎯 Model Architecture

```
Input Layer (17 features)
    ↓
BatchNormalization
    ↓
Dense(256, ReLU) + Dropout(0.3)
    ↓
BatchNormalization
    ↓
Dense(128, ReLU) + Dropout(0.3)
    ↓
BatchNormalization
    ↓
Dense(64, ReLU) + Dropout(0.3)
    ↓
Dense(26, Softmax) → Output (A-Z)
```

**Total Parameters:** 49,054 (191.62 KB)

---

## 📊 Training Results

- **Training Accuracy:** 99.86%
- **Validation Accuracy:** 99.75%
- **Training Loss:** 0.0039
- **Validation Loss:** 0.0126
- **Epochs:** 90 (early stopping)
- **Dataset:** 31,928 samples

---

## 🔧 Retraining the Model

```bash
python train_hand_angles.py --dataset hand_angles_datasets.csv --epochs 100 --batch_size 64
```

**Arguments:**
- `--dataset`: Path to CSV file
- `--epochs`: Training epochs (default: 100)
- `--batch_size`: Batch size (default: 64)
- `--learning_rate`: Initial LR (default: 0.001)

---

## 🐛 Troubleshooting

### API won't start
- Activate virtual environment first
- Check port 5000 isn't in use
- Run: `pip install -r requirements.txt`

### Connection errors
- Verify API: http://localhost:5000/health
- Check firewall settings
- Ensure CORS enabled

### Poor predictions
- Verify 17 features in correct order
- Check angle values (0-180°)
- Validate hand landmarks

---

## 🚀 Next Steps

1. ✅ **Model Trained** (99.75% accuracy)
2. ✅ **API Running** (http://localhost:5000)
3. ⏳ **Test API** with `test_api.py`
4. ⏳ **Integrate with CameraPanel.jsx**
5. ⏳ **Add UI feedback** for predictions
6. ⏳ **Deploy to production**

---

## 📚 Additional Resources

- [TensorFlow Documentation](https://www.tensorflow.org/)
- [Flask REST API](https://flask.palletsprojects.com/)
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- Hands might be too small in frame
- Try adjusting MediaPipe confidence threshold

**"Module not found"**
- Activate virtual environment
- Run `pip install -r requirements.txt` again

## 🎯 Next Steps

Once trained and deployed:
1. Test with real-time camera in the app
2. Monitor accuracy and collect feedback
3. Retrain with more data if needed
4. Fine-tune model parameters

Need help? Check the [ISL Training Guide](../docs/ISL-TRAINING-GUIDE.md) or ask for assistance!

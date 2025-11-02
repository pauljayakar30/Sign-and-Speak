# 🚀 Quick Start: Train Your ISL Model

Your ISL dataset (`hand_angles_datasets.csv`) is ready to train! It contains **31,928 samples** with pre-computed hand angle features.

## ⚡ Fast Track (3 Commands)

```powershell
# 1. Install dependencies
cd ml_training
pip install -r requirements.txt

# 2. Train the model (takes 5-10 minutes)
python train_hand_angles.py --dataset hand_angles_datasets.csv --epochs 100

# 3. Convert to TensorFlow.js
tensorflowjs_converter --input_format=tf_saved_model models/isl_angles_model/saved_model models/isl_angles_model/tfjs_model
```

## 📊 Your Dataset

- **Format**: CSV with pre-computed hand angle features
- **Samples**: 31,928 total
- **Features**: 17 columns (hand angles for both hands)
- **Labels**: ISL characters/signs in the first column

### Features Included:
- `both_hands`: Whether both hands are used
- `thumb_Left`, `index_finger_Left`, `middle_finger_Left`, etc.
- `palm_angle_Left_left`, `palm_angle_Left_right`
- `hand_Left_ground_angle`
- Same features for right hand

## 🎯 Training Process

### Step 1: Install Python Environment

```powershell
# Create virtual environment
python -m venv isl_env

# Activate (Windows PowerShell)
isl_env\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

### Step 2: Train the Model

```powershell
python train_hand_angles.py --dataset hand_angles_datasets.csv --epochs 100 --batch_size 64
```

**What happens:**
1. ✅ Loads 31,928 samples from CSV
2. ✅ Standardizes features (mean=0, std=1)
3. ✅ Splits into 80% training, 20% validation
4. ✅ Trains neural network (256→128→64 neurons)
5. ✅ Saves model, labels, and training graphs

**Expected time**: 5-10 minutes on CPU, 1-2 minutes on GPU

**Expected accuracy**: 
- Training: 95-98%
- Validation: 90-95%

### Step 3: Convert to TensorFlow.js

```powershell
tensorflowjs_converter \
  --input_format=tf_saved_model \
  models/isl_angles_model/saved_model \
  models/isl_angles_model/tfjs_model
```

### Step 4: Deploy to Webapp

```powershell
# Create models directory
mkdir ..\webapp\public\models\isl

# Copy model files
xcopy /E /I models\isl_angles_model\tfjs_model ..\webapp\public\models\isl
copy models\isl_angles_model\labels.json ..\webapp\public\models\isl\
copy models\isl_angles_model\features.json ..\webapp\public\models\isl\
copy models\isl_angles_model\scaler.json ..\webapp\public\models\isl\
```

## 📈 What You'll Get

After training completes, you'll have:

```
models/isl_angles_model/
├── saved_model/                  # TensorFlow model
├── tfjs_model/                   # For web browser
│   ├── model.json
│   └── group1-shard1of1.bin
├── labels.json                   # ISL character labels
├── features.json                 # Feature names
├── scaler.json                   # Normalization parameters
├── training_history.png          # Accuracy/loss graphs
└── confusion_matrix.png          # Prediction visualization
```

## 🎓 Training Options

### Quick Test (Fast, Lower Accuracy)
```powershell
python train_hand_angles.py --dataset hand_angles_datasets.csv --epochs 30
```

### Balanced (Recommended)
```powershell
python train_hand_angles.py --dataset hand_angles_datasets.csv --epochs 100
```

### High Accuracy (Longer Training)
```powershell
python train_hand_angles.py --dataset hand_angles_datasets.csv --epochs 200 --batch_size 32
```

## 🔧 Integration with App

After deploying the model, the app will automatically:
1. Load the TensorFlow.js model on startup
2. Extract hand angle features from MediaPipe landmarks
3. Normalize features using saved scaler
4. Predict ISL character in real-time
5. Display result with confidence score

No code changes needed - the model integrates automatically!

## 📊 Monitor Training

Watch the training progress in real-time:
```
Epoch 1/100
████████████████ 25536/25536 - 12s - loss: 0.3456 - accuracy: 0.9234 - val_loss: 0.2134 - val_accuracy: 0.9456
Epoch 2/100
████████████████ 25536/25536 - 10s - loss: 0.1789 - accuracy: 0.9567 - val_loss: 0.1456 - val_accuracy: 0.9589
...
```

## ✅ Verification

After training, check the outputs:

1. **Training History Graph**: Shows accuracy improving over epochs
2. **Confusion Matrix**: Shows which signs are confused with each other
3. **Final Accuracy**: Should be >90% on validation set

## 🐛 Troubleshooting

**"ModuleNotFoundError: No module named 'tensorflow'"**
- Make sure you activated the virtual environment
- Run `pip install -r requirements.txt` again

**Low accuracy (<80%)**
- Increase epochs to 200
- Check for class imbalance in dataset
- Try different batch sizes

**Out of memory**
- Reduce `--batch_size` to 32 or 16
- Close other applications

**Training too slow**
- Use GPU if available (automatically detected)
- Reduce epochs for quick test

## 🎉 Next Steps

Once trained:
1. The model will recognize ISL signs in real-time
2. Users can practice ISL characters
3. App shows confidence scores
4. Tracks learning progress

**Start training now!** Your dataset is perfect for this. 🚀

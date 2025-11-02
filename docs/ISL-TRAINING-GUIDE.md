# ISL Dataset Training Guide

This guide explains how to train a custom Indian Sign Language model using your local dataset and integrate it with Sign & Speak.

## 📋 Overview

The current system uses **rule-based gesture recognition**. We'll add a **machine learning model** trained on your ISL dataset to improve accuracy for Indian Sign Language.

## 🎯 Architecture

```
Your ISL Dataset → Training Script → TensorFlow.js Model → Sign & Speak App
```

## 📁 Expected Dataset Structure

Your ISL dataset should be organized like this:

```
ISL_Dataset/
├── A/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── B/
│   ├── image1.jpg
│   └── ...
├── C/
└── ... (for each character/sign)
```

Or with MediaPipe landmark data:
```
ISL_Dataset/
├── train/
│   ├── A.json    # Array of landmark coordinates
│   ├── B.json
│   └── ...
└── test/
    ├── A.json
    └── ...
```

## 🚀 Setup Instructions

### Step 1: Install Python Dependencies

Create a Python environment for training:

```bash
# Create virtual environment
python -m venv isl_env

# Activate (Windows)
isl_env\Scripts\activate

# Install dependencies
pip install tensorflow opencv-python mediapipe numpy pillow scikit-learn matplotlib
```

### Step 2: Prepare Training Script

I'll create a Python script that:
1. Loads your ISL dataset
2. Extracts MediaPipe hand landmarks from images
3. Trains a neural network
4. Exports to TensorFlow.js format

### Step 3: Place Your Dataset

Copy your ISL dataset to:
```
Sign-and-Speak/
└── ml_training/
    └── isl_dataset/
        ├── A/
        ├── B/
        └── ...
```

## 🎓 Training Options

### Option 1: Image-Based Training (Recommended)
- Uses your ISL images directly
- Extracts MediaPipe landmarks automatically
- Works with existing dataset structure

### Option 2: Landmark-Based Training (Faster)
- Pre-extracted landmark coordinates
- Faster training
- Requires preprocessing

### Option 3: Transfer Learning
- Fine-tune existing model
- Requires less data
- Better for small datasets

## 📊 Model Architecture

We'll use a simple but effective architecture:

```python
Input: 21 landmarks × 3 coordinates (x, y, z) = 63 features
↓
Dense(128) + ReLU + Dropout(0.3)
↓
Dense(64) + ReLU + Dropout(0.3)
↓
Dense(num_classes) + Softmax
↓
Output: Probability for each ISL character
```

## 🔧 Integration Steps

1. **Train the model** using the provided script
2. **Convert to TensorFlow.js** format
3. **Copy model files** to `webapp/public/models/`
4. **Update CameraPanel.jsx** to use the trained model
5. **Test** with real-time camera input

## 📝 Next Steps

Let me know:
1. What format is your ISL dataset in? (images, videos, landmarks)
2. How many signs/characters does it contain?
3. What's the approximate size of the dataset?

I'll then create the specific training script and integration code for your setup!

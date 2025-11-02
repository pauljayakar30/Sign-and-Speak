"""
Flask API for ISL Hand Sign Recognition
Serves predictions from the trained TensorFlow model
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import json
import os
from pathlib import Path

app = Flask(__name__)

# Configure CORS for both development and production
allowed_origins = [
    'http://localhost:5173',  # Local development
    'http://localhost:3000',  # Alternative local port
    'https://*.vercel.app',   # Vercel deployments
]

# Add production domain from environment variable if set
if os.environ.get('FRONTEND_URL'):
    allowed_origins.append(os.environ.get('FRONTEND_URL'))

CORS(app, origins=allowed_origins, supports_credentials=True)

# Load model and metadata on startup
MODEL_DIR = Path('models/isl_angles_model')
model = None
labels = None
feature_names = None
scaler = None

def load_model_and_metadata():
    """Load the trained model and associated metadata"""
    global model, labels, feature_names, scaler
    
    print("=" * 70)
    print("🔄 Loading ISL model...")
    print("=" * 70)
    
    # Load model
    model_path = MODEL_DIR / 'model.keras'
    print(f"📂 Model path: {model_path}")
    model = tf.keras.models.load_model(model_path)
    print(f"✓ Model loaded successfully")
    
    # Load labels
    with open(MODEL_DIR / 'labels.json', 'r') as f:
        label_data = json.load(f)
        labels = label_data['labels']
    print(f"✓ Loaded {len(labels)} labels")
    
    # Load feature names
    with open(MODEL_DIR / 'features.json', 'r') as f:
        feature_data = json.load(f)
        feature_names = feature_data['feature_names']
    print(f"✓ Loaded {len(feature_names)} features")
    
    # Load scaler parameters
    with open(MODEL_DIR / 'scaler.json', 'r') as f:
        scaler = json.load(f)
    print("✓ Loaded scaler parameters")
    
    print("=" * 70)
    print("🚀 ISL Recognition API Ready!")
    print("=" * 70)

# Load model when module is imported (for gunicorn --preload)
print("🌐 Initializing Flask app...")
load_model_and_metadata()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'num_classes': len(labels) if labels else 0
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict ISL sign from hand angle features
    
    Expects JSON body:
    {
        "features": {
            "both_hands": 1,
            "thumb_Left": 45.2,
            "index_finger_Left": 90.1,
            ... (17 features total)
        }
    }
    
    Returns:
    {
        "predicted_sign": "A",
        "confidence": 0.985,
        "all_predictions": [
            {"sign": "A", "confidence": 0.985},
            {"sign": "B", "confidence": 0.012},
            ...
        ]
    }
    """
    try:
        data = request.json
        
        if 'features' not in data:
            return jsonify({'error': 'Missing features in request'}), 400
        
        features_dict = data['features']
        
        # Validate features
        if len(features_dict) != len(feature_names):
            return jsonify({
                'error': f'Expected {len(feature_names)} features, got {len(features_dict)}'
            }), 400
        
        # Extract features in correct order
        feature_vector = []
        for feature_name in feature_names:
            if feature_name not in features_dict:
                return jsonify({'error': f'Missing feature: {feature_name}'}), 400
            feature_vector.append(features_dict[feature_name])
        
        # Convert to numpy array and standardize
        X = np.array([feature_vector], dtype=np.float32)
        X_scaled = (X - np.array(scaler['mean'])) / np.array(scaler['scale'])
        
        # Make prediction
        predictions = model.predict(X_scaled, verbose=0)[0]
        
        # Get top prediction
        predicted_idx = np.argmax(predictions)
        predicted_sign = labels[predicted_idx]
        confidence = float(predictions[predicted_idx])
        
        # Get all predictions sorted by confidence
        all_predictions = [
            {'sign': labels[i], 'confidence': float(predictions[i])}
            for i in range(len(labels))
        ]
        all_predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return jsonify({
            'predicted_sign': predicted_sign,
            'confidence': confidence,
            'all_predictions': all_predictions[:5]  # Top 5
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/labels', methods=['GET'])
def get_labels():
    """Get all available sign labels"""
    return jsonify({
        'labels': labels,
        'num_classes': len(labels)
    })

@app.route('/api/features', methods=['GET'])
def get_features():
    """Get required feature names"""
    return jsonify({
        'features': feature_names,
        'num_features': len(feature_names)
    })

if __name__ == '__main__':
    load_model_and_metadata()
    
    # Run server
    port = 5000
    print(f"\n🌐 Starting server on http://localhost:{port}")
    print("   POST /api/predict - Get sign prediction")
    print("   GET  /api/labels  - Get all sign labels")
    print("   GET  /api/features - Get feature names")
    print("   GET  /health      - Health check")
    print()
    
    app.run(host='0.0.0.0', port=port, debug=True)

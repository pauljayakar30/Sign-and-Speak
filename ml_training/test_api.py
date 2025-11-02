"""
Test the ISL Prediction API
Send sample hand angle data and verify predictions
"""

import requests
import json

API_URL = "http://localhost:5000"

def test_health():
    """Test the health check endpoint"""
    print("=" * 70)
    print("Testing Health Endpoint")
    print("=" * 70)
    
    response = requests.get(f"{API_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")

def test_labels():
    """Test getting all labels"""
    print("=" * 70)
    print("Testing Labels Endpoint")
    print("=" * 70)
    
    response = requests.get(f"{API_URL}/api/labels")
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Available signs: {', '.join(data['labels'])}")
    print(f"Total: {data['num_classes']} signs\n")

def test_features():
    """Test getting feature names"""
    print("=" * 70)
    print("Testing Features Endpoint")
    print("=" * 70)
    
    response = requests.get(f"{API_URL}/api/features")
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Required features ({data['num_features']}):")
    for feature in data['features']:
        print(f"  - {feature}")
    print()

def test_prediction():
    """Test making a prediction with sample data"""
    print("=" * 70)
    print("Testing Prediction Endpoint")
    print("=" * 70)
    
    # Sample hand angles (these are made up - replace with real data)
    sample_features = {
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
    
    payload = {"features": sample_features}
    
    response = requests.post(f"{API_URL}/api/predict", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Prediction successful!")
        print(f"\n🎯 Predicted Sign: {data['predicted_sign']}")
        print(f"   Confidence: {data['confidence']*100:.2f}%")
        print(f"\nTop 5 predictions:")
        for i, pred in enumerate(data['all_predictions'][:5], 1):
            print(f"  {i}. {pred['sign']}: {pred['confidence']*100:.2f}%")
    else:
        print(f"❌ Prediction failed!")
        print(f"Status: {response.status_code}")
        print(f"Error: {response.json()}")
    print()

if __name__ == '__main__':
    print("\n🧪 Testing ISL Prediction API\n")
    
    try:
        test_health()
        test_labels()
        test_features()
        test_prediction()
        
        print("=" * 70)
        print("✅ All tests completed!")
        print("=" * 70)
        print("\nNext: Integrate with CameraPanel.jsx to send real hand landmark data")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to API server")
        print("Make sure the prediction_api.py is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {e}")

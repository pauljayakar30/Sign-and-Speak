"""
ISL Dataset Training Script - Image-Based Approach
Trains a hand sign classifier using MediaPipe landmarks extracted from images

Usage:
    python train_isl_model.py --dataset_path ./isl_dataset --output_dir ./models

Author: Sign & Speak Team
"""

import os
import json
import numpy as np
import cv2
import mediapipe as mp
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
import argparse

# MediaPipe initialization
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5
)

def extract_landmarks_from_image(image_path):
    """
    Extract MediaPipe hand landmarks from an image
    
    Returns:
        numpy array of shape (63,) representing 21 landmarks × 3 coordinates (x, y, z)
        or None if no hand detected
    """
    image = cv2.imread(str(image_path))
    if image is None:
        print(f"Warning: Could not read image {image_path}")
        return None
    
    # Convert BGR to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Process with MediaPipe
    results = hands.process(image_rgb)
    
    if not results.multi_hand_landmarks:
        return None
    
    # Extract first hand's landmarks
    hand_landmarks = results.multi_hand_landmarks[0]
    
    # Flatten landmarks to 1D array
    landmarks = []
    for landmark in hand_landmarks.landmark:
        landmarks.extend([landmark.x, landmark.y, landmark.z])
    
    return np.array(landmarks)

def load_dataset_from_images(dataset_path):
    """
    Load ISL dataset from folder structure:
    dataset_path/
        A/
            image1.jpg
            image2.jpg
        B/
            image1.jpg
        ...
    
    Returns:
        X: numpy array of landmarks (n_samples, 63)
        y: numpy array of labels (n_samples,)
        label_names: list of label names
    """
    dataset_path = Path(dataset_path)
    
    X = []
    y = []
    label_names = []
    
    # Get all class folders
    class_folders = sorted([f for f in dataset_path.iterdir() if f.is_dir()])
    
    if not class_folders:
        raise ValueError(f"No class folders found in {dataset_path}")
    
    print(f"Found {len(class_folders)} classes: {[f.name for f in class_folders]}")
    
    for class_idx, class_folder in enumerate(class_folders):
        class_name = class_folder.name
        label_names.append(class_name)
        
        # Get all images in this class
        image_files = list(class_folder.glob('*.jpg')) + \
                     list(class_folder.glob('*.jpeg')) + \
                     list(class_folder.glob('*.png'))
        
        print(f"Processing class '{class_name}': {len(image_files)} images...")
        
        successful = 0
        for img_path in image_files:
            landmarks = extract_landmarks_from_image(img_path)
            if landmarks is not None:
                X.append(landmarks)
                y.append(class_idx)
                successful += 1
        
        print(f"  ✓ Successfully extracted landmarks from {successful}/{len(image_files)} images")
    
    X = np.array(X)
    y = np.array(y)
    
    print(f"\nDataset loaded:")
    print(f"  Total samples: {len(X)}")
    print(f"  Features per sample: {X.shape[1]}")
    print(f"  Number of classes: {len(label_names)}")
    
    return X, y, label_names

def create_model(num_classes, input_shape=(63,)):
    """
    Create a neural network for ISL classification
    """
    model = keras.Sequential([
        keras.layers.Input(shape=input_shape),
        
        # Normalize input
        keras.layers.BatchNormalization(),
        
        # First hidden layer
        keras.layers.Dense(128, activation='relu'),
        keras.layers.Dropout(0.3),
        
        # Second hidden layer
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.3),
        
        # Third hidden layer
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dropout(0.2),
        
        # Output layer
        keras.layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def plot_training_history(history, output_dir):
    """
    Plot training and validation metrics
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    
    # Accuracy plot
    ax1.plot(history.history['accuracy'], label='Training Accuracy')
    ax1.plot(history.history['val_accuracy'], label='Validation Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.set_title('Model Accuracy')
    ax1.legend()
    ax1.grid(True)
    
    # Loss plot
    ax2.plot(history.history['loss'], label='Training Loss')
    ax2.plot(history.history['val_loss'], label='Validation Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.set_title('Model Loss')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'training_history.png'))
    print(f"Training history saved to {output_dir}/training_history.png")

def save_model_for_tfjs(model, label_names, output_dir):
    """
    Save model in TensorFlow.js format
    """
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Save model in TensorFlow SavedModel format first
    saved_model_path = os.path.join(output_dir, 'saved_model')
    model.save(saved_model_path)
    print(f"Model saved to {saved_model_path}")
    
    # Save label mapping
    label_map_path = os.path.join(output_dir, 'labels.json')
    with open(label_map_path, 'w') as f:
        json.dump({
            'labels': label_names,
            'num_classes': len(label_names)
        }, f, indent=2)
    print(f"Label mapping saved to {label_map_path}")
    
    print("\n" + "="*60)
    print("To convert to TensorFlow.js format, run:")
    print(f"tensorflowjs_converter --input_format=tf_saved_model {saved_model_path} {output_dir}/tfjs_model")
    print("="*60)

def main():
    parser = argparse.ArgumentParser(description='Train ISL hand sign classifier')
    parser.add_argument('--dataset_path', type=str, required=True,
                       help='Path to ISL dataset folder')
    parser.add_argument('--output_dir', type=str, default='./models/isl_model',
                       help='Output directory for trained model')
    parser.add_argument('--epochs', type=int, default=50,
                       help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=32,
                       help='Batch size for training')
    parser.add_argument('--test_size', type=float, default=0.2,
                       help='Fraction of data to use for validation')
    
    args = parser.parse_args()
    
    print("="*60)
    print("ISL Hand Sign Classifier Training")
    print("="*60)
    
    # Load dataset
    print("\n[1/5] Loading dataset...")
    X, y, label_names = load_dataset_from_images(args.dataset_path)
    
    if len(X) == 0:
        print("Error: No valid samples found!")
        return
    
    # Split into train/validation
    print("\n[2/5] Splitting dataset...")
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=args.test_size, random_state=42, stratify=y
    )
    
    print(f"  Training samples: {len(X_train)}")
    print(f"  Validation samples: {len(X_val)}")
    
    # Create model
    print("\n[3/5] Creating model...")
    model = create_model(num_classes=len(label_names))
    model.summary()
    
    # Train model
    print("\n[4/5] Training model...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=[
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5
            )
        ]
    )
    
    # Evaluate
    print("\n[5/5] Evaluating model...")
    train_loss, train_acc = model.evaluate(X_train, y_train, verbose=0)
    val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
    
    print(f"\nFinal Results:")
    print(f"  Training Accuracy: {train_acc*100:.2f}%")
    print(f"  Validation Accuracy: {val_acc*100:.2f}%")
    
    # Save model
    os.makedirs(args.output_dir, exist_ok=True)
    save_model_for_tfjs(model, label_names, args.output_dir)
    plot_training_history(history, args.output_dir)
    
    print("\n✓ Training complete!")
    print(f"\nNext steps:")
    print(f"1. Convert model to TensorFlow.js (see instructions above)")
    print(f"2. Copy tfjs_model folder to webapp/public/models/")
    print(f"3. Update CameraPanel.jsx to load the model")

if __name__ == '__main__':
    main()

"""
ISL Hand Angles Dataset Training Script
Trains a classifier using pre-computed hand angle features

Dataset format: CSV with columns:
- label: The sign/character label
- both_hands: Whether both hands are used (1 or 0)
- thumb_Left, index_finger_Left, etc.: Angle features for left hand
- thumb_Right, index_finger_Right, etc.: Angle features for right hand

Usage:
    python train_hand_angles.py --dataset hand_angles_datasets.csv --epochs 100
"""

import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import matplotlib.pyplot as plt
import json
import argparse
from pathlib import Path

def load_hand_angles_dataset(csv_path):
    """
    Load ISL dataset from CSV with hand angle features
    
    Returns:
        X: Feature matrix (n_samples, n_features)
        y: Labels (n_samples,)
        feature_names: List of feature column names
        label_encoder: Fitted LabelEncoder
    """
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    print(f"✓ Loaded {len(df)} samples")
    print(f"✓ Columns: {list(df.columns)}")
    
    # Extract label column
    if 'label' not in df.columns:
        raise ValueError("Dataset must have a 'label' column")
    
    labels = df['label'].values
    
    # Get feature columns (all except 'label')
    feature_columns = [col for col in df.columns if col != 'label']
    X = df[feature_columns].values
    
    # Encode labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(labels)
    
    print(f"\n📊 Dataset Statistics:")
    print(f"  Features: {len(feature_columns)}")
    print(f"  Samples: {len(X)}")
    print(f"  Classes: {len(label_encoder.classes_)}")
    print(f"  Labels: {list(label_encoder.classes_)}")
    
    # Show class distribution
    unique, counts = np.unique(y, return_counts=True)
    print(f"\n📈 Class Distribution:")
    for idx, count in zip(unique, counts):
        print(f"  {label_encoder.classes_[idx]}: {count} samples")
    
    return X, y, feature_columns, label_encoder

def create_model(num_features, num_classes):
    """
    Create neural network for hand angle classification
    """
    model = keras.Sequential([
        keras.layers.Input(shape=(num_features,)),
        
        # Batch normalization for stable training
        keras.layers.BatchNormalization(),
        
        # First hidden layer
        keras.layers.Dense(256, activation='relu'),
        keras.layers.Dropout(0.4),
        keras.layers.BatchNormalization(),
        
        # Second hidden layer
        keras.layers.Dense(128, activation='relu'),
        keras.layers.Dropout(0.3),
        keras.layers.BatchNormalization(),
        
        # Third hidden layer
        keras.layers.Dense(64, activation='relu'),
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
    """Plot and save training metrics"""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Accuracy plot
    axes[0].plot(history.history['accuracy'], label='Training Accuracy', linewidth=2)
    axes[0].plot(history.history['val_accuracy'], label='Validation Accuracy', linewidth=2)
    axes[0].set_xlabel('Epoch', fontsize=12)
    axes[0].set_ylabel('Accuracy', fontsize=12)
    axes[0].set_title('Model Accuracy', fontsize=14, fontweight='bold')
    axes[0].legend(fontsize=10)
    axes[0].grid(True, alpha=0.3)
    
    # Loss plot
    axes[1].plot(history.history['loss'], label='Training Loss', linewidth=2)
    axes[1].plot(history.history['val_loss'], label='Validation Loss', linewidth=2)
    axes[1].set_xlabel('Epoch', fontsize=12)
    axes[1].set_ylabel('Loss', fontsize=12)
    axes[1].set_title('Model Loss', fontsize=14, fontweight='bold')
    axes[1].legend(fontsize=10)
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    save_path = Path(output_dir) / 'training_history.png'
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    print(f"✓ Training history saved to {save_path}")

def plot_confusion_matrix(y_true, y_pred, label_names, output_dir):
    """Plot confusion matrix"""
    from sklearn.metrics import confusion_matrix
    import seaborn as sns
    
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(max(10, len(label_names)), max(8, len(label_names) * 0.8)))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=label_names, yticklabels=label_names,
                cbar_kws={'label': 'Count'})
    plt.xlabel('Predicted Label', fontsize=12)
    plt.ylabel('True Label', fontsize=12)
    plt.title('Confusion Matrix', fontsize=14, fontweight='bold')
    plt.tight_layout()
    
    save_path = Path(output_dir) / 'confusion_matrix.png'
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    print(f"✓ Confusion matrix saved to {save_path}")

def save_model_and_metadata(model, label_encoder, feature_names, scaler, output_dir):
    """Save model and all necessary metadata"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Save TensorFlow model in Keras format
    model_path = output_path / 'model.keras'
    model.save(model_path)
    print(f"✓ Model saved to {model_path}")
    
    # Also export for TensorFlow.js conversion
    export_path = output_path / 'saved_model'
    model.export(export_path)
    print(f"✓ Model exported to {export_path}")
    
    # Save label mapping
    labels_path = output_path / 'labels.json'
    with open(labels_path, 'w') as f:
        json.dump({
            'labels': label_encoder.classes_.tolist(),
            'num_classes': len(label_encoder.classes_)
        }, f, indent=2)
    print(f"✓ Labels saved to {labels_path}")
    
    # Save feature names
    features_path = output_path / 'features.json'
    with open(features_path, 'w') as f:
        json.dump({
            'feature_names': feature_names,
            'num_features': len(feature_names)
        }, f, indent=2)
    print(f"✓ Feature names saved to {features_path}")
    
    # Save scaler parameters
    scaler_path = output_path / 'scaler.json'
    with open(scaler_path, 'w') as f:
        json.dump({
            'mean': scaler.mean_.tolist(),
            'scale': scaler.scale_.tolist()
        }, f, indent=2)
    print(f"✓ Scaler parameters saved to {scaler_path}")
    
    print("\n" + "="*70)
    print("To convert to TensorFlow.js format, run:")
    print(f"tensorflowjs_converter --input_format=tf_saved_model \\")
    print(f"  {model_path} \\")
    print(f"  {output_path}/tfjs_model")
    print("="*70)

def main():
    parser = argparse.ArgumentParser(description='Train ISL hand angles classifier')
    parser.add_argument('--dataset', type=str, required=True,
                       help='Path to hand_angles_datasets.csv')
    parser.add_argument('--output_dir', type=str, default='./models/isl_angles_model',
                       help='Output directory for trained model')
    parser.add_argument('--epochs', type=int, default=100,
                       help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=64,
                       help='Batch size for training')
    parser.add_argument('--test_size', type=float, default=0.2,
                       help='Fraction of data for validation')
    
    args = parser.parse_args()
    
    print("="*70)
    print("ISL Hand Angles Classifier Training")
    print("="*70)
    
    # Load dataset
    print("\n[1/6] Loading dataset...")
    X, y, feature_names, label_encoder = load_hand_angles_dataset(args.dataset)
    
    # Check for missing values
    if np.isnan(X).any():
        print("\n⚠️  Warning: Dataset contains NaN values. Filling with 0...")
        X = np.nan_to_num(X, nan=0.0)
    
    # Standardize features
    print("\n[2/6] Standardizing features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    print(f"✓ Features standardized (mean=0, std=1)")
    
    # Split dataset
    print("\n[3/6] Splitting dataset...")
    X_train, X_val, y_train, y_val = train_test_split(
        X_scaled, y, test_size=args.test_size, random_state=42, stratify=y
    )
    print(f"✓ Training samples: {len(X_train)}")
    print(f"✓ Validation samples: {len(X_val)}")
    
    # Create model
    print("\n[4/6] Creating model...")
    num_features = X.shape[1]
    num_classes = len(label_encoder.classes_)
    model = create_model(num_features, num_classes)
    
    print(f"\n📐 Model Architecture:")
    model.summary()
    
    # Train model
    print("\n[5/6] Training model...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=[
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True,
                verbose=1
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=7,
                verbose=1,
                min_lr=1e-6
            )
        ],
        verbose=1
    )
    
    # Evaluate
    print("\n[6/6] Evaluating model...")
    train_loss, train_acc = model.evaluate(X_train, y_train, verbose=0)
    val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
    
    print(f"\n{'='*70}")
    print(f"📊 Final Results:")
    print(f"  Training Accuracy:   {train_acc*100:.2f}%")
    print(f"  Validation Accuracy: {val_acc*100:.2f}%")
    print(f"  Training Loss:       {train_loss:.4f}")
    print(f"  Validation Loss:     {val_loss:.4f}")
    print(f"{'='*70}")
    
    # Generate predictions for confusion matrix
    y_pred = np.argmax(model.predict(X_val, verbose=0), axis=1)
    
    # Save everything
    print("\n[7/7] Saving model and metadata...")
    save_model_and_metadata(model, label_encoder, feature_names, scaler, args.output_dir)
    plot_training_history(history, args.output_dir)
    
    try:
        plot_confusion_matrix(y_val, y_pred, label_encoder.classes_, args.output_dir)
    except ImportError:
        print("⚠️  seaborn not installed, skipping confusion matrix plot")
    
    print("\n" + "="*70)
    print("✅ Training Complete!")
    print("="*70)
    print(f"\nModel saved to: {args.output_dir}")
    print(f"\nNext steps:")
    print(f"1. Convert to TensorFlow.js (see command above)")
    print(f"2. Copy tfjs_model folder to webapp/public/models/")
    print(f"3. Update CameraPanel.jsx to use the trained model")

if __name__ == '__main__':
    main()

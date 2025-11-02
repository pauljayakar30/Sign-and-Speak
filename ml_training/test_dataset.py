"""
Quick test script to verify your ISL dataset structure and extract sample landmarks

Usage:
    python test_dataset.py --dataset_path ./isl_dataset
"""

import os
import cv2
import mediapipe as mp
from pathlib import Path
import argparse

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

def test_dataset_structure(dataset_path):
    """Check if dataset is properly structured"""
    dataset_path = Path(dataset_path)
    
    if not dataset_path.exists():
        print(f"❌ Error: Dataset path '{dataset_path}' does not exist!")
        return False
    
    class_folders = [f for f in dataset_path.iterdir() if f.is_dir()]
    
    if not class_folders:
        print(f"❌ Error: No class folders found in '{dataset_path}'")
        print("Expected structure:")
        print("  dataset/")
        print("    A/")
        print("      image1.jpg")
        print("    B/")
        print("      image1.jpg")
        return False
    
    print(f"✓ Found {len(class_folders)} classes:")
    
    total_images = 0
    for folder in sorted(class_folders):
        images = list(folder.glob('*.jpg')) + list(folder.glob('*.jpeg')) + list(folder.glob('*.png'))
        print(f"  {folder.name}: {len(images)} images")
        total_images += len(images)
    
    print(f"\nTotal images: {total_images}")
    return True

def test_landmark_extraction(dataset_path, num_samples=5):
    """Test MediaPipe landmark extraction on sample images"""
    dataset_path = Path(dataset_path)
    
    print(f"\nTesting landmark extraction on {num_samples} sample images...")
    
    hands = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.5
    )
    
    # Get all image files
    all_images = list(dataset_path.rglob('*.jpg')) + \
                 list(dataset_path.rglob('*.jpeg')) + \
                 list(dataset_path.rglob('*.png'))
    
    if not all_images:
        print("❌ No images found!")
        return
    
    # Test first few images
    success_count = 0
    for i, img_path in enumerate(all_images[:num_samples]):
        print(f"\nTesting image {i+1}/{num_samples}: {img_path.name}")
        
        image = cv2.imread(str(img_path))
        if image is None:
            print(f"  ❌ Could not read image")
            continue
        
        print(f"  Image shape: {image.shape}")
        
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(image_rgb)
        
        if results.multi_hand_landmarks:
            landmarks = results.multi_hand_landmarks[0]
            print(f"  ✓ Hand detected! {len(landmarks.landmark)} landmarks extracted")
            
            # Draw landmarks on image
            annotated_image = image.copy()
            mp_drawing.draw_landmarks(
                annotated_image,
                landmarks,
                mp_hands.HAND_CONNECTIONS
            )
            
            # Save annotated image
            output_path = f"test_output_{i+1}.jpg"
            cv2.imwrite(output_path, annotated_image)
            print(f"  Saved annotated image to: {output_path}")
            
            success_count += 1
        else:
            print(f"  ❌ No hand detected in this image")
    
    print(f"\n{'='*60}")
    print(f"Results: {success_count}/{num_samples} images successfully processed")
    print(f"{'='*60}")
    
    if success_count < num_samples * 0.5:
        print("\n⚠️  Warning: Less than 50% success rate!")
        print("Tips:")
        print("  - Make sure images clearly show hands")
        print("  - Ensure good lighting in images")
        print("  - Check if hands are clearly visible (not blurry)")
    else:
        print("\n✓ Dataset looks good for training!")

def main():
    parser = argparse.ArgumentParser(description='Test ISL dataset')
    parser.add_argument('--dataset_path', type=str, required=True,
                       help='Path to ISL dataset folder')
    parser.add_argument('--num_samples', type=int, default=5,
                       help='Number of sample images to test')
    
    args = parser.parse_args()
    
    print("="*60)
    print("ISL Dataset Test Tool")
    print("="*60)
    
    # Test structure
    if test_dataset_structure(args.dataset_path):
        # Test landmark extraction
        test_landmark_extraction(args.dataset_path, args.num_samples)

if __name__ == '__main__':
    main()

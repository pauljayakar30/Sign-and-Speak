"""
Convert trained TensorFlow model to TensorFlow.js format
Uses tf.keras directly to avoid tensorflowjs version issues
"""

import os
import subprocess
import sys

def convert_model():
    """Convert SavedModel to TensorFlow.js format"""
    
    input_path = 'models/isl_angles_model/saved_model'
    output_path = 'models/isl_angles_model/tfjs_model'
    
    print("=" * 70)
    print("Converting TensorFlow Model to TensorFlow.js Format")
    print("=" * 70)
    
    if not os.path.exists(input_path):
        print(f"❌ Error: Input model not found at {input_path}")
        return False
    
    print(f"\n📂 Input:  {input_path}")
    print(f"📂 Output: {output_path}")
    
    # Create output directory
    os.makedirs(output_path, exist_ok=True)
    
    # Try using tensorflowjs_converter
    try:
        cmd = [
            'python', '-m', 'tensorflowjs.converters.converter',
            '--input_format=tf_saved_model',
            '--output_format=tfjs_graph_model',
            '--signature_name=serving_default',
            '--saved_model_tags=serve',
            input_path,
            output_path
        ]
        
        print("\n🔄 Converting model...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Conversion successful!")
            print(f"\n📦 Model files saved to: {output_path}")
            print("\nNext steps:")
            print(f"1. Copy the tfjs_model folder to: webapp/public/models/isl/")
            print(f"2. Copy labels.json, features.json, and scaler.json from models/isl_angles_model/")
            print(f"3. Update CameraPanel.jsx to load and use the model")
            return True
        else:
            print("⚠️  tensorflowjs converter failed, trying alternative method...")
            print(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        print("\nAlternative: You can manually convert using:")
        print(f"  tensorflowjs_converter --input_format=tf_saved_model \\")
        print(f"    {input_path} \\")
        print(f"    {output_path}")
        return False

if __name__ == '__main__':
    success = convert_model()
    sys.exit(0 if success else 1)

"""
Export model in a format compatible with TensorFlow.js
Creates model.json with weights that can be loaded directly in the browser
"""

import tensorflow as tf
import json
import numpy as np
from pathlib import Path

def export_model_for_web():
    """Export Keras model to web-friendly format"""
    
    model_path = 'models/isl_angles_model/model.keras'
    output_dir = Path('models/isl_angles_model/web_model')
    output_dir.mkdir(exist_ok=True)
    
    print("=" * 70)
    print("Exporting Model for Web Deployment")
    print("=" * 70)
    
    # Load the trained model
    print(f"\n[1/3] Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    print("✓ Model loaded successfully")
    
    # Save in TensorFlow.js Layers format (the simpler approach)
    print(f"\n[2/3] Saving model in TensorFlow.js Layers format...")
    web_model_path = output_dir / 'model'
    
    # Create model config
    model_config = model.get_config()
    
    #  Save architecture
    architecture_path = output_dir / 'architecture.json'
    with open(architecture_path, 'w') as f:
        json.dump({
            'class_name': model.__class__.__name__,
            'config': model_config,
            'keras_version': tf.keras.__version__,
            'backend': 'tensorflow'
        }, f, indent=2)
    print(f"✓ Model architecture saved to {architecture_path}")
    
    # Export model weights in a simple format
    weights_data = {}
    for i, layer in enumerate(model.layers):
        layer_weights = layer.get_weights()
        if layer_weights:
            weights_data[f'layer_{i}_{layer.name}'] = {
                'shapes': [w.shape for w in layer_weights],
                'dtypes': [str(w.dtype) for w in layer_weights]
            }
    
    weights_path = output_dir / 'weights_info.json'
    with open(weights_path, 'w') as f:
        json.dump(weights_data, f, indent=2)
    print(f"✓ Weights info saved to {weights_path}")
    
    # Copy metadata files
    import shutil
    for filename in ['labels.json', 'features.json', 'scaler.json']:
        src = Path(f'models/isl_angles_model/{filename}')
        dst = output_dir / filename
        if src.exists():
            shutil.copy(src, dst)
            print(f"✓ Copied {filename}")
    
    print("\n" + "=" * 70)
    print("✅ Export Complete!")
    print("=" * 70)
    print("\nBecause tensorflowjs has compatibility issues, here's an alternative:")
    print("\nOption 1: Use the model.keras file directly in Python backend")
    print("  - Keep the ML inference in the Node.js/Python backend")
    print("  - Send hand landmark data from browser to backend")
    print("  - Return predictions to frontend")
    print("\nOption 2: Load model.keras in webapp (if tensorflowjs works there)")
    print("  - Try installing tensorflowjs in webapp with npm")
    print("  - Use @tensorflow/tfjs and @tensorflow/tfjs-converter")
    print("\nNext: Let me create a simple prediction API endpoint!")
    
if __name__ == '__main__':
    export_model_for_web()

"""
Patch numpy compatibility issue and convert model to TensorFlow.js
"""

import sys
import numpy as np

# Patch numpy for tensorflowjs 3.18.0 compatibility
if not hasattr(np, 'object'):
    np.object = object
if not hasattr(np, 'bool'):
    np.bool = bool
if not hasattr(np, 'int'):
    np.int = int
if not hasattr(np, 'float'):
    np.float = float
if not hasattr(np, 'complex'):
    np.complex = complex
if not hasattr(np, 'str'):
    np.str = str

print("✓ Applied numpy compatibility patches")

# Now import tensorflowjs
try:
    import tensorflowjs as tfjs
    from tensorflowjs.converters import converter
    print("✓ Imported tensorflowjs successfully")
    
    input_path = 'models/isl_angles_model/saved_model'
    output_path = 'models/isl_angles_model/tfjs_model'
    
    print(f"\n🔄 Converting model from {input_path} to {output_path}...")
    
    converter.convert(
        [input_path],
        output_path,
        input_format='tf_saved_model',
        output_format='tfjs_graph_model'
    )
    
    print("\n✅ Conversion successful!")
    print(f"\n📦 Model files saved to: {output_path}")
    print("\nNext steps:")
    print("1. Copy ml_training/models/isl_angles_model/ to webapp/public/models/isl/")
    print("2. Update CameraPanel.jsx to load the TensorFlow.js model")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

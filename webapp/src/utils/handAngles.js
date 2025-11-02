/**
 * Hand Angles Extraction Utility
 * Converts MediaPipe hand landmarks into angle features for ISL prediction
 */

/**
 * Calculate angle between three points (in degrees)
 * @param {Object} p1 - First point {x, y, z}
 * @param {Object} p2 - Middle point (vertex) {x, y, z}
 * @param {Object} p3 - Third point {x, y, z}
 * @returns {number} Angle in degrees (0-180)
 */
function calculateAngle(p1, p2, p3) {
  // Vector from p2 to p1
  const v1x = p1.x - p2.x;
  const v1y = p1.y - p2.y;
  const v1z = p1.z || 0;
  
  // Vector from p2 to p3
  const v2x = p3.x - p2.x;
  const v2y = p3.y - p2.y;
  const v2z = p3.z || 0;
  
  // Dot product
  const dot = v1x * v2x + v1y * v2y + v1z * v2z;
  
  // Magnitudes
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y + v1z * v1z);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y + v2z * v2z);
  
  // Angle in radians
  const radians = Math.acos(dot / (mag1 * mag2));
  
  // Convert to degrees
  let angle = radians * (180 / Math.PI);
  
  // Ensure angle is between 0-180
  if (angle > 180) angle = 360 - angle;
  if (isNaN(angle)) angle = 0;
  
  return angle;
}

/**
 * Calculate finger angle from landmarks
 * @param {Array} landmarks - MediaPipe hand landmarks
 * @param {Array} indices - Landmark indices [base, joint1, joint2, tip]
 * @returns {number} Average angle for the finger
 */
function calculateFingerAngle(landmarks, indices) {
  if (!landmarks || landmarks.length < Math.max(...indices) + 1) {
    return 0;
  }
  
  const angles = [];
  
  // Calculate angle at each joint
  for (let i = 0; i < indices.length - 2; i++) {
    const p1 = landmarks[indices[i]];
    const p2 = landmarks[indices[i + 1]];
    const p3 = landmarks[indices[i + 2]];
    
    if (p1 && p2 && p3) {
      angles.push(calculateAngle(p1, p2, p3));
    }
  }
  
  // Return average angle
  return angles.length > 0 
    ? angles.reduce((a, b) => a + b, 0) / angles.length 
    : 0;
}

/**
 * Calculate palm angle (angle between palm and horizontal plane)
 * @param {Array} landmarks - MediaPipe hand landmarks
 * @param {string} side - 'left' or 'right'
 * @returns {Object} Palm angles {left: number, right: number}
 */
function calculatePalmAngles(landmarks, side) {
  if (!landmarks || landmarks.length < 21) {
    return { left: 0, right: 0 };
  }
  
  // Use wrist (0), index base (5), and pinky base (17) to define palm plane
  const wrist = landmarks[0];
  const indexBase = landmarks[5];
  const pinkyBase = landmarks[17];
  
  // Left palm angle (wrist -> index base)
  const leftAngle = Math.atan2(
    indexBase.y - wrist.y,
    indexBase.x - wrist.x
  ) * (180 / Math.PI);
  
  // Right palm angle (wrist -> pinky base)
  const rightAngle = Math.atan2(
    pinkyBase.y - wrist.y,
    pinkyBase.x - wrist.x
  ) * (180 / Math.PI);
  
  return {
    left: Math.abs(leftAngle),
    right: Math.abs(rightAngle)
  };
}

/**
 * Calculate hand ground angle (hand orientation relative to camera)
 * @param {Array} landmarks - MediaPipe hand landmarks
 * @returns {number} Ground angle in degrees
 */
function calculateGroundAngle(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return 0;
  }
  
  // Use middle finger MCP (9) and wrist (0) to determine hand orientation
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  
  const angle = Math.atan2(
    middleMCP.y - wrist.y,
    middleMCP.x - wrist.x
  ) * (180 / Math.PI);
  
  return Math.abs(angle);
}

/**
 * Extract all hand angle features from MediaPipe results
 * @param {Object} leftHandLandmarks - Left hand landmarks from MediaPipe
 * @param {Object} rightHandLandmarks - Right hand landmarks from MediaPipe
 * @returns {Object} Feature object with 17 angle values
 */
export function extractHandAngles(leftHandLandmarks, rightHandLandmarks) {
  const features = {
    both_hands: (leftHandLandmarks && rightHandLandmarks) ? 1 : 0
  };
  
  // LEFT HAND FEATURES
  if (leftHandLandmarks && leftHandLandmarks.length >= 21) {
    // Finger angles (using MCP, PIP, DIP, TIP landmarks)
    features.thumb_Left = calculateFingerAngle(leftHandLandmarks, [1, 2, 3, 4]);
    features.index_finger_Left = calculateFingerAngle(leftHandLandmarks, [5, 6, 7, 8]);
    features.middle_finger_Left = calculateFingerAngle(leftHandLandmarks, [9, 10, 11, 12]);
    features.ring_finger_Left = calculateFingerAngle(leftHandLandmarks, [13, 14, 15, 16]);
    features.pinky_Left = calculateFingerAngle(leftHandLandmarks, [17, 18, 19, 20]);
    
    // Palm angles
    const leftPalm = calculatePalmAngles(leftHandLandmarks, 'left');
    features.palm_angle_Left_left = leftPalm.left;
    features.palm_angle_Left_right = leftPalm.right;
    
    // Ground angle
    features.hand_Left_ground_angle = calculateGroundAngle(leftHandLandmarks);
  } else {
    // No left hand detected - set to 0
    features.thumb_Left = 0;
    features.index_finger_Left = 0;
    features.middle_finger_Left = 0;
    features.ring_finger_Left = 0;
    features.pinky_Left = 0;
    features.palm_angle_Left_left = 0;
    features.palm_angle_Left_right = 0;
    features.hand_Left_ground_angle = 0;
  }
  
  // RIGHT HAND FEATURES
  if (rightHandLandmarks && rightHandLandmarks.length >= 21) {
    // Finger angles
    features.thumb_Right = calculateFingerAngle(rightHandLandmarks, [1, 2, 3, 4]);
    features.index_finger_Right = calculateFingerAngle(rightHandLandmarks, [5, 6, 7, 8]);
    features.middle_finger_Right = calculateFingerAngle(rightHandLandmarks, [9, 10, 11, 12]);
    features.ring_finger_Right = calculateFingerAngle(rightHandLandmarks, [13, 14, 15, 16]);
    features.pinky_Right = calculateFingerAngle(rightHandLandmarks, [17, 18, 19, 20]);
    
    // Palm angles
    const rightPalm = calculatePalmAngles(rightHandLandmarks, 'right');
    features.palm_angle_Right_left = rightPalm.left;
    features.palm_angle_Right_right = rightPalm.right;
    
    // Ground angle
    features.hand_Right_ground_angle = calculateGroundAngle(rightHandLandmarks);
  } else {
    // No right hand detected - set to 0
    features.thumb_Right = 0;
    features.index_finger_Right = 0;
    features.middle_finger_Right = 0;
    features.ring_finger_Right = 0;
    features.pinky_Right = 0;
    features.palm_angle_Right_left = 0;
    features.palm_angle_Right_right = 0;
    features.hand_Right_ground_angle = 0;
  }
  
  return features;
}

/**
 * Validate that all required features are present
 * @param {Object} features - Feature object
 * @returns {boolean} True if valid
 */
export function validateFeatures(features) {
  const requiredFeatures = [
    'both_hands',
    'thumb_Left', 'index_finger_Left', 'middle_finger_Left', 'ring_finger_Left', 'pinky_Left',
    'palm_angle_Left_left', 'palm_angle_Left_right', 'hand_Left_ground_angle',
    'thumb_Right', 'index_finger_Right', 'middle_finger_Right', 'ring_finger_Right', 'pinky_Right',
    'palm_angle_Right_left', 'palm_angle_Right_right', 'hand_Right_ground_angle'
  ];
  
  return requiredFeatures.every(key => key in features && typeof features[key] === 'number');
}

export default {
  extractHandAngles,
  validateFeatures
};

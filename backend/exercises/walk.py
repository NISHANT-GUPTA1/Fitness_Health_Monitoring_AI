import numpy as np
import math

def calculate_angle(a, b, c):
    """
    Calculate the angle between three points
    
    Args:
        a: First point [x, y]
        b: Mid point [x, y]
        c: End point [x, y]
    
    Returns:
        angle in degrees
    """
    a = np.array([a.x, a.y])
    b = np.array([b.x, b.y])
    c = np.array([c.x, c.y])
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
    
    return angle

def analyze_walk(landmarks):
    """
    Analyze walking form using pose landmarks
    
    Args:
        landmarks: MediaPipe pose landmarks
    
    Returns:
        Dictionary with posture feedback and rep count info
    """
    # Extract key landmarks for walking analysis
    try:
        # Upper body landmarks
        nose = landmarks.landmark[0]
        left_shoulder = landmarks.landmark[11]
        right_shoulder = landmarks.landmark[12]
        left_hip = landmarks.landmark[23]
        right_hip = landmarks.landmark[24]
        
        # Lower body landmarks
        left_knee = landmarks.landmark[25]
        right_knee = landmarks.landmark[26]
        left_ankle = landmarks.landmark[27]
        right_ankle = landmarks.landmark[28]
        
        # Calculate key angles and positions
        # Check posture (vertical alignment)
        upper_body_angle = calculate_angle(nose, left_shoulder, left_hip)
        
        # Calculate hip level (should be even)
        hip_diff = abs(left_hip.y - right_hip.y)
        
        # Analyze form
        correct_form = True
        message = "Good walking posture! Keep your head up and shoulders back."
        
        # Check if leaning too far forward
        if upper_body_angle < 150:
            correct_form = False
            message = "Stand up straighter. Don't lean forward too much."
        
        # Check if hips are level
        if hip_diff > 0.05:
            correct_form = False
            message = "Try to keep your hips level as you walk."
        
        # Check arm swing (simplified)
        left_arm_angle = calculate_angle(left_shoulder, landmarks.landmark[13], landmarks.landmark[15])
        right_arm_angle = calculate_angle(right_shoulder, landmarks.landmark[14], landmarks.landmark[16])
        
        if left_arm_angle < 130 and right_arm_angle < 130:
            correct_form = False
            message = "Let your arms swing naturally as you walk."
            
        # Stepping tracking would require multiple frames
        # In a real implementation, this would track steps over time
        
        return {
            "posture": {
                "correct": correct_form,
                "message": message
            },
            "repCount": 0,  # Steps would be counted across frames
            "angles": {
                "upperBody": int(upper_body_angle),
                "hipAlignment": round(hip_diff * 100, 1)
            }
        }
        
    except Exception as e:
        return {
            "posture": {
                "correct": False,
                "message": "Could not analyze walking form. Make sure your full body is visible."
            },
            "repCount": 0,
            "error": str(e)
        }

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

def analyze_squat(landmarks):
    """
    Analyze squat form using pose landmarks
    
    Args:
        landmarks: MediaPipe pose landmarks
    
    Returns:
        Dictionary with posture feedback and rep count info
    """
    # Extract key landmarks for squat analysis
    try:
        hip = landmarks.landmark[23]       # LEFT_HIP
        knee = landmarks.landmark[25]      # LEFT_KNEE
        ankle = landmarks.landmark[27]     # LEFT_ANKLE
        shoulder = landmarks.landmark[11]  # LEFT_SHOULDER
        
        # Calculate key angles
        knee_angle = calculate_angle(hip, knee, ankle)
        hip_angle = calculate_angle(shoulder, hip, knee)
        
        # Determine squat position (up or down)
        is_down_position = knee_angle < 120
        
        # Analyze form
        correct_form = True
        message = "Good squat form! Keep your weight in your heels."
        
        # Check if knees are going over toes
        if landmarks.landmark[25].x > landmarks.landmark[27].x + 0.1:  # LEFT_KNEE vs LEFT_ANKLE
            correct_form = False
            message = "Keep your knees behind your toes. Push through your heels."
        
        # Check if back is straight
        back_angle = calculate_angle(landmarks.landmark[11], landmarks.landmark[23], landmarks.landmark[24])
        if back_angle < 160:
            correct_form = False
            message = "Keep your back straighter. Chest up, look forward."
        
        # Check squat depth
        if knee_angle > 140 and is_down_position:
            correct_form = False
            message = "Try to squat deeper, but maintain proper form."
        
        # For demo purposes, we're using a random rep count
        # In a real implementation, this would track reps over time
        rep_count = 0
        if is_down_position:
            rep_count = 1
        
        return {
            "posture": {
                "correct": correct_form,
                "message": message
            },
            "repCount": rep_count,
            "position": "down" if is_down_position else "up",
            "angles": {
                "knee": int(knee_angle),
                "hip": int(hip_angle)
            }
        }
        
    except Exception as e:
        return {
            "posture": {
                "correct": False,
                "message": "Could not analyze squat form. Make sure your full body is visible."
            },
            "repCount": 0,
            "error": str(e)
        }

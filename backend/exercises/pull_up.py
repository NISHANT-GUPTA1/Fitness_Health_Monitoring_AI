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

def analyze_pull_up(landmarks):
    """
    Analyze pull-up form using pose landmarks
    
    Args:
        landmarks: MediaPipe pose landmarks
    
    Returns:
        Dictionary with posture feedback and rep count info
    """
    # Extract key landmarks for pull-up analysis
    try:
        shoulder = landmarks.landmark[11]  # LEFT_SHOULDER
        elbow = landmarks.landmark[13]     # LEFT_ELBOW
        wrist = landmarks.landmark[15]     # LEFT_WRIST
        hip = landmarks.landmark[23]       # LEFT_HIP
        
        # Calculate angles
        arm_angle = calculate_angle(shoulder, elbow, wrist)
        body_angle = calculate_angle(shoulder, hip, landmarks.landmark[25])  # LEFT_KNEE
        
        # Determine pull-up position (up or down)
        is_up_position = arm_angle < 80
        
        # Analyze form
        correct_form = True
        message = "Good pull-up form! Keep your body straight."
        
        # Check body position (no kipping)
        if body_angle < 160:
            correct_form = False
            message = "Avoid swinging or kipping. Keep your body straight."
        
        # Check shoulder engagement
        shoulder_y = (landmarks.landmark[11].y + landmarks.landmark[12].y) / 2
        ear_y = (landmarks.landmark[7].y + landmarks.landmark[8].y) / 2
        
        if is_up_position and shoulder_y > ear_y:
            correct_form = False
            message = "Pull your shoulders down away from your ears."
            
        # For demo purposes, we're using a random rep count
        # In a real implementation, this would track reps over time
        rep_count = 0
        if is_up_position:
            rep_count = 1
        
        return {
            "posture": {
                "correct": correct_form,
                "message": message
            },
            "repCount": rep_count,
            "position": "up" if is_up_position else "down",
            "angles": {
                "arm": int(arm_angle),
                "body": int(body_angle)
            }
        }
        
    except Exception as e:
        return {
            "posture": {
                "correct": False,
                "message": "Could not analyze pull-up form. Make sure your full body is visible."
            },
            "repCount": 0,
            "error": str(e)
        }

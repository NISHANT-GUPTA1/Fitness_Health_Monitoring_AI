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

def analyze_sit_up(landmarks):
    """
    Analyze sit-up form using pose landmarks
    
    Args:
        landmarks: MediaPipe pose landmarks
    
    Returns:
        Dictionary with posture feedback and rep count info
    """
    # Extract key landmarks for sit-up analysis
    try:
        shoulder = landmarks.landmark[11]  # LEFT_SHOULDER
        hip = landmarks.landmark[23]       # LEFT_HIP
        knee = landmarks.landmark[25]      # LEFT_KNEE
        ankle = landmarks.landmark[27]     # LEFT_ANKLE
        
        # Calculate key angles
        torso_angle = calculate_angle(shoulder, hip, knee)
        leg_angle = calculate_angle(hip, knee, ankle)
        
        # Determine sit-up position (up or down)
        is_up_position = torso_angle < 130
        
        # Analyze form
        correct_form = True
        message = "Good sit-up form! Keep your core engaged."
        
        # Check if legs are properly positioned
        if leg_angle < 30 or leg_angle > 110:
            correct_form = False
            message = "Keep your knees bent at about 90 degrees."
        
        # Check neck position
        if 'visibility' in dir(landmarks.landmark[0]) and landmarks.landmark[0].visibility > 0.8:
            head_pos = landmarks.landmark[0]  # NOSE
            neck_angle = calculate_angle(head_pos, shoulder, hip)
            if neck_angle < 140:
                correct_form = False
                message = "Keep your neck neutral. Don't pull with your neck."
        
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
                "torso": int(torso_angle),
                "legs": int(leg_angle)
            }
        }
        
    except Exception as e:
        return {
            "posture": {
                "correct": False,
                "message": "Could not analyze sit-up form. Make sure your upper body is visible."
            },
            "repCount": 0,
            "error": str(e)
        }

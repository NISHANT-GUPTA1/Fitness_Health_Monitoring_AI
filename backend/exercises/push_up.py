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

def analyze_push_up(landmarks):
    """
    Analyze push-up form using pose landmarks
    
    Args:
        landmarks: MediaPipe pose landmarks
    
    Returns:
        Dictionary with posture feedback and rep count info
    """
    # Extract key landmarks for push-up analysis
    try:
        shoulder = landmarks.landmark[11]  # LEFT_SHOULDER
        elbow = landmarks.landmark[13]     # LEFT_ELBOW
        wrist = landmarks.landmark[15]     # LEFT_WRIST
        hip = landmarks.landmark[23]       # LEFT_HIP
        
        # Calculate angles
        arm_angle = calculate_angle(shoulder, elbow, wrist)
        body_angle = calculate_angle(shoulder, hip, landmarks.landmark[25])  # LEFT_KNEE
        
        # Determine push-up position (up or down)
        is_down_position = arm_angle < 90
        
        # Analyze form
        correct_form = True
        message = "Good form! Keep your body straight and core engaged."
        
        # Check body alignment (straight back)
        if body_angle < 160:
            correct_form = False
            message = "Keep your back straight. Don't let your hips sag or pike up."
        
        # Check if arms are too wide or too narrow
        shoulder_width = abs(landmarks.landmark[11].x - landmarks.landmark[12].x)
        hand_width = abs(landmarks.landmark[19].x - landmarks.landmark[20].x)
        
        if hand_width > shoulder_width * 2:
            correct_form = False
            message = "Your hands are too wide. Bring them closer to shoulder width."
        elif hand_width < shoulder_width * 0.7:
            correct_form = False
            message = "Your hands are too narrow. Place them shoulder-width apart."
            
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
                "arm": int(arm_angle),
                "body": int(body_angle)
            }
        }
        
    except Exception as e:
        return {
            "posture": {
                "correct": False,
                "message": "Could not analyze push-up form. Make sure your full body is visible."
            },
            "repCount": 0,
            "error": str(e)
        }

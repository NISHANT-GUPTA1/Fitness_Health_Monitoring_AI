from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import mediapipe as mp
import os
import sys
import math

# Import exercise analyzers
from exercises.push_up import analyze_push_up
from exercises.squat import analyze_squat
from exercises.sit_up import analyze_sit_up
from exercises.pull_up import analyze_pull_up
from exercises.walk import analyze_walk

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Initialize MediaPipe pose solution
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

@app.route('/api/analyze-exercise', methods=['POST'])
def analyze_exercise():
    """
    Endpoint to analyze exercise form from an image frame
    
    Expected JSON payload:
    {
        "exerciseType": "push-up", // or "squat", "sit-up", "pull-up", "walk"
        "image": "base64-encoded-image-data"
    }
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        exercise_type = data.get('exerciseType', 'push-up').lower()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Convert base64 image to OpenCV format
        try:
            # Handle data URLs (e.g. "data:image/jpeg;base64,...")
            if "base64," in image_data:
                image_data = image_data.split('base64,')[1]
                
            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return jsonify({"error": "Could not decode image"}), 400
                
        except Exception as e:
            return jsonify({"error": f"Image decoding error: {str(e)}"}), 400
        
        # Process with MediaPipe
        with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
            # Convert BGR to RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            result = pose.process(img_rgb)
            
            if not result.pose_landmarks:
                return jsonify({
                    "posture": {
                        "correct": False,
                        "message": "No body detected. Please make sure your full body is visible."
                    },
                    "repCount": 0
                })
            
            # Analyze based on exercise type
            if exercise_type == "push-up":
                feedback = analyze_push_up(result.pose_landmarks)
            elif exercise_type == "squat":
                feedback = analyze_squat(result.pose_landmarks)
            elif exercise_type == "sit-up":
                feedback = analyze_sit_up(result.pose_landmarks)
            elif exercise_type == "pull-up":
                feedback = analyze_pull_up(result.pose_landmarks)
            elif exercise_type == "walk":
                feedback = analyze_walk(result.pose_landmarks)
            else:
                return jsonify({"error": f"Unsupported exercise type: {exercise_type}"}), 400
            
            return jsonify(feedback)
            
    except Exception as e:
        print(f"Error processing request: {str(e)}", file=sys.stderr)
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple endpoint to check if the API is running"""
    return jsonify({"status": "ok", "message": "Exercise analysis API is running"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

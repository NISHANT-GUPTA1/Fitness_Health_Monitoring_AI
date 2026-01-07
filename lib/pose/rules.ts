/**
 * Exercise Correctness Rules
 * Rule-based validation for different exercises
 */

import { calculateAngle, isVisible, Point3D } from "./angles";
import { Results } from "@mediapipe/pose";

export interface FeedbackResult {
  correct: boolean;
  message: string;
  details?: Record<string, any>;
}

/**
 * MediaPipe Pose Landmark Indices
 * Reference: https://google.github.io/mediapipe/solutions/pose.html
 */
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

/**
 * Squat Form Checker
 */
export function squatRule(results: Results): FeedbackResult {
  const landmarks = results.poseLandmarks;
  if (!landmarks) {
    return { correct: false, message: "No pose detected" };
  }

  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

  if (!isVisible(leftHip) || !isVisible(leftKnee) || !isVisible(leftAnkle)) {
    return { correct: false, message: "Position yourself fully in frame" };
  }

  const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

  // Squat depth analysis
  if (kneeAngle < 90) {
    return {
      correct: true,
      message: "✅ Good depth! Excellent form",
      details: { kneeAngle: Math.round(kneeAngle) },
    };
  } else if (kneeAngle < 110) {
    return {
      correct: false,
      message: "⚠️ Go slightly lower",
      details: { kneeAngle: Math.round(kneeAngle) },
    };
  } else {
    return {
      correct: false,
      message: "❌ Squat deeper for full range",
      details: { kneeAngle: Math.round(kneeAngle) },
    };
  }
}

/**
 * Push-up Form Checker
 */
export function pushUpRule(results: Results): FeedbackResult {
  const landmarks = results.poseLandmarks;
  if (!landmarks) {
    return { correct: false, message: "No pose detected" };
  }

  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];

  if (!isVisible(leftShoulder) || !isVisible(leftElbow) || !isVisible(leftWrist)) {
    return { correct: false, message: "Ensure arms are visible" };
  }

  const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);

  if (elbowAngle < 90) {
    return {
      correct: true,
      message: "✅ Full range achieved!",
      details: { elbowAngle: Math.round(elbowAngle) },
    };
  } else if (elbowAngle < 120) {
    return {
      correct: false,
      message: "⚠️ Lower your chest more",
      details: { elbowAngle: Math.round(elbowAngle) },
    };
  } else {
    return {
      correct: false,
      message: "❌ Go lower for proper form",
      details: { elbowAngle: Math.round(elbowAngle) },
    };
  }
}

/**
 * Plank Form Checker
 */
export function plankRule(results: Results): FeedbackResult {
  const landmarks = results.poseLandmarks;
  if (!landmarks) {
    return { correct: false, message: "No pose detected" };
  }

  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

  if (!isVisible(leftShoulder) || !isVisible(leftHip) || !isVisible(leftAnkle)) {
    return { correct: false, message: "Full body must be visible" };
  }

  const bodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);

  if (bodyAngle > 160 && bodyAngle < 180) {
    return {
      correct: true,
      message: "✅ Perfect straight line!",
      details: { bodyAngle: Math.round(bodyAngle) },
    };
  } else if (bodyAngle > 150) {
    return {
      correct: false,
      message: "⚠️ Keep core engaged",
      details: { bodyAngle: Math.round(bodyAngle) },
    };
  } else {
    return {
      correct: false,
      message: "❌ Straighten your back",
      details: { bodyAngle: Math.round(bodyAngle) },
    };
  }
}

/**
 * Generic exercise rule router
 */
export function checkExerciseForm(
  exercise: "squat" | "pushup" | "plank",
  results: Results
): FeedbackResult {
  switch (exercise) {
    case "squat":
      return squatRule(results);
    case "pushup":
      return pushUpRule(results);
    case "plank":
      return plankRule(results);
    default:
      return { correct: false, message: "Unknown exercise" };
  }
}

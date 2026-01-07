/**
 * MediaPipe Pose Configuration
 * - Client-side pose detection for privacy
 * - No video leaves the browser
 * - GDPR & HIPAA friendly
 */

export interface Results {
  poseLandmarks?: any[];
  poseWorldLandmarks?: any[];
  segmentationMask?: any;
  image: any;
}

declare global {
  interface Window {
    Pose: any;
  }
}

export async function createPose(onResults: (results: Results) => void) {
  // Load MediaPipe Pose from CDN
  if (!window.Pose) {
    await loadMediaPipeScripts();
  }
  
  const pose = new window.Pose({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1, // 0=lite, 1=full, 2=heavy
    smoothLandmarks: true,
    enableSegmentation: false, // Disable for performance
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults(onResults);
  return pose;
}

function loadMediaPipeScripts(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Pose) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load MediaPipe Pose'));
    document.head.appendChild(script);
  });
}

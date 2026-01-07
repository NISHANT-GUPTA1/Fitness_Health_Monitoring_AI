"use client";

/**
 * PoseCamera Component
 * Real-time pose detection using MediaPipe
 * - Privacy-first: video never leaves browser
 * - Works with Next.js 15 + React 19
 */

import { useEffect, useRef, useState } from "react";
import { createPose, Results } from "@/lib/pose/pose";

// Declare MediaPipe drawing utilities as global
declare global {
  interface Window {
    drawConnectors: any;
    drawLandmarks: any;
  }
}

// Pose connections for drawing skeleton
const POSE_CONNECTIONS = [
  [11, 13], [13, 15], // Left arm
  [12, 14], [14, 16], // Right arm
  [11, 12], // Shoulders
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [25, 27], // Left leg
  [24, 26], [26, 28], // Right leg
];

interface PoseCameraProps {
  onResults?: (results: Results) => void;
  width?: number;
  height?: number;
  showCanvas?: boolean;
}

export default function PoseCamera({
  onResults,
  width = 640,
  height = 480,
  showCanvas = true,
}: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const poseRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    let active = true;

    const initializePose = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load drawing utilities
        await loadDrawingUtils();

        // Request camera permission explicitly
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode: "user",
          },
        });

        if (!videoRef.current) return;

        // Set up video element
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };

        await videoRef.current.play();

        // Initialize MediaPipe Pose (async)
        const pose = await createPose((results) => {
          if (!active) return;

          // Draw on canvas
          if (showCanvas && canvasRef.current) {
            const canvasCtx = canvasRef.current.getContext("2d");
            if (canvasCtx) {
              canvasCtx.save();
              canvasCtx.clearRect(0, 0, width, height);
              
              // Draw video frame
              canvasCtx.drawImage(results.image, 0, 0, width, height);

              // Draw pose landmarks
              if (results.poseLandmarks) {
                // Draw connections (skeleton)
                if (window.drawConnectors) {
                  window.drawConnectors(
                    canvasCtx, 
                    results.poseLandmarks, 
                    POSE_CONNECTIONS, 
                    { color: "#00FF00", lineWidth: 4 }
                  );
                } else {
                  // Fallback: draw lines manually
                  canvasCtx.strokeStyle = "#00FF00";
                  canvasCtx.lineWidth = 4;
                  POSE_CONNECTIONS.forEach(([start, end]) => {
                    const startPoint = results.poseLandmarks![start];
                    const endPoint = results.poseLandmarks![end];
                    if (startPoint && endPoint) {
                      canvasCtx.beginPath();
                      canvasCtx.moveTo(startPoint.x * width, startPoint.y * height);
                      canvasCtx.lineTo(endPoint.x * width, endPoint.y * height);
                      canvasCtx.stroke();
                    }
                  });
                }

                // Draw landmarks (points)
                if (window.drawLandmarks) {
                  window.drawLandmarks(
                    canvasCtx, 
                    results.poseLandmarks, 
                    { color: "#FF0000", lineWidth: 2 }
                  );
                } else {
                  // Fallback: draw circles manually
                  canvasCtx.fillStyle = "#FF0000";
                  results.poseLandmarks.forEach((landmark: any) => {
                    canvasCtx.beginPath();
                    canvasCtx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
                    canvasCtx.fill();
                  });
                }
              }

              canvasCtx.restore();
            }
          }

          // Pass results to parent
          if (onResults) {
            onResults(results);
          }
        });

        poseRef.current = pose;

        // Process video frames
        const sendFrame = async () => {
          if (!active || !videoRef.current || !poseRef.current) return;

          if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            await poseRef.current.send({ image: videoRef.current });
          }

          animationFrameRef.current = requestAnimationFrame(sendFrame);
        };

        sendFrame();
        setIsLoading(false);
      } catch (err: any) {
        console.error("Pose initialization error:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera permission denied. Please allow camera access.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Please connect a camera.");
        } else {
          setError(`Failed to initialize: ${err.message || "Unknown error"}`);
        }
        setIsLoading(false);
      }
    };

    initializePose();

    return () => {
      active = false;
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Close pose
      if (poseRef.current) {
        poseRef.current.close();
      }

      // Stop video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onResults, width, height, showCanvas]);

  return (
    <div className="relative w-full h-full">
      {/* Video element for camera feed */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        width={width}
        height={height}
      />

      {/* Canvas for pose visualization */}
      {showCanvas && (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full object-cover rounded-lg border-2 border-primary"
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p>Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
          <div className="text-red-600 dark:text-red-400 text-center p-4">
            <p className="font-semibold">⚠️ {error}</p>
            <p className="text-sm mt-2">
              Make sure camera permissions are granted
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Load MediaPipe drawing utilities
function loadDrawingUtils(): Promise<void> {
  return new Promise((resolve) => {
    if (window.drawConnectors && window.drawLandmarks) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => resolve(); // Continue even if drawing utils fail
    document.head.appendChild(script);
  });
}

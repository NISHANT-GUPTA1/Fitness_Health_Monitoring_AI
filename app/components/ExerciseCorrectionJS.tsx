"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation } from "react-i18next"
import { Camera, Play, Pause, CheckCircle, AlertTriangle, RotateCcw } from "lucide-react"
import Script from "next/script"

// Declare global types for MediaPipe and TensorFlow.js Pose Detection
declare global {
  interface Window {
    poseDetection: {
      SupportedModels: {
        BlazePose: string;
        MoveNet: string;
        PoseNet: string;
      };
      createDetector: (model: string, config: any) => Promise<any>;
    };
  }
}

export default function ExerciseCorrectionJS() {
  const { t } = useTranslation()
  const [isRecording, setIsRecording] = useState(false)
  const [exerciseType, setExerciseType] = useState("push-up")
  const [feedback, setFeedback] = useState<any>(null)
  const [repCount, setRepCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [detectionQuality, setDetectionQuality] = useState<'poor'|'good'|'excellent'|'unknown'>('unknown')
  const [isLoading, setIsLoading] = useState(true) // Start with loading state
  
  // Debug configuration options
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.4) // Lower threshold for better detection
  const [detectionModelType, setDetectionModelType] = useState<'full'|'lite'|'heavy'>('full')
  const [loadAttempts, setLoadAttempts] = useState(0)
  
  // Handle script loading with retry mechanism
  const handleScriptLoad = () => {
    console.log('TensorFlow.js pose detection loaded')
    setMediaLoaded(true)
    setIsLoading(false)
  }
  
  const handleScriptError = () => {
    console.error('Script loading failed')
    if (loadAttempts < 3) {
      console.log(`Retrying script load (attempt ${loadAttempts + 1})`)
      setLoadAttempts(prev => prev + 1)
      // Re-trigger script loading by forcing a remount of the script
      setMediaLoaded(false)
      setTimeout(() => setMediaLoaded(true), 1000)
    } else {
      setErrorMessage('Failed to load required libraries. Please check your internet connection and try again.')
      setIsLoading(false)
    }
  }
  
  // Script elements for loading TensorFlow.js and MediaPipe
  const scriptElements = (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.2.0"
        onLoad={() => console.log('TensorFlow.js core loaded')}
        onError={handleScriptError}
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.2.0"
        onLoad={() => console.log('TensorFlow.js converter loaded')}
        onError={handleScriptError}
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.2.0"
        onLoad={() => console.log('TensorFlow.js WebGL backend loaded')}
        onError={handleScriptError}
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mediapipe/pose"
        onLoad={() => console.log('MediaPipe pose loaded')}
        onError={handleScriptError}
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
      />
    </>
  )
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const poseRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const lastPoseRef = useRef<any>(null) // Store last good pose
  
  // Available exercises
  const exercises = [
    { id: "push-up", name: t("push_up") },
    { id: "squat", name: t("squat") },
    { id: "sit-up", name: t("sit_up") },
    { id: "pull-up", name: t("pull_up") }
  ]
  
  // Initialize Pose Detection
  useEffect(() => {
    if (!window.poseDetection) {
      console.warn('Pose detection library not loaded yet')
      return
    }
    
    const runPoseDetection = async () => {
      try {
        console.log('Starting pose detector initialization')
        
        // First try to initialize BlazePose
        try {
          console.log('Attempting to initialize BlazePose...')
          const model = window.poseDetection.SupportedModels.BlazePose
          
          // Configure the BlazePose detector
          const detectorConfig = {
            runtime: 'tfjs', // Use tfjs runtime instead of mediapipe
            modelType: detectionModelType,
            enableSmoothing: true,
            smoothingConfig: {
              velocityFilter: {
                windowSize: 5,
                velocityScale: 10,
                minAllowedObjectScale: 1e-6,
              }
            }
          }
          
          poseRef.current = await window.poseDetection.createDetector(model, detectorConfig)
          console.log('BlazePose model successfully initialized with TensorFlow.js backend')
        } 
        // If BlazePose fails, try MoveNet as fallback
        catch (e) {
          console.warn('BlazePose initialization failed, trying MoveNet as fallback:', e)
          
          const model = window.poseDetection.SupportedModels.MoveNet
          const detectorConfig = {
            modelType: 'lightning', // 'lightning' is faster, 'thunder' is more accurate
            enableSmoothing: true,
            minPoseScore: 0.25 // Lower threshold to detect poses more easily
          }
          
          poseRef.current = await window.poseDetection.createDetector(model, detectorConfig)
          console.log('MoveNet model successfully initialized as fallback')
        }
        
        // Clear any previous errors once successfully initialized
        setErrorMessage('') 
        console.log('Pose detection initialized successfully')
      } catch (error) {
        console.error('Failed to initialize any pose detection model:', error)
        setErrorMessage(
          'Failed to initialize exercise tracking. Please ensure you have a stable internet connection and try reloading.'
        )
      }
    }
    
    // Only run pose detection when media scripts are fully loaded
    if (mediaLoaded) {
      console.log('Media loaded, initializing pose detection')
      runPoseDetection()
    }
  }, [mediaLoaded, detectionModelType])
  
  // Start camera when user clicks the button
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
            setIsRecording(true)
            startAnalysis()
          }
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setErrorMessage(t("camera_access_error"))
    }
  }
  
  // Stop camera and clean up
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    setIsRecording(false)
    setFeedback(null)
  }
  
  // Start analyzing poses
  const startAnalysis = () => {
    if (!poseRef.current || !videoRef.current) return
    
    let frameCount = 0
    let errorCount = 0
    const maxConsecutiveErrors = 5
    
    const detectPose = async () => {
      if (!videoRef.current || !canvasRef.current || !isRecording) return
      
      try {
        // Get pose landmarks
        const poses = await poseRef.current.estimatePoses(videoRef.current, {
          flipHorizontal: false,
          maxPoses: 1
        })
        
        // Reset error counter on success
        errorCount = 0
        frameCount++
        
        if (poses && poses.length > 0) {
          const pose = poses[0]
          
          // Check if the pose has keypoints property
          if (!pose.keypoints || !Array.isArray(pose.keypoints)) {
            console.warn('Invalid pose format received:', pose)
            setDetectionQuality('poor')
            
            if (lastPoseRef.current) {
              // Use the last good pose for drawing to avoid flickering
              drawPose(lastPoseRef.current, canvasRef.current)
            }
          } else {
            // Check if we have enough keypoints with good confidence
            const visibleKeypoints = pose.keypoints.filter((kp: any) => kp.score > confidenceThreshold).length
            const totalKeypoints = pose.keypoints.length
            const visibilityRatio = visibleKeypoints / totalKeypoints
            
            // Update detection quality
            if (visibilityRatio > 0.8) {
              setDetectionQuality('excellent')
            } else if (visibilityRatio > 0.6) {
              setDetectionQuality('good')
            } else {
              setDetectionQuality('poor')
            }
            
            // Only use the pose if we have enough keypoints with good confidence
            if (visibilityRatio > 0.5) {
              // Store this good pose
              lastPoseRef.current = pose
              
              // Draw pose on canvas
              drawPose(pose, canvasRef.current)
              
              // Analyze the pose based on exercise type
              const result = analyzeExerciseForm(pose, exerciseType)
              setFeedback(result)
              
              // Update rep count if a rep was completed
              if (result.repCompleted) {
                setRepCount(prevCount => prevCount + 1)
              }
            } else if (lastPoseRef.current) {
              // Use the last good pose for drawing to avoid flickering
              drawPose(lastPoseRef.current, canvasRef.current)
            }
          }
        } else {
          setDetectionQuality('poor')
          if (lastPoseRef.current && canvasRef.current) {
            // Use the last good pose for drawing to avoid flickering
            drawPose(lastPoseRef.current, canvasRef.current)
          }
        }
      } catch (error) {
        console.error('Error during pose detection:', error)
        errorCount++
        
        // If we get too many consecutive errors, show an error message
        if (errorCount >= maxConsecutiveErrors) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          setErrorMessage(`Detection error: ${errorMsg}. Try refreshing.`)
        }
        
        // Still try to use the last good pose for drawing
        if (lastPoseRef.current && canvasRef.current) {
          drawPose(lastPoseRef.current, canvasRef.current)
        }
      }
      
      // Continue analyzing frames if still recording
      if (isRecording) {
        requestAnimationFrame(detectPose)
      }
    }
    
    detectPose()
  }
  
  // Draw the pose on the canvas
  const drawPose = (pose: any, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx || !videoRef.current) return
    
    // Set canvas size to match video
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // First draw the video frame
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    
    // Apply a semi-transparent dark overlay to make the skeleton more visible
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Then draw pose landmarks
    if (pose.keypoints) {
      // Define skeleton connections for human pose with specific colors for different body parts
      const connections = [
        // Torso - red
        { from: 'left_shoulder', to: 'right_shoulder', color: '#FF0000' },
        { from: 'left_shoulder', to: 'left_hip', color: '#FF0000' },
        { from: 'right_shoulder', to: 'right_hip', color: '#FF0000' },
        { from: 'left_hip', to: 'right_hip', color: '#FF0000' },
        
        // Arms - green
        { from: 'left_shoulder', to: 'left_elbow', color: '#00FF00' },
        { from: 'right_shoulder', to: 'right_elbow', color: '#00FF00' },
        { from: 'left_elbow', to: 'left_wrist', color: '#00FF00' },
        { from: 'right_elbow', to: 'right_wrist', color: '#00FF00' },
        
        // Legs - blue
        { from: 'left_hip', to: 'left_knee', color: '#0000FF' },
        { from: 'right_hip', to: 'right_knee', color: '#0000FF' },
        { from: 'left_knee', to: 'left_ankle', color: '#0000FF' },
        { from: 'right_knee', to: 'right_ankle', color: '#0000FF' }
      ]
      
      // Create a keypoint lookup for easy access
      const keypointLookup: {[key: string]: any} = {}
      
      // Map keypoint names for different model formats
      pose.keypoints.forEach((keypoint: any) => {
        const name = keypoint.name || keypoint.part || ''
        keypointLookup[name] = keypoint
        
        // Map common alternative naming schemes
        if (name.includes('shoulder')) keypointLookup[name.includes('left') ? 'left_shoulder' : 'right_shoulder'] = keypoint
        if (name.includes('elbow')) keypointLookup[name.includes('left') ? 'left_elbow' : 'right_elbow'] = keypoint
        if (name.includes('wrist')) keypointLookup[name.includes('left') ? 'left_wrist' : 'right_wrist'] = keypoint
        if (name.includes('hip')) keypointLookup[name.includes('left') ? 'left_hip' : 'right_hip'] = keypoint
        if (name.includes('knee')) keypointLookup[name.includes('left') ? 'left_knee' : 'right_knee'] = keypoint
        if (name.includes('ankle')) keypointLookup[name.includes('left') ? 'left_ankle' : 'right_ankle'] = keypoint
      })
      
      // Try to find keypoints by index if names are not available
      if (Object.keys(keypointLookup).length < 10 && pose.keypoints.length >= 17) {
        // Common indices in TF.js pose detection models
        const indexMap = {
          'nose': 0,
          'left_eye': 1, 'right_eye': 2,
          'left_ear': 3, 'right_ear': 4,
          'left_shoulder': 5, 'right_shoulder': 6,
          'left_elbow': 7, 'right_elbow': 8,
          'left_wrist': 9, 'right_wrist': 10,
          'left_hip': 11, 'right_hip': 12,
          'left_knee': 13, 'right_knee': 14,
          'left_ankle': 15, 'right_ankle': 16
        }
        
        // Map keypoints by index
        Object.entries(indexMap).forEach(([name, index]) => {
          if (pose.keypoints[index]) {
            keypointLookup[name] = pose.keypoints[index]
          }
        })
      }
      
      // Draw angles at joints for exercise form analysis - this is the key part for analytics
      const drawJointAngle = (center: string, from: string, to: string) => {
        const centerPoint = keypointLookup[center]
        const fromPoint = keypointLookup[from]
        const toPoint = keypointLookup[to]
        
        if (centerPoint && fromPoint && toPoint &&
            centerPoint.score > confidenceThreshold &&
            fromPoint.score > confidenceThreshold &&
            toPoint.score > confidenceThreshold) {
          const angle = calculateAngle(fromPoint, centerPoint, toPoint)
          
          // Draw arc to show the angle
          ctx.beginPath()
          ctx.arc(centerPoint.x, centerPoint.y, 20, 
                  Math.atan2(fromPoint.y - centerPoint.y, fromPoint.x - centerPoint.x),
                  Math.atan2(toPoint.y - centerPoint.y, toPoint.x - centerPoint.x), false)
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Draw angle text
          ctx.font = '14px Arial'
          ctx.fillStyle = 'white'
          ctx.textAlign = 'center'
          ctx.fillText(`${angle}°`, centerPoint.x, centerPoint.y - 25)
        }
      }
      
      // Draw connections with proper colors and glowing effect for better visibility
      connections.forEach(connection => {
        const start = keypointLookup[connection.from]
        const end = keypointLookup[connection.to]
        
        if (start && end && 
            start.score > confidenceThreshold && 
            end.score > confidenceThreshold) {
          // Draw line with glow effect
          ctx.beginPath()
          ctx.moveTo(start.x, start.y)
          ctx.lineTo(end.x, end.y)
          ctx.strokeStyle = connection.color
          ctx.lineWidth = 4
          ctx.shadowColor = connection.color
          ctx.shadowBlur = 10
          ctx.stroke()
          
          // Reset shadow for next elements
          ctx.shadowBlur = 0
        }
      })
      
      // Calculate and display critical joint angles based on exercise type
      if (exerciseType === 'push-up') {
        // For push-ups, highlight elbow angles and back alignment
        drawJointAngle('left_elbow', 'left_shoulder', 'left_wrist')
        drawJointAngle('right_elbow', 'right_shoulder', 'right_wrist')
        
        // Draw back alignment line
        const shoulder = keypointLookup['right_shoulder'] || keypointLookup['left_shoulder']
        const hip = keypointLookup['right_hip'] || keypointLookup['left_hip']
        const ankle = keypointLookup['right_ankle'] || keypointLookup['left_ankle']
        
        if (shoulder && hip && ankle && 
            shoulder.score > confidenceThreshold && 
            hip.score > confidenceThreshold && 
            ankle.score > confidenceThreshold) {
          ctx.beginPath()
          ctx.moveTo(shoulder.x, shoulder.y)
          ctx.lineTo(hip.x, hip.y)
          ctx.lineTo(ankle.x, ankle.y)
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      } 
      else if (exerciseType === 'squat') {
        // For squats, highlight knee angles and hip depth
        drawJointAngle('left_knee', 'left_hip', 'left_ankle')
        drawJointAngle('right_knee', 'right_hip', 'right_ankle')
        drawJointAngle('left_hip', 'left_shoulder', 'left_knee')
        drawJointAngle('right_hip', 'right_shoulder', 'right_knee')
      }
      else if (exerciseType === 'pull-up') {
        // For pull-ups, highlight arm angles
        drawJointAngle('left_elbow', 'left_shoulder', 'left_wrist')
        drawJointAngle('right_elbow', 'right_shoulder', 'right_wrist')
      }
      
      // Draw keypoints with specific colors based on body part and with more OpenCV-like appearance
      pose.keypoints.forEach((keypoint: any) => {
        if (keypoint.score > confidenceThreshold) {
          const name = keypoint.name || keypoint.part || ''
          let color = '#00FF00' // Default green
          
          // Color-code different body parts
          if (name.includes('shoulder') || name.includes('hip')) color = '#FF0000' // Red for torso
          else if (name.includes('knee') || name.includes('ankle')) color = '#0000FF' // Blue for legs
          else if (name.includes('wrist') || name.includes('elbow')) color = '#00FF00' // Green for arms
          
          // Draw point with glow effect - similar to OpenCV visualization
          ctx.beginPath()
          ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI)
          ctx.fillStyle = color
          ctx.fill()
          ctx.lineWidth = 2
          ctx.strokeStyle = 'white'
          ctx.stroke()
          
          // In debug mode, show additional information
          if (showDebug) {
            ctx.fillStyle = 'white'
            ctx.strokeStyle = 'black'
            ctx.lineWidth = 1
            ctx.font = '10px Arial'
            ctx.textAlign = 'center'
            
            // Draw the keypoint name
            const displayName = name.split('_').pop() || 'point'
            ctx.strokeText(displayName, keypoint.x, keypoint.y - 15)
            ctx.fillText(displayName, keypoint.x, keypoint.y - 15)
            
            // Draw confidence score
            const scoreText = `${Math.round(keypoint.score * 100)}%`
            ctx.strokeText(scoreText, keypoint.x, keypoint.y - 5)
            ctx.fillText(scoreText, keypoint.x, keypoint.y - 5)
          }
        }
      })
      
      // Display status information
      const statusDisplay = () => {
        const padding = 10
        const width = 200
        const lineHeight = 20
        const lines = [
          `Model: ${pose.id ? pose.id.split('/').pop() : 'TensorFlow.js Pose'}`,
          `Quality: ${detectionQuality.toUpperCase()}`,
          `Exercise: ${exerciseType}`,
          `Position: ${feedback?.position || 'unknown'}`
        ]
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(padding, padding, width, padding + lines.length * lineHeight)
        
        // Draw text
        ctx.fillStyle = 'white'
        ctx.font = '12px Arial'
        ctx.textAlign = 'left'
        lines.forEach((line, i) => {
          ctx.fillText(line, padding + 10, padding + 15 + (i * lineHeight))
        })
      }
      
      statusDisplay()
      
      // Draw score gauge similar to OpenCV demos
      const drawQualityGauge = () => {
        const scoreValue = detectionQuality === 'excellent' ? 0.9 : 
                           detectionQuality === 'good' ? 0.7 : 
                           detectionQuality === 'poor' ? 0.3 : 0
        
        const width = 150
        const height = 20
        const x = canvas.width - width - 20
        const y = 20
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(x - 10, y - 10, width + 20, height + 30)
        
        // Draw label
        ctx.fillStyle = 'white'
        ctx.font = '12px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('Detection Quality', x, y - 2)
        
        // Draw empty gauge
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillRect(x, y + 10, width, height)
        
        // Draw filled gauge
        const fillWidth = width * scoreValue
        const gaugeColor = scoreValue > 0.8 ? '#00FF00' : 
                           scoreValue > 0.5 ? '#FFFF00' : '#FF0000'
        
        ctx.fillStyle = gaugeColor
        ctx.fillRect(x, y + 10, fillWidth, height)
        
        // Draw percentage
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.fillText(`${Math.round(scoreValue * 100)}%`, x + width / 2, y + 25)
      }
      
      drawQualityGauge()
    }
  }
  
  // Reset the analysis
  const resetAnalysis = () => {
    setFeedback(null)
    setRepCount(0)
  }
  
  // Calculate angle between three points
  const calculateAngle = (a: any, b: any, c: any) => {
    if (!a || !b || !c) return 0
    
    // Convert to radians
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - 
                    Math.atan2(a.y - b.y, a.x - b.x)
                    
    // Convert to degrees
    let angle = Math.abs(radians * 180.0 / Math.PI)
    
    // Ensure angle is less than 180 degrees
    if (angle > 180.0) {
      angle = 360 - angle
    }
    
    return Math.round(angle)
  }
  
  // Find a keypoint by name with support for different model formats
  const findKeypoint = (pose: any, name: string) => {
    if (!pose.keypoints) return null
    
    // Define alternate names for compatibility with different models
    const alternateNames: {[key: string]: string[]} = {
      'nose': ['nose'],
      'left_eye': ['left_eye', 'leftEye', 'left.eye'],
      'right_eye': ['right_eye', 'rightEye', 'right.eye'],
      'left_ear': ['left_ear', 'leftEar', 'left.ear'],
      'right_ear': ['right_ear', 'rightEar', 'right.ear'],
      'left_shoulder': ['left_shoulder', 'leftShoulder', 'left.shoulder'],
      'right_shoulder': ['right_shoulder', 'rightShoulder', 'right.shoulder'],
      'left_elbow': ['left_elbow', 'leftElbow', 'left.elbow'],
      'right_elbow': ['right_elbow', 'rightElbow', 'right.elbow'],
      'left_wrist': ['left_wrist', 'leftWrist', 'left.wrist'],
      'right_wrist': ['right_wrist', 'rightWrist', 'right.wrist'],
      'left_hip': ['left_hip', 'leftHip', 'left.hip'],
      'right_hip': ['right_hip', 'rightHip', 'right.hip'],
      'left_knee': ['left_knee', 'leftKnee', 'left.knee'],
      'right_knee': ['right_knee', 'rightKnee', 'right.knee'],
      'left_ankle': ['left_ankle', 'leftAnkle', 'left.ankle'],
      'right_ankle': ['right_ankle', 'rightAnkle', 'right.ankle']
    }
    
    // Try to find keypoint by exact name first
    const keypoint = pose.keypoints.find((kp: any) => 
      kp.name === name || kp.part === name
    )
    
    if (keypoint) return keypoint
    
    // If not found, try alternate names
    const alternatives = alternateNames[name] || []
    for (const alt of alternatives) {
      const altKeypoint = pose.keypoints.find((kp: any) => 
        kp.name === alt || kp.part === alt
      )
      if (altKeypoint) return altKeypoint
    }
    
    // Try finding by index if the model doesn't use names
    // Common indices in TF.js pose detection models
    const indices: {[key: string]: number} = {
      'nose': 0,
      'left_eye': 1, 'right_eye': 2,
      'left_ear': 3, 'right_ear': 4,
      'left_shoulder': 5, 'right_shoulder': 6,
      'left_elbow': 7, 'right_elbow': 8,
      'left_wrist': 9, 'right_wrist': 10,
      'left_hip': 11, 'right_hip': 12,
      'left_knee': 13, 'right_knee': 14,
      'left_ankle': 15, 'right_ankle': 16
    }
    
    if (indices[name] !== undefined && pose.keypoints[indices[name]]) {
      return pose.keypoints[indices[name]]
    }
    
    return null
  }
  
  // Calculate distance between two points
  const calculateDistance = (p1: any, p2: any) => {
    if (!p1 || !p2) return 0
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }
  
  // Calculate mean square error for pose alignment
  const calculateMSE = (points: any[], referencePoints: any[]) => {
    if (points.length !== referencePoints.length || points.length === 0) return Infinity
    
    let sumSquaredErrors = 0
    let validPointCount = 0
    
    for (let i = 0; i < points.length; i++) {
      if (points[i] && referencePoints[i] && points[i].score > confidenceThreshold) {
        const dx = points[i].x - referencePoints[i].x
        const dy = points[i].y - referencePoints[i].y
        sumSquaredErrors += (dx * dx) + (dy * dy)
        validPointCount++
      }
    }
    
    return validPointCount > 0 ? sumSquaredErrors / validPointCount : Infinity
  }
  
  // Analyze exercise form with more precise metrics
  const analyzeExerciseForm = (pose: any, exercise: string) => {
    // Get needed keypoints for different exercises
    const leftShoulder = findKeypoint(pose, 'left_shoulder')
    const rightShoulder = findKeypoint(pose, 'right_shoulder')
    const leftElbow = findKeypoint(pose, 'left_elbow')
    const rightElbow = findKeypoint(pose, 'right_elbow')
    const leftWrist = findKeypoint(pose, 'left_wrist')
    const rightWrist = findKeypoint(pose, 'right_wrist')
    const leftHip = findKeypoint(pose, 'left_hip')
    const rightHip = findKeypoint(pose, 'right_hip')
    const leftKnee = findKeypoint(pose, 'left_knee')
    const rightKnee = findKeypoint(pose, 'right_knee')
    const leftAnkle = findKeypoint(pose, 'left_ankle')
    const rightAnkle = findKeypoint(pose, 'right_ankle')
    const nose = findKeypoint(pose, 'nose')
    
    // Analysis variables
    let correctForm = true
    let message = ""
    let position = ""
    let repCompleted = false
    let score = 0
    const angles: {[key: string]: number} = {}
    const criticalPoints: {[key: string]: any} = {}
    
    // Check if we have enough keypoints to analyze
    const criticalKeypoints = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftHip, rightHip]
    const visibleCriticalPoints = criticalKeypoints.filter(kp => kp && kp.score > confidenceThreshold).length
    
    if (visibleCriticalPoints < 4) {
      return {
        posture: {
          correct: false,
          message: "Not enough body parts visible for analysis. Please adjust the camera.",
          score: 0
        },
        angles: {},
        position: "unknown",
        repCompleted: false,
        score: 0
      }
    }
    
    // Persistent state between renders using React state
    const prevFeedback = feedback
    
    // Push-up analysis
    if (exercise === 'push-up') {
      // Calculate angles for key joints
      const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist)
      const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist)
      const leftBodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee)
      const rightBodyAngle = calculateAngle(rightShoulder, rightHip, rightKnee)
      
      // Store the calculated angles
      angles.leftArm = leftArmAngle
      angles.rightArm = rightArmAngle
      angles.leftBody = leftBodyAngle
      angles.rightBody = rightBodyAngle
      
      // Determine position using the average arm angle (more reliable indicator)
      const avgArmAngle = (leftArmAngle + rightArmAngle) / 2
      const isDown = avgArmAngle < 90
      position = isDown ? "down" : "up"
      
      // Create a score for the exercise based on key metrics
      let formScore = 100 // Start with perfect score
      let bodyAlignmentScore = 100
      let armAngleScore = 100
      
      // Body alignment analysis
      const idealBodyAngle = 170 // Close to 180 degrees for straight body
      const bodyAngleDeviation = Math.abs(idealBodyAngle - ((leftBodyAngle + rightBodyAngle) / 2))
      if (bodyAngleDeviation > 30) {
        bodyAlignmentScore = Math.max(0, 100 - bodyAngleDeviation * 2)
        correctForm = false
        if ((leftBodyAngle + rightBodyAngle) / 2 < 150) {
          message = "Hips are sagging. Keep your body in a straight line."
        } else {
          message = "Body is piking up. Keep a straight line from head to heels."
        }
      }
      
      // Arm angle analysis for proper depth
      if (isDown) {
        const idealDownAngle = 70 // Ideal angle at bottom of push-up
        const armAngleDeviation = Math.abs(idealDownAngle - avgArmAngle)
        if (armAngleDeviation > 20) {
          armAngleScore = Math.max(0, 100 - armAngleDeviation * 2.5)
          if (avgArmAngle > 90) {
            correctForm = false
            message = "Not going low enough. Lower your chest closer to the ground."
          } else if (avgArmAngle < 50) {
            correctForm = false
            message = "You're going too low, which can strain your shoulders."
          }
        }
      } else {
        const idealUpAngle = 160 // Ideal angle at top of push-up (fully extended)
        const armAngleDeviation = Math.abs(idealUpAngle - avgArmAngle)
        if (armAngleDeviation > 20) {
          armAngleScore = Math.max(0, 100 - armAngleDeviation * 2.5)
          correctForm = false
          message = "Extend your arms fully at the top of the push-up."
        }
      }
      
      // Check for rep completion
      if (prevFeedback && prevFeedback.position === "down" && position === "up") {
        repCompleted = true
      }
      
      // Calculate overall score
      score = Math.round((bodyAlignmentScore * 0.5) + (armAngleScore * 0.5))
      
      // If no issues found, provide positive feedback
      if (correctForm) {
        message = isDown 
          ? "Good form. Push through your palms to return to starting position."
          : "Good form. Bend elbows and lower your body with control."
      }
    }
    
    // Squat analysis
    else if (exercise === 'squat') {
      // Calculate key angles for squat analysis
      const leftLegAngle = calculateAngle(leftHip, leftKnee, leftAnkle)
      const rightLegAngle = calculateAngle(rightHip, rightKnee, rightAnkle)
      const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee)
      const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee)
      
      // Store the calculated angles
      angles.leftLeg = leftLegAngle
      angles.rightLeg = rightLegAngle
      angles.leftHip = leftHipAngle
      angles.rightHip = rightHipAngle
      
      // Determine position using average leg angle
      const avgLegAngle = (leftLegAngle + rightLegAngle) / 2
      const isDown = avgLegAngle < 120
      position = isDown ? "down" : "up"
      
      // Create scoring components for the squat
      let formScore = 100
      let kneeAlignmentScore = 100
      let depthScore = 100
      let hipHingeScore = 100
      
      // Check if enough keypoints are visible for knee alignment analysis
      if (leftKnee && leftAnkle && rightKnee && rightAnkle) {
        // Check knee-to-toe alignment (knees should not go far beyond toes)
        const leftKneeOverToe = leftKnee.x - leftAnkle.x
        const rightKneeOverToe = rightKnee.x - rightAnkle.x
        
        if (leftKneeOverToe > 30 || rightKneeOverToe > 30) {
          kneeAlignmentScore = Math.max(0, 100 - Math.max(leftKneeOverToe, rightKneeOverToe))
          correctForm = false
          message = "Knees are too far forward over your toes. Sit back more."
        }
      }
      
      // Check squat depth when in down position
      if (isDown) {
        // Ideal squat angle is around 90 degrees at the knee
        const idealKneeAngle = 90
        const kneeAngleDeviation = Math.abs(idealKneeAngle - avgLegAngle)
        
        if (kneeAngleDeviation > 15) {
          depthScore = Math.max(0, 100 - kneeAngleDeviation * 3)
          correctForm = false
          
          if (avgLegAngle > 110) {
            message = "Squat deeper for full range of motion. Aim for 90° at the knees."
          } else if (avgLegAngle < 70) {
            message = "You're squatting too deep which can strain your knees."
          }
        }
      } else {
        // Check if standing fully upright at top of squat
        const idealLegAngle = 170
        const legAngleDeviation = Math.abs(idealLegAngle - avgLegAngle)
        
        if (legAngleDeviation > 15) {
          depthScore = Math.max(0, 100 - legAngleDeviation * 3)
          correctForm = false
          message = "Stand fully upright at the top of the squat."
        }
      }
      
      // Check hip hinge for proper squat mechanics
      const avgHipAngle = (leftHipAngle + rightHipAngle) / 2
      if (isDown && avgHipAngle < 80) {
        hipHingeScore = Math.max(0, 100 - (80 - avgHipAngle) * 2)
        correctForm = false
        message = "Bend more at the hips and push your buttocks back."
      }
      
      // Check for rep completion
      if (prevFeedback && prevFeedback.position === "down" && position === "up") {
        repCompleted = true
      }
      
      // Calculate overall score
      score = Math.round((kneeAlignmentScore * 0.4) + (depthScore * 0.4) + (hipHingeScore * 0.2))
      
      // If no issues found, provide positive feedback
      if (correctForm) {
        message = isDown 
          ? "Good squat depth. Drive through your heels to stand up."
          : "Good form. Now bend knees and hips to lower into a squat."
      }
    }
    
    // Pull-up analysis
    else if (exercise === 'pull-up') {
      // Calculate key angles for pull-up analysis
      const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist)
      const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist)
      
      // Store the calculated angles
      angles.leftArm = leftArmAngle
      angles.rightArm = rightArmAngle
      
      // Determine position using the average arm angle
      const avgArmAngle = (leftArmAngle + rightArmAngle) / 2
      const isUp = avgArmAngle < 80
      position = isUp ? "up" : "down"
      
      // Create scoring components for pull-up analysis
      let formScore = 100
      let armAngleScore = 100
      let bodyAlignmentScore = 100
      
      // Check arm angle for proper pull-up mechanics
      if (isUp) {
        // Ideal arm angle at top of pull-up (less than 45 degrees)
        const idealUpAngle = 45
        const armAngleDeviation = Math.abs(avgArmAngle - idealUpAngle)
        
        if (armAngleDeviation > 20) {
          armAngleScore = Math.max(0, 100 - armAngleDeviation * 2)
          
          if (avgArmAngle > 65) {
            correctForm = false
            message = "Pull higher to get your chin over the bar."
          }
        }
      } else {
        // Ideal arm angle at bottom (should be close to straight)
        const idealDownAngle = 160
        const armAngleDeviation = Math.abs(avgArmAngle - idealDownAngle)
        
        if (armAngleDeviation > 20) {
          armAngleScore = Math.max(0, 100 - armAngleDeviation * 2)
          correctForm = false
          message = "Lower all the way down with control for full range of motion."
        }
      }
      
      // Check body alignment during pull-up (should be straight)
      if (leftHip && rightHip && leftShoulder && rightShoulder) {
        const shoulderMidpoint = {
          x: (leftShoulder.x + rightShoulder.x) / 2,
          y: (leftShoulder.y + rightShoulder.y) / 2
        }
        
        const hipMidpoint = {
          x: (leftHip.x + rightHip.x) / 2,
          y: (leftHip.y + rightHip.y) / 2
        }
        
        // Check for excessive horizontal distance (swinging or kipping)
        const horizontalDeviation = Math.abs(shoulderMidpoint.x - hipMidpoint.x)
        // Get canvas width from current video dimensions
        const canvasWidth = videoRef.current?.videoWidth || 640
        const normalizedDeviation = horizontalDeviation / canvasWidth * 100
        
        if (normalizedDeviation > 5) {
          bodyAlignmentScore = Math.max(0, 100 - normalizedDeviation * 5)
          correctForm = false
          message = "Keep your body straight. Avoid swinging or kipping."
        }
      }
      
      // Check for rep completion
      if (prevFeedback && prevFeedback.position === "down" && position === "up") {
        repCompleted = true
      }
      
      // Calculate overall score
      score = Math.round((armAngleScore * 0.6) + (bodyAlignmentScore * 0.4))
      
      // If no issues found, provide positive feedback
      if (correctForm) {
        message = isUp
          ? "Good form at the top. Now lower with control."
          : "Good form. Engage your back and pull yourself up."
      }
    }
    
    // Sit-up analysis
    else if (exercise === 'sit-up') {
      // Calculate midpoints for shoulders, hips, and knees
      const shoulderMidpoint = {
        x: (leftShoulder?.x || 0 + rightShoulder?.x || 0) / 2,
        y: (leftShoulder?.y || 0 + rightShoulder?.y || 0) / 2
      }
      
      const hipMidpoint = {
        x: (leftHip?.x || 0 + rightHip?.x || 0) / 2,
        y: (leftHip?.y || 0 + rightHip?.y || 0) / 2
      }
      
      const kneeMidpoint = {
        x: (leftKnee?.x || 0 + rightKnee?.x || 0) / 2,
        y: (leftKnee?.y || 0 + rightKnee?.y || 0) / 2
      }
      
      // Calculate torso angle relative to ground
      let torsoAngle = 0
      if (shoulderMidpoint && hipMidpoint) {
        const dx = shoulderMidpoint.x - hipMidpoint.x
        const dy = shoulderMidpoint.y - hipMidpoint.y
        torsoAngle = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI)
      }
      
      angles.torso = Math.round(torsoAngle)
      
      // Calculate leg angle
      const legAngle = calculateAngle(
        hipMidpoint,
        kneeMidpoint, 
        { x: (leftAnkle?.x || 0 + rightAnkle?.x || 0) / 2, y: (leftAnkle?.y || 0 + rightAnkle?.y || 0) / 2 }
      )
      
      angles.legs = legAngle
      
      // Determine position based on torso angle
      const isUp = torsoAngle < 45
      position = isUp ? "up" : "down"
      
      // Create scoring components for sit-up analysis
      let formScore = 100
      let torsoAngleScore = 100
      let legAngleScore = 100
      
      // Check torso position
      if (isUp) {
        // For up position, torso should be close to vertical
        const idealUpAngle = 20
        const torsoAngleDeviation = Math.abs(torsoAngle - idealUpAngle)
        
        if (torsoAngleDeviation > 15) {
          torsoAngleScore = Math.max(0, 100 - torsoAngleDeviation * 3)
          
          if (torsoAngle > 40) {
            correctForm = false
            message = "Sit all the way up to complete the rep properly."
          }
        }
      } else {
        // For down position, torso should be almost horizontal
        const idealDownAngle = 80
        const torsoAngleDeviation = Math.abs(torsoAngle - idealDownAngle)
        
        if (torsoAngleDeviation > 15) {
          torsoAngleScore = Math.max(0, 100 - torsoAngleDeviation * 3)
          
          if (torsoAngle < 60) {
            correctForm = false
            message = "Lower your upper body more for full range of motion."
          }
        }
      }
      
      // Check leg position - legs should be at about 90 degrees
      const idealLegAngle = 90
      const legAngleDeviation = Math.abs(legAngle - idealLegAngle)
      
      if (legAngleDeviation > 20) {
        legAngleScore = Math.max(0, 100 - legAngleDeviation * 2)
        correctForm = false
        
        if (legAngle < 70) {
          message = "Your legs are too close to your body. Keep knees at 90 degrees."
        } else if (legAngle > 110) {
          message = "Your legs are too straight. Bend your knees to about 90 degrees."
        }
      }
      
      // Check for rep completion
      if (prevFeedback && prevFeedback.position === "down" && position === "up") {
        repCompleted = true
      }
      
      // Calculate overall score
      score = Math.round((torsoAngleScore * 0.7) + (legAngleScore * 0.3))
      
      // If no issues found, provide positive feedback
      if (correctForm) {
        message = isUp
          ? "Good form at the top. Now lower with control."
          : "Good form. Now curl your upper body up using your abdominals."
      }
    }
    
    // Return comprehensive analysis results
    return {
      posture: {
        correct: correctForm,
        message: message,
        score: score
      },
      angles: angles,
      position: position,
      repCompleted: repCompleted,
      score: score
    }
  }
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])
  
  return (
    <Card className="w-full">
      {/* Include script elements at the top level of the component */}
      {scriptElements}
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Exercise Correction
        </CardTitle>
        <CardDescription>
          {t("exercise_correction_description")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-center text-gray-600 dark:text-gray-300">
              Loading exercise tracking system...
              {loadAttempts > 0 && <span className="block mt-2 text-sm">Attempt {loadAttempts + 1}/4</span>}
            </p>
          </div>
        )}
        
        {!isLoading && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side exercise selection panel */}
            <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-3">Select Exercise Mode</h3>
                <div className="grid grid-cols-1 gap-2">
                  {exercises.map(exercise => (
                    <Button
                      key={exercise.id}
                      onClick={() => setExerciseType(exercise.id)}
                      variant={exerciseType === exercise.id ? "default" : "outline"}
                      className={`w-full justify-start ${exerciseType === exercise.id ? "bg-green-500 hover:bg-green-600" : ""}`}
                      disabled={isRecording}
                    >
                      {exercise.name}
                    </Button>
                  ))}
                  <Button
                    variant={exerciseType === "bicep-curl" ? "default" : "outline"}
                    className={`w-full justify-start ${exerciseType === "bicep-curl" ? "bg-green-500 hover:bg-green-600" : ""}`}
                    onClick={() => setExerciseType("bicep-curl")}
                    disabled={isRecording}
                  >
                    Bicep Curl
                  </Button>
                  <Button
                    variant={exerciseType === "plank" ? "default" : "outline"}
                    className={`w-full justify-start ${exerciseType === "plank" ? "bg-green-500 hover:bg-green-600" : ""}`}
                    onClick={() => setExerciseType("plank")}
                    disabled={isRecording}
                  >
                    Plank
                  </Button>
                  <Button
                    variant={exerciseType === "lunge" ? "default" : "outline"}
                    className={`w-full justify-start ${exerciseType === "lunge" ? "bg-green-500 hover:bg-green-600" : ""}`}
                    onClick={() => setExerciseType("lunge")}
                    disabled={isRecording}
                  >
                    Lunge
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">Controls</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    onClick={isRecording ? stopCamera : startCamera}
                    className={isRecording ? "bg-red-500 hover:bg-red-600 w-full" : "w-full"}
                    disabled={!mediaLoaded}
                  >
                    {isRecording ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" /> {t("stop_camera")}
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" /> {t("start_camera")}
                      </>
                    )}
                  </Button>
                  
                  {isRecording && (
                    <>
                      <Button variant="outline" onClick={resetAnalysis} className="w-full">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Reps
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowDebug(!showDebug)}
                        className={`w-full ${showDebug ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                      >
                        {showDebug ? "Hide" : "Show"} Debug
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Rep count display */}
              {isRecording && (
                <div className="mt-6 p-4 bg-black/10 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-center">
                    <h3 className="font-semibold mb-1">Rep Count</h3>
                    <div className="text-4xl font-bold">{repCount}</div>
                    <div className="mt-2">
                      <Button variant="outline" onClick={() => setRepCount(0)} className="w-full text-sm">
                        Reset Count
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right side camera view and analysis */}
            <div className="w-full md:w-3/4">
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <div className="relative flex flex-col items-center">
                <div ref={containerRef} className="relative w-full max-w-full bg-gray-100 dark:bg-gray-800 aspect-video rounded-lg overflow-hidden">
                  {/* Video element (hidden but used for pose detection) */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover opacity-0"
                  />
                  
                  {/* Canvas for drawing pose */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {!isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="h-20 w-20 text-gray-400" />
                    </div>
                  )}
            
            {/* Detection quality indicator overlay */}
            {isRecording && (
              <div className="absolute top-0 right-0 m-4 p-3 bg-black/70 text-white rounded">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    detectionQuality === 'excellent' ? 'bg-green-500' :
                    detectionQuality === 'good' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm capitalize">Detection: {detectionQuality}</span>
                </div>
              </div>
            )}
            
            {/* Rep Counter overlay */}
            {isRecording && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/70 text-white flex justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold">Rep Count: {repCount}</div>
                  <Button onClick={() => setRepCount(0)} size="sm" className="mt-1 bg-red-500 hover:bg-red-600">
                    Reset Reps
                  </Button>
                </div>
              </div>
            )}
                </div>
                
                {/* Posture Analysis Results */}
                <div className="mt-4 w-full">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Analysis Results
                  </h3>
                  
                  {/* Score display */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                        {feedback?.score ? `Score: ${feedback.score}` : "No Score"}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Analysis Status</p>
                    </div>
                    
                    {/* Score visualization */}
                    {feedback?.score ? (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-green-500 text-2xl font-bold">
                        {feedback.score}
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-slate-300 text-2xl font-bold text-slate-400">
                        --
                      </div>
                    )}
                  </div>
            
                  {/* Detection Status */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-600 dark:text-red-400">Detection Status</h4>
                    {detectionQuality === 'poor' ? (
                      <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p>Image quality too poor for analysis</p>
                      </div>
                    ) : (
                      feedback?.posture && (
                        <div className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
                          feedback.posture.correct 
                            ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                            : "bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                        }`}>
                          {feedback.posture.correct ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          )}
                          <p>{feedback.posture.message}</p>
                        </div>
                      )
                    )}
                  </div>
                  
                  {/* Recommendations */}
                  {feedback?.posture && !feedback.posture.correct && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-green-600 dark:text-green-400">Recommendations</h4>
                      <div className="mt-2 space-y-2">
                        {feedback.posture.message.split('. ').filter(Boolean).map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p>{tip}.</p>
                          </div>
                        ))}
                        {detectionQuality !== 'excellent' && (
                          <>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <p>Improve lighting conditions</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <p>Stand closer to the camera</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Angles and Position */}
                  {feedback?.angles && Object.keys(feedback.angles).length > 0 && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Joint Angles</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(feedback.angles).map(([name, value]) => (
                          <div key={name} className="flex items-center justify-between bg-white/50 dark:bg-slate-700/50 p-2 rounded">
                            <span className="capitalize">{name}:</span>
                            <span className="font-mono font-medium">{String(value)}°</span>
                          </div>
                        ))}
                      </div>
                      
                      {feedback.position && (
                        <div className="mt-3 flex justify-center">
                          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                            Current Position: <span className="font-semibold capitalize">{feedback.position}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Debug information panel */}
                {isRecording && showDebug && (
                  <div className="mt-4 p-4 rounded-lg w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                      Debug Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-slate-500 dark:text-slate-400">Detection</h4>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded shadow-sm">
                          <div className="flex items-center justify-between">
                            <span>Quality:</span>
                            <span className={`font-medium ${
                              detectionQuality === 'excellent' ? 'text-green-600 dark:text-green-400' :
                              detectionQuality === 'good' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>{detectionQuality.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-slate-500 dark:text-slate-400">Analysis</h4>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded shadow-sm">
                          <div className="flex items-center justify-between">
                            <span>Exercise:</span>
                            <span className="font-medium">{exerciseType}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span>Position:</span>
                            <span className="font-medium">{feedback?.position || 'unknown'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Debug configuration controls */}
                      <div className="md:col-span-2 space-y-2">
                        <h4 className="font-medium text-sm text-slate-500 dark:text-slate-400">Configuration</h4>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded shadow-sm">
                          <div className="space-y-4">
                            {/* Confidence threshold slider */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label htmlFor="confidence-threshold" className="text-sm font-medium">Confidence Threshold:</label>
                                <span className="text-sm font-mono">{confidenceThreshold.toFixed(2)}</span>
                              </div>
                              <input 
                                id="confidence-threshold"
                                type="range" 
                                min="0.1" 
                                max="0.9" 
                                step="0.05"
                                value={confidenceThreshold}
                                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                aria-label="Confidence threshold"
                                title="Adjust confidence threshold for pose detection"
                              />
                            </div>
                            
                            {/* Model type selector */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Model Type:</label>
                              <div className="flex gap-2">
                                {['lite', 'full', 'heavy'].map((type) => (
                                  <button
                                    key={type}
                                    className={`px-3 py-1 text-sm rounded ${
                                      detectionModelType === type
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                    onClick={() => setDetectionModelType(type as 'lite' | 'full' | 'heavy')}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Note: Changing model type requires restarting the camera
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {feedback && (
                        <div className="md:col-span-2 space-y-2">
                          <h4 className="font-medium text-sm text-slate-500 dark:text-slate-400">Raw Data</h4>
                          <div className="p-3 bg-white dark:bg-slate-900 rounded shadow-sm">
                            <pre className="text-xs overflow-auto max-h-40">
                              {JSON.stringify(feedback, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Exercise Tips */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-2">{t("exercise_tips")}:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {exerciseType === "push-up" && (
                      <>
                        <li>{t("push_up_tip_1")}</li>
                        <li>{t("push_up_tip_2")}</li>
                        <li>{t("push_up_tip_3")}</li>
                      </>
                    )}
                    {exerciseType === "squat" && (
                      <>
                        <li>{t("squat_tip_1")}</li>
                        <li>{t("squat_tip_2")}</li>
                        <li>{t("squat_tip_3")}</li>
                      </>
                    )}
                    {exerciseType === "sit-up" && (
                      <>
                        <li>{t("sit_up_tip_1")}</li>
                        <li>{t("sit_up_tip_2")}</li>
                        <li>{t("sit_up_tip_3")}</li>
                      </>
                    )}
                    {exerciseType === "pull-up" && (
                      <>
                        <li>{t("pull_up_tip_1")}</li>
                        <li>{t("pull_up_tip_2")}</li>
                        <li>{t("pull_up_tip_3")}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
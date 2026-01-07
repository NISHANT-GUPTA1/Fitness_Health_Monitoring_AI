"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress" 
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation } from "react-i18next"
import { Camera, Play, Pause, CheckCircle, AlertTriangle, RotateCcw } from "lucide-react"

export default function ExerciseCorrection() {
  const { t } = useTranslation()
  const [isRecording, setIsRecording] = useState(false)
  const [exerciseType, setExerciseType] = useState("push-up")
  const [feedback, setFeedback] = useState<any>(null)
  const [repCount, setRepCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Available exercises
  const exercises = [
    { id: "push-up", name: t("push_up") },
    { id: "squat", name: t("squat") },
    { id: "sit-up", name: t("sit_up") },
    { id: "pull-up", name: t("pull_up") },
    { id: "walk", name: t("walking") }
  ]
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsRecording(true)
        startAnalysis()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setErrorMessage(t("camera_access_error"))
    }
  }
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    setIsRecording(false)
    setFeedback(null)
    setRepCount(0)
  }
  
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && isRecording) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Draw the current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to base64 image
        return canvas.toDataURL('image/jpeg', 0.8)
      }
    }
    return null
  }
  
  const analyzeFrame = async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      
      const response = await fetch("http://localhost:5000/api/analyze-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType,
          image: imageData
        })
      })
      
      if (!response.ok) throw new Error("Server error")
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setFeedback(result)
      
      // Update rep count if it changed and is greater than current
      if (result.repCount !== undefined && result.repCount > 0) {
        setRepCount(prevCount => prevCount + result.repCount)
      }
      
    } catch (error) {
      console.error("Error analyzing frame:", error)
      setErrorMessage(`Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  const startAnalysis = () => {
    // First analyze immediately
    const frame = captureFrame()
    if (frame) analyzeFrame(frame)
    
    // Then analyze frames every 500ms
    intervalRef.current = setInterval(() => {
      if (!isAnalyzing) {
        const frame = captureFrame()
        if (frame) analyzeFrame(frame)
      }
    }, 500)
  }
  
  const resetAnalysis = () => {
    setFeedback(null)
    setRepCount(0)
  }
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {t("exercise_correction")}
        </CardTitle>
        <CardDescription>
          {t("exercise_correction_description")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Select
            value={exerciseType}
            onValueChange={setExerciseType}
            disabled={isRecording}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder={t("select_exercise")} />
            </SelectTrigger>
            <SelectContent>
              {exercises.map(exercise => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={isRecording ? stopCamera : startCamera}
            className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
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
            <Button variant="outline" onClick={resetAnalysis}>
              <RotateCcw className="mr-2 h-4 w-4" /> {t("reset")}
            </Button>
          )}
        </div>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="relative flex flex-col items-center">
          <div className="relative w-full max-w-3xl bg-gray-100 dark:bg-gray-800 aspect-video rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isRecording ? "block" : "hidden"}`}
            />
            
            {!isRecording && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-20 w-20 text-gray-400" />
              </div>
            )}
            
            {/* Hidden canvas for capturing frames */}
            <canvas
              ref={canvasRef}
              width="640"
              height="480"
              className="hidden"
            />
            
            {/* Rep counter overlay */}
            {isRecording && (
              <div className="absolute top-0 right-0 m-4 p-3 bg-black/70 text-white rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-bold text-xl">{t("reps")}: {repCount}</span>
                </div>
              </div>
            )}
            
            {/* Processing indicator */}
            {isAnalyzing && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-center">
                {t("analyzing")}...
              </div>
            )}
          </div>
          
          {/* Posture feedback */}
          {feedback && feedback.posture && (
            <div className={`mt-4 p-4 rounded-lg w-full max-w-3xl ${
              feedback.posture.correct ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"
            }`}>
              <div className="flex items-center gap-3">
                {feedback.posture.correct ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                )}
                <p className="text-lg">
                  {feedback.posture.message}
                </p>
              </div>
              
              {feedback.angles && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(feedback.angles).map(([name, value]) => (
                    <div key={name} className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-2 rounded">
                      <span className="capitalize">{name}:</span>
                      <span className="font-mono">{value}°</span>
                    </div>
                  ))}
                </div>
              )}
              
              {feedback.position && (
                <div className="mt-3 text-center">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                    Position: <span className="font-semibold capitalize">{feedback.position}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
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
            {exerciseType === "walk" && (
              <>
                <li>{t("walking_tip_1")}</li>
                <li>{t("walking_tip_2")}</li>
                <li>{t("walking_tip_3")}</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

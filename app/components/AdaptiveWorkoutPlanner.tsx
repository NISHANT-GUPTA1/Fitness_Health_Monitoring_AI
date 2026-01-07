"use client"

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar, Clock, Target, Zap, Check, Accessibility } from "lucide-react"
import { generateAdaptiveWorkoutPlan } from "@/lib/gemma-api"

type DisabilityType = "mobility" | "visual" | "hearing" | "cognitive" | "other"
type MobilityType = "upperBody" | "lowerBody" | "both"

export default function AdaptiveWorkoutPlanner() {
  const { t } = useTranslation()

  // Basic states
  const [hasDisability, setHasDisability] = useState(false)
  const [disabilityTypes, setDisabilityTypes] = useState<DisabilityType[]>([])
  const [mobilityLimitation, setMobilityLimitation] = useState<MobilityType | "">("")
  const [specificCondition, setSpecificCondition] = useState("")
  const [otherDescription, setOtherDescription] = useState("")
  const [fitnessLevel, setFitnessLevel] = useState("")
  const [workoutDays, setWorkoutDays] = useState<string[]>([])
  const [sessionDuration, setSessionDuration] = useState("")
  const [useEquipment, setUseEquipment] = useState(false)
  const [focusAreas, setFocusAreas] = useState<string[]>([])

  // Plan generation state
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("configure")

  const weekDays = [
    { id: "monday", label: "Monday", short: "Mon" },
    { id: "tuesday", label: "Tuesday", short: "Tue" },
    { id: "wednesday", label: "Wednesday", short: "Wed" },
    { id: "thursday", label: "Thursday", short: "Thu" },
    { id: "friday", label: "Friday", short: "Fri" },
    { id: "saturday", label: "Saturday", short: "Sat" },
    { id: "sunday", label: "Sunday", short: "Sun" },
  ]

  const bodyAreas = [
    { id: "upper-body", label: "Upper Body", icon: "💪" },
    { id: "core", label: "Core Strength", icon: "�" },
    { id: "lower-body", label: "Lower Body", icon: "🦵" },
    { id: "cardio", label: "Cardio", icon: "❤️" },
    { id: "flexibility", label: "Flexibility", icon: "🤸" },
    { id: "balance", label: "Balance", icon: "⚖️" },
  ]

  const handleDayToggle = (dayId: string) => {
    setWorkoutDays((prev) => (prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]))
  }

  const handleDisabilityTypeToggle = (type: DisabilityType) => {
    setDisabilityTypes((prev) => 
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleFocusAreaToggle = (areaId: string) => {
    setFocusAreas((prev) => (prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]))
  }

  const generateWorkoutPlan = async () => {
    setIsGenerating(true)

    try {
      // Determine the primary disability type to send to the API
      let primaryDisabilityType = disabilityTypes[0] || "other"
      
      // Gather relevant information for the API request
      const mobilityLimitations: string[] = []
      if (disabilityTypes.includes("mobility") && mobilityLimitation) {
        mobilityLimitations.push(mobilityLimitation)
      }
      
      // Add specific condition if provided
      if (specificCondition) {
        mobilityLimitations.push(specificCondition)
      }
      
      // Convert focus areas to exercise types
      const preferredExerciseTypes: string[] = focusAreas.map(area => {
        switch(area) {
          case "upper-body": return "Strength Training";
          case "lower-body": return "Leg Exercises";
          case "core": return "Core Training";
          case "cardio": return "Cardiovascular";
          case "flexibility": return "Flexibility";
          case "balance": return "Balance";
          default: return area;
        }
      });
      
      // Prepare API request payload
      const requestPayload = {
        disabilityType: primaryDisabilityType,
        mobilityLimitations: mobilityLimitations,
        preferredExerciseTypes: preferredExerciseTypes,
        sessionDuration: sessionDuration
      }

      console.log("⚙️ Generating adaptive workout plan with parameters:", requestPayload)

      try {
        // Try to use the direct function if available (for testing/development)
        if (typeof generateAdaptiveWorkoutPlan === 'function') {
          const plan = await generateAdaptiveWorkoutPlan(
            primaryDisabilityType,
            mobilityLimitations,
            focusAreas,
            sessionDuration
          )
          setGeneratedPlan(plan)
        } else {
          // Use the API endpoint
          const response = await fetch('/api/adaptive-workout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
          })
          
          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`)
          }
          
          const data = await response.json()
          setGeneratedPlan(data.plan)
        }
        
        // Switch to view tab
        setActiveTab("view-plan")
      } catch (apiError) {
        console.error("API Error:", apiError)
        console.log("Using fallback plan instead")
        
        // Use fallback plan
        setGeneratedPlan(getFallbackPlan())
        setActiveTab("view-plan")
      }
    } catch (error) {
      console.error("Error generating adaptive workout plan:", error)
      alert("Failed to generate adaptive workout plan. Using fallback plan.")
      
      // Use fallback as last resort
      setGeneratedPlan(getFallbackPlan())
      setActiveTab("view-plan")
    } finally {
      setIsGenerating(false)
    }
  }

  const getDayTypeColor = (type: string | undefined) => {
    if (!type) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    if (type.includes("Strength")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    if (type.includes("Cardio")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    if (type.includes("Rest")) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    if (type.includes("Recovery")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (type.includes("Adaptive")) return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  }

  // Example plans for different disability types if API fails
  const examplePlans = {
    mobility: {
      upperBody: {
        name: "Adaptive Lower Body Focus Program",
        duration: "Weekly",
        difficulty: fitnessLevel || "Beginner",
        totalWorkouts: workoutDays.length || 3,
        estimatedCalories: 1200,
        schedule: [
          {
            day: "Monday",
            type: "Adaptive Strength",
            duration: 30,
            exercises: [
              { name: "Seated Shoulder Press", sets: 3, reps: "8-10", rest: "60s", note: "Using resistance bands or light dumbbells" },
              { name: "Seated Lateral Raises", sets: 3, reps: "10-12", rest: "45s" },
              { name: "Modified Push-ups (on wall or elevated surface)", sets: 3, reps: "8-12", rest: "60s" },
              { name: "Seated Core Rotations", sets: 3, reps: "10 each side", rest: "45s" },
              { name: "Hand Grip Exercises", sets: 3, reps: "hold 20s", rest: "30s" }
            ],
            calories: 180,
          },
          {
            day: "Wednesday",
            type: "Adaptive Cardio",
            duration: 25,
            exercises: [
              { name: "Seated Arm Cycling", sets: 1, reps: "10 min", rest: "2 min" },
              { name: "Resistance Band Chest Press", sets: 3, reps: "12-15", rest: "45s" },
              { name: "Seated Rowing Exercise", sets: 3, reps: "12-15", rest: "45s" },
              { name: "Upper Body HIIT (30s work/30s rest)", sets: 5, reps: "30s each", rest: "30s" }
            ],
            calories: 160,
          },
          {
            day: "Friday",
            type: "Adaptive Flexibility",
            duration: 30,
            exercises: [
              { name: "Seated Neck Stretches", sets: 1, reps: "hold 20s each direction", rest: "10s" },
              { name: "Shoulder & Chest Stretch", sets: 1, reps: "hold 30s each side", rest: "15s" },
              { name: "Seated Side Bends", sets: 1, reps: "hold 20s each side", rest: "10s" },
              { name: "Arm & Wrist Stretches", sets: 1, reps: "hold 30s each", rest: "15s" },
              { name: "Seated Deep Breathing", sets: 1, reps: "10 deep breaths", rest: "0s" }
            ],
            calories: 90,
          },
        ]
      },
      lowerBody: {
        name: "Adaptive Upper Body Focus Program",
        duration: "Weekly",
        difficulty: fitnessLevel || "Beginner",
        totalWorkouts: workoutDays.length || 3,
        estimatedCalories: 1350,
        schedule: [
          {
            day: "Monday",
            type: "Adaptive Upper Body Strength",
            duration: 35,
            exercises: [
              { name: "Dumbbell Bench Press", sets: 3, reps: "8-12", rest: "90s" },
              { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "60s" },
              { name: "Seated Overhead Press", sets: 3, reps: "8-10", rest: "60s" },
              { name: "Bicep Curls", sets: 3, reps: "12-15", rest: "45s" },
              { name: "Tricep Extensions", sets: 3, reps: "12-15", rest: "45s" }
            ],
            calories: 220,
          },
          {
            day: "Wednesday",
            type: "Adaptive Core & Cardio",
            duration: 30,
            exercises: [
              { name: "Seated Medicine Ball Twists", sets: 3, reps: "15 each side", rest: "45s" },
              { name: "Modified Crunches", sets: 3, reps: "15-20", rest: "30s" },
              { name: "Upper Body Ergometer", sets: 3, reps: "3 min", rest: "1 min" },
              { name: "Battle Ropes", sets: 4, reps: "30s", rest: "30s" }
            ],
            calories: 200,
          },
          {
            day: "Friday",
            type: "Adaptive Full Upper Body",
            duration: 40,
            exercises: [
              { name: "Chest Fly Machine", sets: 3, reps: "12-15", rest: "60s" },
              { name: "Cable Row", sets: 3, reps: "10-12", rest: "60s" },
              { name: "Lateral Raises", sets: 3, reps: "12-15", rest: "45s" },
              { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" },
              { name: "Plank on Bench", sets: 3, reps: "hold 20-30s", rest: "30s" }
            ],
            calories: 240,
          },
        ]
      },
      both: {
        name: "Seated Adaptive Workout Program",
        duration: "Weekly",
        difficulty: fitnessLevel || "Beginner",
        totalWorkouts: workoutDays.length || 3,
        estimatedCalories: 900,
        schedule: [
          {
            day: "Monday",
            type: "Seated Strength",
            duration: 25,
            exercises: [
              { name: "Resistance Band Chest Press", sets: 3, reps: "12-15", rest: "60s" },
              { name: "Seated Lateral Raises with Light Weights", sets: 3, reps: "12-15", rest: "45s" },
              { name: "Resistance Band Pulls", sets: 3, reps: "15-20", rest: "45s" },
              { name: "Seated Core Rotations", sets: 3, reps: "10 each side", rest: "30s" }
            ],
            calories: 120,
          },
          {
            day: "Wednesday",
            type: "Seated Cardio",
            duration: 20,
            exercises: [
              { name: "Seated Arm Circles", sets: 3, reps: "20 each direction", rest: "30s" },
              { name: "Chair Aerobics", sets: 1, reps: "10 min", rest: "0s" },
              { name: "Hand Cycling Motion", sets: 3, reps: "1 min", rest: "30s" },
              { name: "Seated Punching Exercise", sets: 3, reps: "30s", rest: "30s" }
            ],
            calories: 100,
          },
          {
            day: "Friday",
            type: "Seated Flexibility",
            duration: 25,
            exercises: [
              { name: "Neck Range of Motion", sets: 2, reps: "5 each direction", rest: "10s" },
              { name: "Seated Chest Stretch", sets: 2, reps: "hold 20s", rest: "10s" },
              { name: "Seated Side Stretch", sets: 2, reps: "hold 20s each side", rest: "10s" },
              { name: "Shoulder Rolls", sets: 2, reps: "10 each direction", rest: "10s" },
              { name: "Deep Breathing Exercise", sets: 1, reps: "10 breaths", rest: "0s" }
            ],
            calories: 80,
          },
        ]
      }
    },
    visual: {
      name: "Vision-Adapted Workout Program",
      duration: "Weekly",
      difficulty: fitnessLevel || "Beginner",
      totalWorkouts: workoutDays.length || 3,
      estimatedCalories: 1500,
      schedule: [
        {
          day: "Monday",
          type: "Tactile Strength Training",
          duration: 35,
          exercises: [
            { name: "Machine Guided Chest Press", sets: 3, reps: "10-12", rest: "60s", note: "Use machines with fixed movement paths" },
            { name: "Assisted Pull-ups", sets: 3, reps: "8-10", rest: "60s" },
            { name: "Guided Leg Press", sets: 3, reps: "12-15", rest: "60s" },
            { name: "Seated Cable Row", sets: 3, reps: "10-12", rest: "45s" },
            { name: "Machine Shoulder Press", sets: 3, reps: "10-12", rest: "60s" }
          ],
          calories: 220,
        },
        {
          day: "Wednesday",
          type: "Audio-Guided Cardio",
          duration: 30,
          exercises: [
            { name: "Stationary Bike", sets: 1, reps: "15 min", rest: "0s", note: "Use verbal cues for intensity changes" },
            { name: "Guided Floor Exercises", sets: 1, reps: "10 min", rest: "0s" },
            { name: "Balance Training with Support", sets: 3, reps: "1 min each", rest: "30s" }
          ],
          calories: 200,
        },
        {
          day: "Friday",
          type: "Partner-Assisted Training",
          duration: 40,
          exercises: [
            { name: "Guided Resistance Band Work", sets: 3, reps: "12-15", rest: "45s" },
            { name: "Tactile Feedback Squats", sets: 3, reps: "10-12", rest: "60s" },
            { name: "Partner-Guided Lunges", sets: 3, reps: "10 each leg", rest: "45s" },
            { name: "Fixed-Path Core Exercises", sets: 3, reps: "15-20", rest: "45s" },
            { name: "Balance Training Progression", sets: 2, reps: "1 min", rest: "30s" }
          ],
          calories: 250,
        },
      ]
    },
    hearing: {
      name: "Hearing-Adapted Workout Program",
      duration: "Weekly",
      difficulty: fitnessLevel || "Beginner",
      totalWorkouts: workoutDays.length || 3,
      estimatedCalories: 1800,
      schedule: [
        {
          day: "Monday",
          type: "Visual-Cued Strength",
          duration: 40,
          exercises: [
            { name: "Dumbbell Bench Press", sets: 3, reps: "10-12", rest: "60s", note: "Use visual cues for timing" },
            { name: "Barbell Squats", sets: 3, reps: "10-12", rest: "90s" },
            { name: "Lat Pulldown", sets: 3, reps: "12-15", rest: "60s" },
            { name: "Visual Timer Lunges", sets: 3, reps: "12 each leg", rest: "60s" },
            { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "60s" }
          ],
          calories: 280,
        },
        {
          day: "Wednesday",
          type: "Visual Feedback Cardio",
          duration: 35,
          exercises: [
            { name: "Treadmill with Display", sets: 1, reps: "20 min", rest: "0s", note: "Use visual display for intensity" },
            { name: "Visual HIIT Timer Circuit", sets: 5, reps: "40s on/20s off", rest: "20s" },
            { name: "Machine Rowing with Display", sets: 3, reps: "3 min", rest: "1 min" }
          ],
          calories: 300,
        },
        {
          day: "Friday",
          type: "Vibration-Feedback Training",
          duration: 40,
          exercises: [
            { name: "Vibration-Timed Planks", sets: 3, reps: "30-45s", rest: "30s" },
            { name: "Free Weight Circuit", sets: 3, reps: "12-15", rest: "45s" },
            { name: "Visual-Guided Kettlebell Swings", sets: 3, reps: "15", rest: "60s" },
            { name: "Mirror-Feedback Technique Work", sets: 3, reps: "12", rest: "45s" },
            { name: "Partner-Cued Core Circuit", sets: 1, reps: "5 min", rest: "0s" }
          ],
          calories: 270,
        },
      ]
    },
    cognitive: {
      name: "Cognitively-Adapted Workout Program",
      duration: "Weekly",
      difficulty: fitnessLevel || "Beginner",
      totalWorkouts: workoutDays.length || 3,
      estimatedCalories: 1400,
      schedule: [
        {
          day: "Monday",
          type: "Structured Routine Training",
          duration: 30,
          exercises: [
            { name: "Simple Machine Chest Press", sets: 3, reps: "10", rest: "60s", note: "Focus on consistent, simple movements" },
            { name: "Basic Leg Press", sets: 3, reps: "12", rest: "60s" },
            { name: "Simple Cable Pulldowns", sets: 3, reps: "12", rest: "60s" },
            { name: "Guided Bodyweight Squats", sets: 3, reps: "10", rest: "45s" },
            { name: "Simple Shoulder Machine", sets: 3, reps: "12", rest: "60s" }
          ],
          calories: 180,
        },
        {
          day: "Wednesday",
          type: "Predictable Cardio",
          duration: 25,
          exercises: [
            { name: "Steady-State Walk/Jog", sets: 1, reps: "15 min", rest: "0s", note: "Maintain consistent pace" },
            { name: "Simple Step-Ups", sets: 3, reps: "10 each leg", rest: "45s" },
            { name: "Basic Cycling", sets: 1, reps: "10 min", rest: "0s" }
          ],
          calories: 170,
        },
        {
          day: "Friday",
          type: "Guided Movement Session",
          duration: 30,
          exercises: [
            { name: "Assisted Bodyweight Exercises", sets: 3, reps: "10", rest: "45s" },
            { name: "Simple Balance Exercises", sets: 3, reps: "30s", rest: "30s" },
            { name: "Guided Core Work", sets: 3, reps: "10", rest: "45s" },
            { name: "Basic Stretching Routine", sets: 1, reps: "5 min", rest: "0s" },
            { name: "Supported Flexibility Work", sets: 1, reps: "5 min", rest: "0s" }
          ],
          calories: 150,
        },
      ]
    },
    other: {
      name: "Custom Adaptive Workout Program",
      duration: "Weekly",
      difficulty: fitnessLevel || "Beginner",
      totalWorkouts: workoutDays.length || 3,
      estimatedCalories: 1600,
      schedule: [
        {
          day: "Monday",
          type: "Personalized Strength",
          duration: 35,
          exercises: [
            { name: "Customized Exercise 1", sets: 3, reps: "As appropriate", rest: "60s", note: "Tailored to your specific needs" },
            { name: "Customized Exercise 2", sets: 3, reps: "As appropriate", rest: "60s" },
            { name: "Customized Exercise 3", sets: 3, reps: "As appropriate", rest: "60s" },
            { name: "Customized Exercise 4", sets: 3, reps: "As appropriate", rest: "60s" }
          ],
          calories: 200,
        },
        {
          day: "Wednesday",
          type: "Adapted Cardio",
          duration: 30,
          exercises: [
            { name: "Customized Cardio 1", sets: 1, reps: "15 min", rest: "0s" },
            { name: "Customized Cardio 2", sets: 3, reps: "1 min", rest: "1 min" },
            { name: "Customized Cardio 3", sets: 3, reps: "As appropriate", rest: "45s" }
          ],
          calories: 190,
        },
        {
          day: "Friday",
          type: "Adaptive Flexibility & Balance",
          duration: 35,
          exercises: [
            { name: "Customized Stretch 1", sets: 2, reps: "30s hold", rest: "15s" },
            { name: "Customized Balance 1", sets: 3, reps: "30s", rest: "30s" },
            { name: "Customized Exercise 5", sets: 3, reps: "As appropriate", rest: "45s" },
            { name: "Customized Exercise 6", sets: 3, reps: "As appropriate", rest: "45s" },
            { name: "Guided Relaxation", sets: 1, reps: "5 min", rest: "0s" }
          ],
          calories: 160,
        },
      ]
    }
  }

  // Function to get fallback plan based on user's selected disability type
  const getFallbackPlan = () => {
    if (disabilityTypes.includes("mobility")) {
      if (mobilityLimitation === "upperBody") {
        return examplePlans.mobility.upperBody
      } else if (mobilityLimitation === "lowerBody") {
        return examplePlans.mobility.lowerBody
      } else if (mobilityLimitation === "both") {
        return examplePlans.mobility.both
      }
    } else if (disabilityTypes.includes("visual")) {
      return examplePlans.visual
    } else if (disabilityTypes.includes("hearing")) {
      return examplePlans.hearing
    } else if (disabilityTypes.includes("cognitive")) {
      return examplePlans.cognitive
    } else if (disabilityTypes.includes("other")) {
      return examplePlans.other
    }

    // Default fallback
    return examplePlans.other
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          {t("adaptive_workout_planner", "Adaptive Workout Planner")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t(
            "adaptive_planner_desc",
            "Create personalized workout plans adapted to your unique abilities and needs.",
          )}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="configure">{t("configure_plan", "Configure Plan")}</TabsTrigger>
          <TabsTrigger value="view-plan">{t("view_plan", "View Plan")}</TabsTrigger>
        </TabsList>

        {/* Configure Tab */}
        <TabsContent value="configure" className="space-y-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-teal-200 dark:border-teal-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Accessibility className="h-5 w-5 text-teal-600" />
                <span>{t("adaptive_preferences", "Adaptive Preferences")}</span>
              </CardTitle>
              <CardDescription>
                {t("adaptive_desc", "Help us understand your unique needs to create a personalized plan")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Disability Toggle */}
              <div className="flex items-center space-x-3">
                <Switch 
                  id="disability-toggle" 
                  checked={hasDisability}
                  onCheckedChange={setHasDisability}
                />
                <Label htmlFor="disability-toggle" className="text-base font-medium">
                  {t("has_disability", "I have a disability or mobility limitation")}
                </Label>
              </div>

              {/* Disability Details */}
              {hasDisability && (
                <div className="space-y-6 pl-4 border-l-2 border-teal-200 dark:border-teal-800">
                  {/* Type of Disability */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">{t("disability_type", "Type of Disability")}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="disability-mobility" 
                          checked={disabilityTypes.includes("mobility")}
                          onCheckedChange={() => handleDisabilityTypeToggle("mobility")}
                        />
                        <Label htmlFor="disability-mobility">
                          {t("mobility_limitation", "Mobility Limitation")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="disability-visual" 
                          checked={disabilityTypes.includes("visual")}
                          onCheckedChange={() => handleDisabilityTypeToggle("visual")}
                        />
                        <Label htmlFor="disability-visual">
                          {t("visual_impairment", "Visual Impairment")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="disability-hearing" 
                          checked={disabilityTypes.includes("hearing")}
                          onCheckedChange={() => handleDisabilityTypeToggle("hearing")}
                        />
                        <Label htmlFor="disability-hearing">
                          {t("hearing_impairment", "Hearing Impairment")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="disability-cognitive" 
                          checked={disabilityTypes.includes("cognitive")}
                          onCheckedChange={() => handleDisabilityTypeToggle("cognitive")}
                        />
                        <Label htmlFor="disability-cognitive">
                          {t("cognitive_disability", "Cognitive Disability")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="disability-other" 
                          checked={disabilityTypes.includes("other")}
                          onCheckedChange={() => handleDisabilityTypeToggle("other")}
                        />
                        <Label htmlFor="disability-other">
                          {t("other", "Other")}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Mobility specific options */}
                  {disabilityTypes.includes("mobility") && (
                    <div className="space-y-3">
                      <Label htmlFor="mobility-type">{t("mobility_type", "Area of Mobility Limitation")}</Label>
                      <Select 
                        value={mobilityLimitation} 
                        onValueChange={(value: string) => setMobilityLimitation(value as MobilityType | "")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_mobility_area", "Select affected area")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upperBody">{t("upper_body", "Upper body")}</SelectItem>
                          <SelectItem value="lowerBody">{t("lower_body", "Lower body")}</SelectItem>
                          <SelectItem value="both">{t("both", "Both upper and lower")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Other details */}
                  {disabilityTypes.includes("other") && (
                    <div className="space-y-2">
                      <Label htmlFor="other-description">{t("please_describe", "Please describe your specific needs")}</Label>
                      <textarea
                        id="other-description"
                        value={otherDescription}
                        onChange={(e) => setOtherDescription(e.target.value)}
                        className="w-full p-3 border rounded-md dark:bg-gray-700"
                        rows={3}
                        placeholder={t("describe_needs", "Describe your specific needs here...")}
                      />
                    </div>
                  )}

                  {/* Specific condition */}
                  <div className="space-y-2">
                    <Label htmlFor="specific-condition">{t("specific_condition", "Specific Condition (optional)")}</Label>
                    <input
                      id="specific-condition"
                      type="text"
                      value={specificCondition}
                      onChange={(e) => setSpecificCondition(e.target.value)}
                      className="w-full p-3 border rounded-md dark:bg-gray-700"
                      placeholder={t("condition_placeholder", "e.g., arthritis, MS, amputation, etc.")}
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-medium text-lg mb-3">{t("workout_preferences", "Workout Preferences")}</h3>
              </div>

              {/* Fitness Level */}
              <div className="space-y-2">
                <Label htmlFor="fitness-level">{t("fitness_level", "Fitness Level")}</Label>
                <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_level", "Select your fitness level")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t("beginner", "Beginner")}</SelectItem>
                    <SelectItem value="intermediate">{t("intermediate", "Intermediate")}</SelectItem>
                    <SelectItem value="advanced">{t("advanced", "Advanced")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Workout Days */}
              <div className="space-y-3">
                <Label className="text-base font-medium">{t("workout_days", "Workout Days")}</Label>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <div
                      key={day.id}
                      className={`flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                        workoutDays.includes(day.id)
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-teal-300"
                      }`}
                      onClick={() => handleDayToggle(day.id)}
                    >
                      <span className="text-xs font-medium">{day.short}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">{t("session_duration", "Session Duration")}</Label>
                <Select value={sessionDuration} onValueChange={setSessionDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_duration", "Select workout duration")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-30">{t("duration_15_30", "15-30 minutes")}</SelectItem>
                    <SelectItem value="30-45">{t("duration_30_45", "30-45 minutes")}</SelectItem>
                    <SelectItem value="45-60">{t("duration_45_60", "45-60 minutes")}</SelectItem>
                    <SelectItem value="60+">{t("duration_60_plus", "60+ minutes")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Equipment Use */}
              <div className="flex items-center space-x-3">
                <Switch 
                  id="equipment-toggle" 
                  checked={useEquipment}
                  onCheckedChange={setUseEquipment}
                />
                <Label htmlFor="equipment-toggle" className="text-base font-medium">
                  {t("use_equipment", "I have access to gym equipment")}
                </Label>
              </div>

              {/* Focus Areas */}
              <div className="space-y-3">
                <Label className="text-base font-medium">{t("focus_areas", "Focus Areas")}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bodyAreas.map((area) => (
                    <div
                      key={area.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        focusAreas.includes(area.id)
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-teal-300"
                      }`}
                      onClick={() => handleFocusAreaToggle(area.id)}
                    >
                      <span className="text-xl">{area.icon}</span>
                      <span className="text-sm font-medium">{t(area.id.replace("-", "_"), area.label)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={() => {
                  // Try to use the API function if available
                  if (typeof generateAdaptiveWorkoutPlan === 'function') {
                    generateWorkoutPlan()
                  } else {
                    // Otherwise, use the fallback examples
                    console.log("Using fallback adaptive workout plan")
                    setIsGenerating(true)
                    setTimeout(() => {
                      setGeneratedPlan(getFallbackPlan())
                      setIsGenerating(false)
                      setActiveTab("view-plan")
                    }, 1500)
                  }
                }}
                disabled={isGenerating || !fitnessLevel || workoutDays.length === 0 || !sessionDuration || (hasDisability && disabilityTypes.length === 0)}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("generating", "Generating Plan...")}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {t("generate_adaptive_plan", "Generate Adaptive Plan")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Adaptive Resources */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-teal-200 dark:border-teal-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-teal-600" />
                <span>{t("adaptive_resources", "Adaptive Fitness Resources")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    {t("exercise_modifications", "Common Exercise Modifications")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>{t("seated_exercises", "Seated variations for most standing exercises")}</li>
                      <li>{t("assisted_movements", "Assisted movements with bands or partners")}</li>
                      <li>{t("range_modifications", "Range of motion modifications")}</li>
                      <li>{t("equipment_adaptations", "Adaptive equipment options")}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    {t("adaptive_equipment", "Adaptive Equipment Options")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>{t("resistance_bands", "Resistance bands with handles")}</li>
                      <li>{t("adaptive_grips", "Adaptive grips and cuffs")}</li>
                      <li>{t("seated_machines", "Seated exercise machines")}</li>
                      <li>{t("stability_tools", "Balance and stability tools")}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    {t("benefits", "Benefits of Adaptive Exercise")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>{t("improved_strength", "Improved strength and endurance")}</li>
                      <li>{t("better_mobility", "Better mobility and flexibility")}</li>
                      <li>{t("increased_independence", "Increased independence")}</li>
                      <li>{t("mental_wellbeing", "Enhanced mental wellbeing")}</li>
                      <li>{t("community_connection", "Community connection")}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* View Plan Tab */}
        <TabsContent value="view-plan" className="space-y-6">
          {!generatedPlan ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Accessibility className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("no_plan_yet", "No adaptive plan generated yet")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                {t("generate_plan_prompt", "Configure your preferences and generate a plan to see your adaptive workout routine here.")}
              </p>
              <Button 
                onClick={() => setActiveTab("configure")} 
                className="bg-gradient-to-r from-teal-600 to-blue-600"
              >
                {t("create_plan", "Create Plan")}
              </Button>
            </div>
          ) : (
            /* Generated Plan Display */
            <div className="space-y-6">
              {/* Plan Overview */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-teal-200 dark:border-teal-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{generatedPlan.name}</CardTitle>
                      <CardDescription className="text-lg mt-2">
                        {generatedPlan.duration} • {generatedPlan.difficulty} • {generatedPlan.totalWorkouts} workouts
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">{generatedPlan.estimatedCalories}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("est_weekly_calories", "Est. Weekly Calories")}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Check className="h-5 w-5 mr-2 text-teal-600" />
                      {t("adaptive_features", "Adaptive Features")}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {t("adaptive_plan_description", "This plan has been specially designed to accommodate your specific needs while helping you achieve your fitness goals. Exercises are modified for accessibility and can be further adjusted as needed.")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hasDisability && disabilityTypes.map(type => (
                      <Badge key={type} className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                        {t(type, type.charAt(0).toUpperCase() + type.slice(1))} {t("adapted", "Adapted")}
                      </Badge>
                    ))}
                    {focusAreas.map(area => (
                      <Badge key={area} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {t(area.replace("-", "_"), area)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Check what type of plan we have (API or fallback) */}
              {generatedPlan.schedule && Array.isArray(generatedPlan.schedule) ? (
                /* Traditional Schedule Format (Fallback) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedPlan.schedule.map((day: any, index: number) => (
                    <Card key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{day.day}</CardTitle>
                          <Badge className={getDayTypeColor(day.type)}>{day.type}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{day.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="h-4 w-4" />
                            <span>{day.calories} cal</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {day.exercises && day.exercises.length > 0 ? (
                          <div className="space-y-3">
                            {day.exercises.map((exercise: any, exerciseIndex: number) => (
                              <div key={exerciseIndex} className="text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-b-0 last:pb-0">
                                <div className="font-medium">{exercise.name}</div>
                                <div className="text-gray-600 dark:text-gray-400 flex justify-between">
                                  <span>{exercise.sets} sets × {exercise.reps}</span>
                                  <span>Rest: {exercise.rest}</span>
                                </div>
                                {exercise.note && (
                                  <div className="text-xs text-teal-600 dark:text-teal-400 italic mt-1">
                                    {exercise.note}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">{t("rest_day", "Rest and recovery day")}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                /* API-based Format (Sections with warmUp, mainExercises, coolDown) */
                <div className="space-y-6">
                  {/* Safety Notes */}
                  {generatedPlan.safetyNotes && (
                    <Card className="bg-amber-50/70 dark:bg-amber-900/20 backdrop-blur-sm border-amber-200 dark:border-amber-900">
                      <CardHeader>
                        <CardTitle className="text-amber-800 dark:text-amber-300">
                          {t("safety_notes", "Safety Notes")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-amber-800 dark:text-amber-300">
                        <p>{generatedPlan.safetyNotes}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Focus Areas */}
                  {generatedPlan.focusAreas && (
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>{t("focus_areas", "Focus Areas")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {generatedPlan.focusAreas.map((focus: string, index: number) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {focus}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Equipment */}
                  {generatedPlan.equipment && (
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>{t("equipment_needed", "Equipment Needed")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {generatedPlan.equipment.map((item: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Warm Up Section */}
                  {generatedPlan.sections?.warmUp && (
                    <Card className="bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm border-blue-200 dark:border-blue-900">
                      <CardHeader>
                        <CardTitle className="text-blue-800 dark:text-blue-300">
                          {t("warm_up", "Warm Up")} - {generatedPlan.sections.warmUp.reduce((total: number, ex: any) => 
                            total + (parseInt(ex.duration) || 2), 0)} {t("minutes", "minutes")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {generatedPlan.sections.warmUp.map((exercise: any, index: number) => (
                            <div key={index} className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                              <h3 className="font-medium">{exercise.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exercise.description}</p>
                              <div className="flex justify-between mt-2 text-sm">
                                <span className="text-blue-600 dark:text-blue-400">
                                  {exercise.duration}
                                </span>
                                {exercise.adaptations && (
                                  <span className="text-teal-600 dark:text-teal-400 font-medium text-xs">
                                    {t("adaptation", "Adaptation")}: {exercise.adaptations}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Main Exercises Section */}
                  {generatedPlan.sections?.mainExercises && (
                    <Card className="bg-purple-50/70 dark:bg-purple-900/20 backdrop-blur-sm border-purple-200 dark:border-purple-900">
                      <CardHeader>
                        <CardTitle className="text-purple-800 dark:text-purple-300">
                          {t("main_exercises", "Main Exercises")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {generatedPlan.sections.mainExercises.map((exercise: any, index: number) => (
                            <div key={index} className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                              <h3 className="font-medium">{exercise.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exercise.description}</p>
                              <div className="flex justify-between mt-2 text-sm">
                                <span className="text-purple-600 dark:text-purple-400">
                                  {exercise.sets} {t("sets", "sets")} × {exercise.reps} • {t("rest", "Rest")}: {exercise.rest}
                                </span>
                              </div>
                              {(exercise.adaptations || exercise.alternatives) && (
                                <div className="mt-2 text-xs space-y-1">
                                  {exercise.adaptations && (
                                    <div className="text-teal-600 dark:text-teal-400">
                                      <span className="font-medium">{t("adaptation", "Adaptation")}:</span> {exercise.adaptations}
                                    </div>
                                  )}
                                  {exercise.alternatives && (
                                    <div className="text-blue-600 dark:text-blue-400">
                                      <span className="font-medium">{t("alternative", "Alternative")}:</span> {exercise.alternatives}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Cool Down Section */}
                  {generatedPlan.sections?.coolDown && (
                    <Card className="bg-green-50/70 dark:bg-green-900/20 backdrop-blur-sm border-green-200 dark:border-green-900">
                      <CardHeader>
                        <CardTitle className="text-green-800 dark:text-green-300">
                          {t("cool_down", "Cool Down")} - {generatedPlan.sections.coolDown.reduce((total: number, ex: any) => 
                            total + (parseInt(ex.duration) || 2), 0)} {t("minutes", "minutes")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {generatedPlan.sections.coolDown.map((exercise: any, index: number) => (
                            <div key={index} className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                              <h3 className="font-medium">{exercise.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exercise.description}</p>
                              <div className="flex justify-between mt-2 text-sm">
                                <span className="text-green-600 dark:text-green-400">
                                  {exercise.duration}
                                </span>
                                {exercise.adaptations && (
                                  <span className="text-teal-600 dark:text-teal-400 font-medium text-xs">
                                    {t("adaptation", "Adaptation")}: {exercise.adaptations}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Progression Path */}
                  {generatedPlan.progressionPath && (
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>{t("progression_path", "Progression Path")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{generatedPlan.progressionPath}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Additional Resources */}
                  {generatedPlan.additionalResources && (
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>{t("additional_resources", "Additional Resources")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {generatedPlan.additionalResources.map((resource: string, index: number) => (
                            <li key={index}>{resource}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Important Notes - only shown for fallback plans without safetyNotes */}
              {(!generatedPlan.safetyNotes && generatedPlan.schedule && Array.isArray(generatedPlan.schedule)) && (
                <Card className="bg-amber-50/70 dark:bg-amber-900/20 backdrop-blur-sm border-amber-200 dark:border-amber-900">
                  <CardHeader>
                    <CardTitle className="text-amber-800 dark:text-amber-300">
                      {t("important_notes", "Important Notes")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-amber-800 dark:text-amber-300">
                    <p>{t("listen_to_body", "Always listen to your body and stop if you feel pain (not just muscle fatigue).")}</p>
                    <p>{t("modify_as_needed", "Modify any exercise as needed for your comfort and safety.")}</p>
                    <p>{t("consult_professional", "Consider consulting with a physical therapist or adaptive fitness specialist for personalized guidance.")}</p>
                    <p>{t("progression", "Start slowly and gradually increase intensity as you build confidence and strength.")}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={() => {
                    // Handle saving the plan (would need to be implemented)
                    alert(t("plan_saved", "Plan saved successfully!"))
                  }} 
                  className="bg-gradient-to-r from-teal-600 to-blue-600"
                >
                  {t("save_plan", "Save Plan")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Print/export plan (would need to be implemented)
                    window.print()
                  }}
                >
                  {t("print_plan", "Print Plan")}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab("configure")}
                >
                  {t("modify_plan", "Modify Plan")}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

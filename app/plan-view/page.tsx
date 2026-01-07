"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useWorkout } from "../contexts/WorkoutContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Save, 
  Play, 
  Calendar, 
  Utensils, 
  Dumbbell, 
  TrendingUp,
  CheckCircle,
  Clock,
  Flame,
  Target,
  Apple,
  Droplet,
  Pill,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Exercise {
  name: string
  sets: number
  reps: string
  rest: string
}

interface WorkoutDay {
  day: string
  type: string
  duration: number
  exercises: Exercise[]
  calories: number
}

interface WorkoutPlan {
  name: string
  difficulty: string
  duration: string
  totalWorkouts: number
  estimatedCalories: number
  schedule: WorkoutDay[]
}

interface DietDay {
  breakfast: string
  lunch: string
  dinner: string
  snacks: string[]
}

interface DietPlan {
  name: string
  type: string
  dailyCalories: number
  macroBreakdown: {
    protein: string
    carbs: string
    fat: string
  }
  schedule: {
    [key: string]: DietDay
  }
}

interface Recommendations {
  preworkoutNutrition: string
  postworkoutNutrition: string
  hydration: string
  supplements: string[]
}

interface GeneratedPlan {
  workoutPlan: WorkoutPlan
  dietPlan: DietPlan
  recommendations: Recommendations
}

function PlanViewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { savePlan: contextSavePlan, startPlan: contextStartPlan, savedPlans } = useWorkout()
  const [plan, setPlan] = useState<GeneratedPlan | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [completedWorkouts, setCompletedWorkouts] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Guard against SSR - only run in browser
    if (typeof window === 'undefined') return

    // Get plan from localStorage or URL params
    const planData = localStorage.getItem('generatedPlan')
    if (planData) {
      try {
        const parsed = JSON.parse(planData)
        setPlan(parsed)
      } catch (error) {
        console.error("Error parsing plan:", error)
      }
    }

    // Check if plan is already saved or active
    const savedPlans = JSON.parse(localStorage.getItem('savedPlans') || '[]')
    const activePlan = localStorage.getItem('activePlan')
    
    if (savedPlans.some((p: any) => p.id === planData)) {
      setIsSaved(true)
    }
    if (activePlan === planData) {
      setIsActive(true)
    }

    // Load progress
    const progress = JSON.parse(localStorage.getItem('workoutProgress') || '{}')
    if (progress.completedWorkouts) {
      setCompletedWorkouts(new Set(progress.completedWorkouts))
    }
  }, [])

  const savePlan = () => {
    if (!plan) return
    
    // Convert the combined plan to workspace format
    const workoutPlan = {
      id: Date.now().toString(),
      name: plan.workoutPlan.name,
      duration: plan.workoutPlan.duration,
      difficulty: plan.workoutPlan.difficulty,
      totalWorkouts: plan.workoutPlan.totalWorkouts,
      estimatedCalories: plan.workoutPlan.estimatedCalories,
      schedule: plan.workoutPlan.schedule,
      status: 'saved' as const,
      savedAt: new Date().toISOString(),
      dietPlan: plan.dietPlan,
      recommendations: plan.recommendations
    }
    
    contextSavePlan(workoutPlan)
    setIsSaved(true)
    alert('Plan saved successfully! Check your tracker to see it.')
  }

  const handleStartPlan = () => {
    if (!plan) return
    
    // First save it if not already saved
    if (!isSaved) {
      savePlan()
    }
    
    // Find the saved plan and start it
    const workoutPlan = {
      id: Date.now().toString(),
      name: plan.workoutPlan.name,
      duration: plan.workoutPlan.duration,
      difficulty: plan.workoutPlan.difficulty,
      totalWorkouts: plan.workoutPlan.totalWorkouts,
      estimatedCalories: plan.workoutPlan.estimatedCalories,
      schedule: plan.workoutPlan.schedule,
      status: 'active' as const,
      savedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      currentWeek: 1,
      dietPlan: plan.dietPlan,
      recommendations: plan.recommendations
    }
    
    contextStartPlan(workoutPlan)
    if (typeof window !== 'undefined') {
      localStorage.setItem('workoutProgress', JSON.stringify({
        startDate: new Date().toISOString(),
        completedWorkouts: [],
        currentWeek: 1
      }))
    }
    setIsActive(true)
    alert('Plan started! Track your progress in the tracker section.')
  }

  const toggleWorkoutCompletion = (dayKey: string) => {
    const newCompleted = new Set(completedWorkouts)
    if (newCompleted.has(dayKey)) {
      newCompleted.delete(dayKey)
    } else {
      newCompleted.add(dayKey)
    }
    
    setCompletedWorkouts(newCompleted)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      const progress = JSON.parse(localStorage.getItem('workoutProgress') || '{}')
      progress.completedWorkouts = Array.from(newCompleted)
      localStorage.setItem('workoutProgress', JSON.stringify(progress))
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">No Plan Found</h1>
          <p className="text-muted-foreground mb-8">Generate a plan first to view it here.</p>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { workoutPlan, dietPlan, recommendations } = plan

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 glass dark:glass-dark border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              {!isSaved && (
                <Button onClick={savePlan} variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Plan
                </Button>
              )}
              {!isActive && (
                <Button onClick={handleStartPlan} size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Play className="w-4 h-4 mr-2" />
                  Start Plan
                </Button>
              )}
              {isActive && (
                <Badge className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text dark:gradient-text-dark">
            Your Personalized Plan
          </h1>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Badge variant="outline" className="px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              {workoutPlan.duration}
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Dumbbell className="w-4 h-4 mr-2" />
              {workoutPlan.totalWorkouts} Workouts
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Flame className="w-4 h-4 mr-2" />
              ~{workoutPlan.estimatedCalories} cal/week
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Apple className="w-4 h-4 mr-2" />
              {dietPlan.dailyCalories} cal/day
            </Badge>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="workout" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="workout">
              <Dumbbell className="w-4 h-4 mr-2" />
              Workout
            </TabsTrigger>
            <TabsTrigger value="diet">
              <Utensils className="w-4 h-4 mr-2" />
              Diet
            </TabsTrigger>
            <TabsTrigger value="tips">
              <Target className="w-4 h-4 mr-2" />
              Tips
            </TabsTrigger>
          </TabsList>

          {/* Workout Tab */}
          <TabsContent value="workout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{workoutPlan.name}</span>
                  <Badge>{workoutPlan.difficulty}</Badge>
                </CardTitle>
                <CardDescription>
                  {workoutPlan.totalWorkouts} workout sessions per week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workoutPlan.schedule.map((workout, index) => {
                    const dayKey = `week${currentWeek}-${workout.day}`
                    const isCompleted = completedWorkouts.has(dayKey)
                    const isExpanded = expandedDay === dayKey

                    return (
                      <Card key={index} className={`${isCompleted ? 'border-green-500' : ''}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Button
                                  size="sm"
                                  variant={isCompleted ? "default" : "outline"}
                                  className={isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
                                  onClick={() => toggleWorkoutCompletion(dayKey)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <div>
                                  <CardTitle className="text-lg">{workout.day}</CardTitle>
                                  <CardDescription>{workout.type}</CardDescription>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  {workout.duration} min
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Flame className="w-4 h-4" />
                                  ~{workout.calories} cal
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedDay(isExpanded ? null : dayKey)}
                              >
                                {isExpanded ? <ChevronUp /> : <ChevronDown />}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {isExpanded && (
                          <CardContent>
                            <div className="space-y-3">
                              {workout.exercises.map((exercise, exIndex) => (
                                <div
                                  key={exIndex}
                                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900"
                                >
                                  <div>
                                    <p className="font-medium">{exercise.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {exercise.sets} sets × {exercise.reps}
                                    </p>
                                  </div>
                                  <Badge variant="outline">{exercise.rest} rest</Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diet Tab */}
          <TabsContent value="diet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{dietPlan.name}</CardTitle>
                <CardDescription>
                  {dietPlan.type.charAt(0).toUpperCase() + dietPlan.type.slice(1)} diet - {dietPlan.dailyCalories} calories/day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Macro Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dietPlan.macroBreakdown.protein}</p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dietPlan.macroBreakdown.carbs}</p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dietPlan.macroBreakdown.fat}</p>
                    <p className="text-sm text-muted-foreground">Fat</p>
                  </div>
                </div>

                {/* Weekly Schedule */}
                <div className="space-y-4">
                  {Object.entries(dietPlan.schedule).map(([day, meals]) => (
                    <Card key={day}>
                      <CardHeader>
                        <CardTitle className="text-lg">{day}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Breakfast</p>
                          <p>{meals.breakfast}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Lunch</p>
                          <p>{meals.lunch}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Dinner</p>
                          <p>{meals.dinner}</p>
                        </div>
                        {meals.snacks && meals.snacks.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Snacks</p>
                            <ul className="list-disc list-inside">
                              {meals.snacks.map((snack, index) => (
                                <li key={index}>{snack}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Apple className="w-5 h-5 mr-2" />
                  Nutrition Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Pre-Workout Nutrition</h4>
                  <p className="text-muted-foreground">{recommendations.preworkoutNutrition}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Post-Workout Nutrition</h4>
                  <p className="text-muted-foreground">{recommendations.postworkoutNutrition}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplet className="w-5 h-5 mr-2" />
                  Hydration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{recommendations.hydration}</p>
              </CardContent>
            </Card>

            {recommendations.supplements && recommendations.supplements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pill className="w-5 h-5 mr-2" />
                    Supplements (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {recommendations.supplements.map((supplement, index) => (
                      <li key={index} className="text-muted-foreground">{supplement}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Progress Overview (if active) */}
        {isActive && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Week {currentWeek} Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Workouts Completed</span>
                  <span className="font-semibold">
                    {completedWorkouts.size} / {workoutPlan.totalWorkouts}
                  </span>
                </div>
                <Progress 
                  value={(completedWorkouts.size / workoutPlan.totalWorkouts) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function PlanViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Loading Plan...</h1>
        </div>
      </div>
    }>
      <PlanViewContent />
    </Suspense>
  )
}

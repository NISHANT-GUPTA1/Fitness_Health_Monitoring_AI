"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useWorkout } from "../contexts/WorkoutContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Target, Zap, Plus, Edit, Play, CheckCircle, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateCombinedPlan } from "@/lib/gemma-api"

type DietType = "veg" | "non-veg" | "vegan";
type Lifestyle = "balanced" | "junk food" | "salad" | "sweets";
type Frequency = "never" | "rarely" | "sometimes" | "often" | "daily";

export default function CombinedPlanner() {
  const { t } = useTranslation()
  const { savePlan: contextSavePlan, startPlan: contextStartPlan } = useWorkout()
  const router = useRouter()
  
  // Workout plan parameters
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [fitnessLevel, setFitnessLevel] = useState("")
  const [workoutDays, setWorkoutDays] = useState<string[]>([])
  const [sessionDuration, setSessionDuration] = useState("")
  
  // Diet plan parameters
  const [dietType, setDietType] = useState<DietType>("veg");
  const [allergies, setAllergies] = useState<string>("");
  const [lifestyle, setLifestyle] = useState<Lifestyle>("balanced");
  const [junkFoodFreq, setJunkFoodFreq] = useState<Frequency>("rarely");
  const [sweetsFreq, setSweetsFreq] = useState<Frequency>("rarely");
  const [saladFreq, setSaladFreq] = useState<Frequency>("rarely");
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const [activeTab, setActiveTab] = useState("workout")

  // Workout plans options
  const fitnessGoals = [
    { id: "weight-loss", label: "Weight Loss", icon: "⚖️" },
    { id: "muscle-gain", label: "Muscle Gain", icon: "🏋️" },
    { id: "endurance", label: "Endurance", icon: "🏃‍♂️" },
    { id: "strength", label: "Strength", icon: "💎" },
    { id: "flexibility", label: "Flexibility", icon: "🧘" },
    { id: "general-fitness", label: "General Fitness", icon: "🎯" },
  ]

  const weekDays = [
    { id: "monday", label: "Monday", short: "Mon" },
    { id: "tuesday", label: "Tuesday", short: "Tue" },
    { id: "wednesday", label: "Wednesday", short: "Wed" },
    { id: "thursday", label: "Thursday", short: "Thu" },
    { id: "friday", label: "Friday", short: "Fri" },
    { id: "saturday", label: "Saturday", short: "Sat" },
    { id: "sunday", label: "Sunday", short: "Sun" },
  ]

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) => (prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]))
  }

  const handleDayToggle = (dayId: string) => {
    setWorkoutDays((prev) => (prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]))
  }

  // Get workout duration in minutes
  const getDurationFromSelection = () => {
    switch(sessionDuration) {
      case '15-30': return 25
      case '30-45': return 40
      case '45-60': return 55
      case '60+': return 70
      default: return 45
    }
  }

  // Generate the combined plan
  const generatePlan = async () => {
    setIsGenerating(true);
    setUsedFallback(false);
    try {
      console.log("⚙️ Generating combined workout and diet plan");
      
      const plan = await generateCombinedPlan(
        // Workout params
        selectedGoals,
        fitnessLevel,
        workoutDays,
        sessionDuration,
        // Diet params
        dietType,
        allergies,
        lifestyle,
        junkFoodFreq,
        sweetsFreq,
        saladFreq
      );
      
      console.log("📊 Received combined plan:", plan);
      
      // Store the plan in localStorage
      localStorage.setItem('generatedPlan', JSON.stringify(plan));
      
      // Redirect to plan view page
      router.push('/plan-view');
      
    } catch (error) {
      console.error("❌ Error generating combined plan:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert("Failed to generate plan: " + errorMessage + "\n\nPlease check your API configuration and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  const savePlan = (plan: any) => {
    if (!plan || !plan.workoutPlan) return;
    
    // Convert the combined plan to a workout plan
    const workoutPlan = { 
      ...plan.workoutPlan, 
      id: Date.now().toString(),
      status: 'saved', 
      savedAt: new Date().toISOString(),
      goals: selectedGoals,
      createdFrom: 'combined',
      dietPlan: plan.dietPlan,
      recommendations: plan.recommendations
    }
    
    // Save using context
    contextSavePlan(workoutPlan);
    alert(t("plan_saved", "Plan saved successfully!"));
  }

  const startPlan = (plan: any) => {
    if (!plan || !plan.workoutPlan) return;
    
    // Convert the combined plan to a workout plan
    const workoutPlan = { 
      ...plan.workoutPlan, 
      id: Date.now().toString(),
      status: 'active', 
      startedAt: new Date().toISOString(),
      goals: selectedGoals,
      createdFrom: 'combined',
      dietPlan: plan.dietPlan,
      recommendations: plan.recommendations
    }
    
    // Start using context
    contextStartPlan(workoutPlan);
    alert(t("plan_started", "Plan started successfully! You can track your progress in the tracker."));
  }

  const getDayTypeColor = (type: string | undefined) => {
    if (!type) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    if (type.includes("Strength")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    if (type.includes("Cardio")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    if (type.includes("Rest")) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    if (type.includes("Recovery")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  }

  // Configuration form for the combined planner
  const renderConfigForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Workout Configuration */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-orange-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-600" />
            <span>{t("workout_configuration", "Workout Configuration")}</span>
          </CardTitle>
          <CardDescription>
            {t("workout_config_desc", "Set up your workout goals and preferences")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fitness Goals */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("fitness_goals", "Fitness Goals")}</Label>
            <div className="grid grid-cols-2 gap-3">
              {fitnessGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedGoals.includes(goal.id)
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <span className="text-xl">{goal.icon}</span>
                  <span className="text-sm font-medium">{t(goal.id.replace("-", "_"), goal.label)}</span>
                </div>
              ))}
            </div>
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
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
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
        </CardContent>
      </Card>

      {/* Diet Configuration */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>{t("diet_configuration", "Diet Configuration")}</span>
          </CardTitle>
          <CardDescription>
            {t("diet_config_desc", "Set up your dietary preferences")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Diet Type */}
          <div className="space-y-2">
            <Label htmlFor="diet-type">{t("diet_type", "Diet Type")}</Label>
            <Select value={dietType} onValueChange={v => setDietType(v as DietType)}>
              <SelectTrigger id="diet-type">
                <SelectValue placeholder={t("select_diet_type", "Select your diet type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veg">{t("vegetarian", "Vegetarian")}</SelectItem>
                <SelectItem value="non-veg">{t("non_vegetarian", "Non-Vegetarian")}</SelectItem>
                <SelectItem value="vegan">{t("vegan", "Vegan")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies">{t("allergies", "Allergies (comma separated)")}</Label>
            <input
              id="allergies"
              className="w-full border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800"
              type="text"
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
              placeholder={t("allergies_placeholder", "e.g., nuts, dairy, gluten")}
            />
          </div>

          {/* Lifestyle */}
          <div className="space-y-2">
            <Label htmlFor="lifestyle">{t("lifestyle", "Lifestyle")}</Label>
            <Select value={lifestyle} onValueChange={v => setLifestyle(v as Lifestyle)}>
              <SelectTrigger id="lifestyle">
                <SelectValue placeholder={t("select_lifestyle", "Select your lifestyle")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">{t("balanced", "Balanced")}</SelectItem>
                <SelectItem value="junk food">{t("junk_food_lover", "Junk Food Lover")}</SelectItem>
                <SelectItem value="salad">{t("salad_lover", "Salad Lover")}</SelectItem>
                <SelectItem value="sweets">{t("sweets_lover", "Sweets Lover")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Food Frequencies */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="junk-food">{t("junk_food_freq", "Junk Food")}</Label>
              <Select value={junkFoodFreq} onValueChange={v => setJunkFoodFreq(v as Frequency)}>
                <SelectTrigger id="junk-food">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">{t("never", "Never")}</SelectItem>
                  <SelectItem value="rarely">{t("rarely", "Rarely")}</SelectItem>
                  <SelectItem value="sometimes">{t("sometimes", "Sometimes")}</SelectItem>
                  <SelectItem value="often">{t("often", "Often")}</SelectItem>
                  <SelectItem value="daily">{t("daily", "Daily")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sweets">{t("sweets_freq", "Sweets")}</Label>
              <Select value={sweetsFreq} onValueChange={v => setSweetsFreq(v as Frequency)}>
                <SelectTrigger id="sweets">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">{t("never", "Never")}</SelectItem>
                  <SelectItem value="rarely">{t("rarely", "Rarely")}</SelectItem>
                  <SelectItem value="sometimes">{t("sometimes", "Sometimes")}</SelectItem>
                  <SelectItem value="often">{t("often", "Often")}</SelectItem>
                  <SelectItem value="daily">{t("daily", "Daily")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salad">{t("salad_freq", "Salad")}</Label>
              <Select value={saladFreq} onValueChange={v => setSaladFreq(v as Frequency)}>
                <SelectTrigger id="salad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">{t("never", "Never")}</SelectItem>
                  <SelectItem value="rarely">{t("rarely", "Rarely")}</SelectItem>
                  <SelectItem value="sometimes">{t("sometimes", "Sometimes")}</SelectItem>
                  <SelectItem value="often">{t("often", "Often")}</SelectItem>
                  <SelectItem value="daily">{t("daily", "Daily")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Generate Button */}
      <div className="col-span-1 lg:col-span-2">
        <Button
          onClick={generatePlan}
          disabled={isGenerating || selectedGoals.length === 0 || !fitnessLevel || workoutDays.length === 0 || !dietType}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t("generating", "Generating Combined Plan...")}
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              {t("generate_combined_plan", "Generate Combined Workout & Diet Plan")}
            </>
          )}
        </Button>
      </div>
    </div>
  )

  // Render the generated plan
  const renderGeneratedPlan = () => {
    if (!generatedPlan) return null;
    
    return (
      <div className="space-y-6">
        {/* Plan Overview */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-orange-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{generatedPlan.workoutPlan?.name || "Custom Fitness Program"}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {generatedPlan.workoutPlan?.duration || "1 week"} • {generatedPlan.workoutPlan?.difficulty || fitnessLevel} • {generatedPlan.workoutPlan?.totalWorkouts || workoutDays.length} workouts
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{generatedPlan.workoutPlan?.estimatedCalories || "~1500"}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("total_workout_calories", "Workout Calories")}
                </div>
              </div>
            </div>
            
            {usedFallback && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">We had trouble generating a fully customized plan</p>
                    <p className="text-sm mt-1">We've created a plan that matches your goals, but some details may be general. Try again or adjust your preferences to get a more personalized plan.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-amber-700 border-amber-200 hover:bg-amber-100"
                      onClick={() => {
                        setUsedFallback(false);
                        setGeneratedPlan(null);
                        setTimeout(() => {
                          generatePlan();
                        }, 100);
                      }}
                    >
                      Try generating again
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => startPlan(generatedPlan)}
                className="bg-gradient-to-r from-orange-600 to-red-600"
              >
                <Play className="h-4 w-4 mr-2" />
                {t("start_plan", "Start Plan")}
              </Button>
              
              <Button 
                onClick={() => savePlan(generatedPlan)}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                {t("save_plan", "Save Plan")}
              </Button>
              
              <Button 
                onClick={() => setActiveTab("workout")}
                variant={activeTab === "workout" ? "default" : "outline"}
                className={activeTab === "workout" ? "bg-blue-600" : ""}
              >
                <Target className="h-4 w-4 mr-2" />
                {t("workout_plan", "Workout Plan")}
              </Button>
              
              <Button 
                onClick={() => setActiveTab("diet")}
                variant={activeTab === "diet" ? "default" : "outline"}
                className={activeTab === "diet" ? "bg-green-600" : ""}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {t("diet_plan", "Diet Plan")}
              </Button>
              
              <Button 
                onClick={() => setActiveTab("recommendations")}
                variant={activeTab === "recommendations" ? "default" : "outline"}
                className={activeTab === "recommendations" ? "bg-purple-600" : ""}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("recommendations", "Recommendations")}
              </Button>
              
              <Button 
                onClick={() => setGeneratedPlan(null)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("create_new", "Create New Plan")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="mt-4">
          {/* Workout Plan Tab */}
          {activeTab === "workout" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {generatedPlan.workoutPlan?.schedule?.map((day: any, index: number) => (
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
                      <div className="space-y-2">
                        {day.exercises.slice(0, 3).map((exercise: any, exerciseIndex: number) => (
                          <div key={exerciseIndex} className="text-sm">
                            <div className="font-medium">{exercise.name}</div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {exercise.sets} sets × {exercise.reps} • {exercise.rest} rest
                            </div>
                          </div>
                        ))}
                        {day.exercises.length > 3 && (
                          <div className="text-sm text-gray-500">+{day.exercises.length - 3} more exercises</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">{t("rest_day", "Rest and recovery day")}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Diet Plan Tab */}
          {activeTab === "diet" && (
            <div className="space-y-6">
              {/* Diet Plan Overview */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>{generatedPlan.dietPlan?.name || "Personalized Diet Plan"}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {generatedPlan.dietPlan?.type || dietType}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {generatedPlan.dietPlan?.dailyCalories || "~2000"} calories/day
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium text-lg mb-2">Macro Breakdown</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                          {generatedPlan.dietPlan?.macroBreakdown?.protein || "30%"}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Protein</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        <div className="text-xl font-bold text-green-700 dark:text-green-300">
                          {generatedPlan.dietPlan?.macroBreakdown?.carbs || "40%"}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">Carbs</div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                        <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                          {generatedPlan.dietPlan?.macroBreakdown?.fat || "30%"}
                        </div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">Fat</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Diet Schedule */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Weekly Meal Plan</h3>
                {/* Diet Schedule Tabs */}
                <Tabs defaultValue="Monday" className="w-full">
                  <TabsList className="grid grid-cols-7 mb-4">
                    {Object.keys(generatedPlan.dietPlan?.schedule || {}).map((day) => (
                      <TabsTrigger key={day} value={day}>{day.substring(0, 3)}</TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Diet Schedule Content */}
                  {Object.entries(generatedPlan.dietPlan?.schedule || {}).map(([day, meals]: [string, any]) => (
                    <TabsContent key={day} value={day} className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{day}'s Meals</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Breakfast</h4>
                              <p>{meals.breakfast}</p>
                            </div>
                            
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Lunch</h4>
                              <p>{meals.lunch}</p>
                            </div>
                            
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Dinner</h4>
                              <p>{meals.dinner}</p>
                            </div>
                            
                            {meals.snacks && meals.snacks.length > 0 && (
                              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Snacks</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {meals.snacks.map((snack: string, i: number) => (
                                    <li key={i}>{snack}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Workout Integration */}
                          {generatedPlan.workoutPlan?.schedule?.some((scheduleDay: any) => 
                            scheduleDay.day === day && scheduleDay.exercises?.length > 0
                          ) && (
                            <div className="p-3 mt-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                                Workout Day Nutrition Tip
                              </h4>
                              <p className="text-sm">
                                Today is a workout day! Focus on protein intake and complex carbs for energy.
                                Consider eating a protein-rich meal within 30 minutes after your workout.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Nutrition & Workout Recommendations</CardTitle>
                <CardDescription>
                  Follow these guidelines to maximize your results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pre-workout Nutrition */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Pre-workout Nutrition
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300">
                    {generatedPlan.recommendations?.preworkoutNutrition || 
                      "Eat a balanced meal with protein and carbs 1-2 hours before your workout for optimal energy."}
                  </p>
                </div>

                {/* Post-workout Nutrition */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                    Post-workout Nutrition
                  </h4>
                  <p className="text-green-700 dark:text-green-300">
                    {generatedPlan.recommendations?.postworkoutNutrition || 
                      "Consume protein within 30 minutes after your workout to support muscle recovery."}
                  </p>
                </div>

                {/* Hydration */}
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <h4 className="font-medium text-cyan-800 dark:text-cyan-200 mb-2">
                    Hydration
                  </h4>
                  <p className="text-cyan-700 dark:text-cyan-300">
                    {generatedPlan.recommendations?.hydration || 
                      "Drink at least 2-3 liters of water per day, more on workout days."}
                  </p>
                </div>

                {/* Supplements */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                    Supplement Recommendations (Optional)
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-purple-700 dark:text-purple-300">
                    {generatedPlan.recommendations?.supplements?.map((supplement: string, i: number) => (
                      <li key={i}>{supplement}</li>
                    )) || (
                      <>
                        <li>Protein powder for muscle recovery</li>
                        <li>Multivitamin for general health</li>
                        <li>Fish oil for joint health and recovery</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          {t("combined_planner", "AI Fitness & Nutrition Planner")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t(
            "combined_planner_desc",
            "Create a personalized workout plan with a matching diet plan tailored to your goals, fitness level, and dietary preferences."
          )}
        </p>
      </div>

      {/* Main Content */}
      {!generatedPlan ? renderConfigForm() : renderGeneratedPlan()}
    </div>
  )
}

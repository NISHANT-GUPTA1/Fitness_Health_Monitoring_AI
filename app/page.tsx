"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  Play,
  CheckCircle,
  Trophy,
  Heart,
  Dumbbell,
  Camera,
} from "lucide-react"

// Import components
import LanguageSelector from "./components/LanguageSelector"
import GymMachineGuide from "./components/GymMachineGuide"
import WorkoutPlanner from "./components/WorkoutPlanner"
import FitnessTracker from "./components/FitnessTracker"
import PartnerFinder from "./components/PartnerFinderClean"
import DailyExercises from "./components/DailyExercises"
import UserProfile from "./components/UserProfile"

export default function FitnessApp() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Mock data for dashboard
  const todayStats = {
    workoutsCompleted: 1,
    workoutGoal: 3,
    caloriesBurned: 320,
    calorieGoal: 500,
    activeMinutes: 45,
    activeGoal: 60,
    steps: 8247,
    stepGoal: 10000,
  }

  const quickActions = [
    {
      id: "daily-workout",
      title: t("start_daily_workout"),
      description: t("morning_energy_boost"),
      icon: Play,
      color: "from-green-500 to-teal-500",
      action: () => setActiveTab("daily-exercises"),
    },
    {
      id: "check-form",
      title: t("check_my_form"),
      description: t("ai_posture_analysis"),
      icon: Camera,
      color: "from-blue-500 to-purple-500",
      action: () => setActiveTab("machines"),
    },
    {
      id: "find-partner",
      title: t("find_partner"),
      description: t("connect_workout_buddies"),
      icon: Users,
      color: "from-purple-500 to-pink-500",
      action: () => setActiveTab("partners"),
    },
    {
      id: "track-progress",
      title: t("track_progress"),
      description: t("view_fitness_journey"),
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      action: () => setActiveTab("tracker"),
    },
  ]

  const recentWorkouts = [
    { name: t("upper_body_strength"), date: t("today"), duration: 45, calories: 320, completed: true },
    { name: t("morning_cardio"), date: t("yesterday"), duration: 30, calories: 280, completed: true },
    { name: t("yoga_flow"), date: "2 " + t("days_ago"), duration: 60, calories: 180, completed: true },
  ]

  const upcomingWorkouts = [
    { name: t("lower_body_strength"), time: "6:00 PM", type: t("strength"), duration: 45 },
    { name: t("hiit_cardio"), time: t("tomorrow") + " 7:00 AM", type: t("cardio"), duration: 25 },
    { name: t("flexibility_stretch"), time: t("tomorrow") + " 8:00 PM", type: t("flexibility"), duration: 30 },
  ]

  const achievements = [
    { name: t("week_warrior"), description: t("week_warrior_desc"), icon: "💪", earned: true },
    { name: t("consistency_king"), description: t("consistency_king_desc"), icon: "👑", earned: false },
    { name: t("calorie_crusher"), description: t("calorie_crusher_desc"), icon: "🔥", earned: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FitAI
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button
                onClick={() => setActiveTab("profile")}
                variant="outline"
                size="sm"
                className="bg-white/50 backdrop-blur-sm"
              >
                <Users className="h-4 w-4 mr-2" />
                {t("profile")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation */}
          <TabsList className="grid w-full grid-cols-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-1 h-auto">
            <TabsTrigger
              value="dashboard"
              className="flex flex-col items-center space-y-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Activity className="h-5 w-5" />
              <span className="text-xs">{t("dashboard")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="daily-exercises"
              className="flex flex-col items-center space-y-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Zap className="h-5 w-5" />
              <span className="text-xs">{t("daily_exercises")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="machines"
              className="flex flex-col items-center space-y-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Dumbbell className="h-5 w-5" />
              <span className="text-xs">{t("machines")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="planner"
              className="flex flex-col items-center space-y-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs">{t("planner")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="tracker"
              className="flex flex-col items-center space-y-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">{t("tracker")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="partners"
              className="flex flex-col items-center space-y-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">{t("partners")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("welcome_back")}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {t("ready_to_crush")}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">{t("workouts_today")}</p>
                      <p className="text-3xl font-bold">
                        {todayStats.workoutsCompleted}/{todayStats.workoutGoal}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">{t("calories_burned")}</p>
                      <p className="text-3xl font-bold">{todayStats.caloriesBurned}</p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">{t("active_minutes")}</p>
                      <p className="text-3xl font-bold">{todayStats.activeMinutes}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">{t("steps_today")}</p>
                      <p className="text-3xl font-bold">{todayStats.steps.toLocaleString()}</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span>{t("quick_actions")}</span>
                </CardTitle>
                <CardDescription>
                  {t("quick_actions_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      onClick={action.action}
                      className={`h-auto p-6 bg-gradient-to-r ${action.color} hover:scale-105 transition-transform`}
                    >
                      <div className="flex flex-col items-center space-y-2 text-white">
                        <action.icon className="h-8 w-8" />
                        <div className="text-center">
                          <div className="font-semibold">{action.title}</div>
                          <div className="text-xs opacity-90">{action.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent & Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Workouts */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t("recent_workouts")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentWorkouts.map((workout, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium">{workout.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{workout.date}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{workout.duration} {t("min")}</div>
                          <div className="text-gray-600 dark:text-gray-400">{workout.calories} {t("cal")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Workouts */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>{t("upcoming_workouts")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingWorkouts.map((workout, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <div>
                            <h4 className="font-medium">{workout.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{workout.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{workout.type}</Badge>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{workout.duration} {t("min")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span>{t("recent_achievements")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        achievement.earned
                          ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 opacity-60"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{achievement.icon}</div>
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        {achievement.earned && (
                          <Badge className="mt-2 bg-yellow-100 text-yellow-800">{t("earned")}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="daily-exercises">
            <DailyExercises />
          </TabsContent>

          <TabsContent value="machines">
            <GymMachineGuide />
          </TabsContent>

          <TabsContent value="planner">
            <WorkoutPlanner />
          </TabsContent>

          <TabsContent value="tracker">
            <FitnessTracker />
          </TabsContent>

          <TabsContent value="partners">
            <PartnerFinder />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold">FitAI</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t("footer_text", "Your AI-powered fitness companion for a healthier lifestyle.")}
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">
                {t("privacy", "Privacy")}
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                {t("terms", "Terms")}
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                {t("support", "Support")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

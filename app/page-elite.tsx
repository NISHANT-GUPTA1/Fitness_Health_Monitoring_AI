"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  ArrowRight,
  Sparkles,
  Flame,
  Brain,
  Shield,
  Star,
  Accessibility,
  ChevronRight,
  Play,
  Camera,
  Users,
  Dumbbell,
  TrendingUp,
  Heart,
} from "lucide-react"

// Import components
import EliteNavigation from "./components/EliteNavigation"
import LanguageSelector from "./components/LanguageSelector"
import GymMachineGuide from "./components/GymMachineGuide"
import FitnessTracker from "./components/FitnessTracker"
import PartnerFinder from "./components/PartnerFinderClean"
import DailyExercises from "./components/DailyExercises"
import UserProfile from "./components/UserProfile"
import Products from "./components/Products"
import CombinedPlanner from "./components/CombinedPlanner"
import CheckMyForm from "./components/CheckMyForm"
import FindGym from "./components/FindGym"
import AdaptiveFitnessForDisabilities from "./components/AdaptiveFitnessForDisabilities"

export default function EliteFitnessApp() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState("home")

  const todayStats = [
    { 
      label: "Calories Burned", 
      value: "847", 
      unit: "kcal", 
      goal: "1200",
      progress: 70,
      icon: Flame,
      color: "from-orange-500 to-red-500" 
    },
    { 
      label: "Active Minutes", 
      value: "45", 
      unit: "min", 
      goal: "60",
      progress: 75,
      icon: Activity,
      color: "from-green-500 to-emerald-500" 
    },
    { 
      label: "Workouts", 
      value: "2", 
      unit: "of 3", 
      goal: "3",
      progress: 66,
      icon: Dumbbell,
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      label: "Steps", 
      value: "8,247", 
      unit: "", 
      goal: "10,000",
      progress: 82,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500" 
    },
  ]

  const eliteFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Coaching",
      description: "Personalized workout plans that adapt to your progress in real-time",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Accessibility,
      title: "Adaptive Fitness",
      description: "Specialized programs for all abilities and disabilities",
      gradient: "from-green-500 to-teal-500",
      action: () => setActiveSection("adaptive-fitness")
    },
    {
      icon: Camera,
      title: "Form Analysis",
      description: "Real-time posture correction using advanced AI",
      gradient: "from-blue-500 to-cyan-500",
      action: () => setActiveSection("form-check")
    },
    {
      icon: Heart,
      title: "Wellness Tracking",
      description: "Comprehensive health metrics and nutrition guidance",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Users,
      title: "Community Connect",
      description: "Find workout partners and join challenges",
      gradient: "from-orange-500 to-amber-500",
      action: () => setActiveSection("partners")
    },
    {
      icon: Shield,
      title: "Injury Prevention",
      description: "Smart recovery protocols and mobility work",
      gradient: "from-emerald-500 to-green-500"
    },
  ]

  const quickActions = [
    {
      title: "Start Daily Workout",
      subtitle: "Your personalized routine awaits",
      icon: Play,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      action: () => setActiveSection("daily-exercises")
    },
    {
      title: "Check My Form",
      subtitle: "AI-powered posture analysis",
      icon: Camera,
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      action: () => setActiveSection("form-check")
    },
    {
      title: "Adaptive Fitness",
      subtitle: "Inclusive workouts for all abilities",
      icon: Accessibility,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      action: () => setActiveSection("adaptive-fitness")
    },
    {
      title: "Find Workout Partner",
      subtitle: "Connect with fitness community",
      icon: Users,
      color: "bg-gradient-to-br from-orange-500 to-red-600",
      action: () => setActiveSection("partners")
    },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "daily-exercises":
        return <DailyExercises />
      case "form-check":
        return <CheckMyForm />
      case "adaptive-fitness":
        return <AdaptiveFitnessForDisabilities />
      case "partners":
        return <PartnerFinder />
      case "machines":
        return <GymMachineGuide />
      case "tracker":
        return <FitnessTracker />
      case "planner":
        return <CombinedPlanner />
      case "profile":
        return <UserProfile />
      case "products":
        return <Products />
      case "find-gym":
        return <FindGym />
      default:
        return renderHomepage()
    }
  }

  const renderHomepage = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 dark:from-black dark:via-indigo-950 dark:to-purple-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Animated Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-xl px-4 py-2 text-sm animate-slide-up">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            AI-Powered Fitness Revolution
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Transform Your Body,
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Elevate Your Mind
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Experience personalized training, adaptive fitness programs, and AI-powered form correction. 
            Your elite fitness journey starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-6 rounded-full shadow-elite-dark group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-xl text-lg px-8 py-6 rounded-full"
              onClick={() => setActiveSection("adaptive-fitness")}
            >
              Explore Adaptive Fitness
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: "50K+", label: "Active Users" },
              { value: "1M+", label: "Workouts Completed" },
              { value: "98%", label: "Success Rate" },
              { value: "24/7", label: "AI Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-white/50 rotate-90" />
        </div>
      </section>

      {/* Today's Stats Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text dark:gradient-text-dark">Today's Progress</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400">Keep pushing towards your goals</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {todayStats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-elite transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{stat.progress}%</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{stat.value}</span>
                      <span className="text-sm text-muted-foreground">{stat.unit}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${stat.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">Goal: {stat.goal}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text dark:gradient-text-dark">Quick Start</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400">Jump right into your fitness journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className="group cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={action.action}
              >
                <div className={`h-2 ${action.color}`} />
                <CardContent className="p-6">
                  <div className={`inline-flex p-4 rounded-2xl ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{action.subtitle}</p>
                  <div className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Elite Features */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-0">
              <Star className="w-4 h-4 mr-2 inline" />
              Premium Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="gradient-text dark:gradient-text-dark">Elite Fitness Experience</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Advanced technology meets personalized training for unmatched results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eliteFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-elite dark:hover:shadow-elite-dark transition-all duration-300 cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={feature.action}
              >
                <CardHeader>
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users who've achieved their fitness goals with EliteFit AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-slate-100 font-semibold text-lg px-8 py-6 rounded-full shadow-xl"
            >
              Start Your Journey
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-xl text-lg px-8 py-6 rounded-full"
            >
              Watch Demo
              <Play className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <EliteNavigation />
      <div className="pt-20">
        {renderContent()}
      </div>
      
      {/* Language Selector - Fixed bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <LanguageSelector />
      </div>
    </div>
  )
}

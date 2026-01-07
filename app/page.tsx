"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
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
  ShoppingBag,
  User,
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
import EnhancedShop from "./components/EnhancedShop"
import CombinedPlanner from "./components/CombinedPlanner"
import CheckMyForm from "./components/CheckMyForm"
import FindGym from "./components/FindGym"
import AdaptiveFitnessForDisabilities from "./components/AdaptiveFitnessForDisabilities"
import AccessibilityPanel from "./components/AccessibilityPanel"
import PricingTiers from "./components/PricingTiers"
import RewardsSystem from "./components/RewardsSystem"
import Footer from "./components/Footer"
import { ScrollAnimatedSection, ScrollFadeImage } from "./components/ScrollAnimatedSection"

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
      title: "Workout & Diet Plan Generator",
      description: "AI-powered personalized workout and nutrition plans tailored to your goals",
      gradient: "from-indigo-500 to-purple-500",
      action: () => setActiveSection("planner")
    },
    {
      icon: Accessibility,
      title: "Adaptive Fitness for All Abilities",
      description: "Specialized programs with accessibility features for every disability",
      gradient: "from-green-500 to-teal-500",
      action: () => setActiveSection("adaptive-fitness")
    },
    {
      icon: Camera,
      title: "Form Analysis Camera",
      description: "Real-time posture correction with voice guidance for visual accessibility",
      gradient: "from-blue-500 to-cyan-500",
      action: () => window.location.href = '/pose'
    },
    {
      icon: Heart,
      title: "Wellness Tracking",
      description: "Comprehensive health metrics with audio feedback support",
      gradient: "from-pink-500 to-rose-500",
      action: () => setActiveSection("tracker")
    },
    {
      icon: Users,
      title: "Community Connect",
      description: "Find workout partners and join challenges with screen reader support",
      gradient: "from-orange-500 to-amber-500",
      action: () => setActiveSection("partners")
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
      action: () => window.location.href = '/pose'
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
      case "adaptive-fitness":
        return <AdaptiveFitnessForDisabilities />
      case "accessibility-options":
        return <AccessibilityPanel />
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
      case "shop":
        return <EnhancedShop />
      case "pricing":
        return <PricingTiers />
      case "rewards":
        return <RewardsSystem />
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
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [-20, 20, -20],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-xl px-4 py-2 text-sm">
              <Heart className="w-4 h-4 mr-2 inline" />
              Designed for Every Body, Every Ability.
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transform Your Body,
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Elevate Your Mind
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience personalized training, adaptive fitness programs, and AI-powered form correction. 
            Your elite fitness journey starts here.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-6 rounded-full shadow-elite-dark group"
              onClick={() => setActiveSection("pricing")}
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
          </motion.div>

        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronRight className="w-6 h-6 text-white/50 rotate-90" />
        </motion.div>
      </section>

      {/* Today's Stats Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="gradient-text dark:gradient-text-dark">Today's Progress</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400">Keep pushing towards your goals</p>
            </div>
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-4 gap-6">
            {todayStats.map((stat, index) => (
              <ScrollFadeImage key={index} delay={index * 0.1}>
                <Card className="relative overflow-hidden group hover:shadow-elite transition-all duration-300 h-full">
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
              </ScrollFadeImage>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="gradient-text dark:gradient-text-dark">Quick Start</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400">Jump right into your fitness journey</p>
            </div>
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <ScrollFadeImage key={index} delay={index * 0.1}>
                <Card 
                  className="group cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden h-full"
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
              </ScrollFadeImage>
            ))}
          </div>
        </div>
      </section>

      {/* Elite Features */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection>
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
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eliteFeatures.map((feature, index) => (
              <ScrollFadeImage key={index} delay={index * 0.1}>
                <Card 
                  className="group hover:shadow-elite dark:hover:shadow-elite-dark transition-all duration-300 cursor-pointer h-full"
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
              </ScrollFadeImage>
            ))}
          </div>
        </div>
      </section>

      {/* More Features Section */}
      <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Explore More Features
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover everything FEFE has to offer
              </p>
            </div>
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-4 gap-6">
            <ScrollFadeImage delay={0}>
              <button 
                onClick={() => setActiveSection("adaptive-fitness")}
                className="group p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:shadow-lg transition-all text-left w-full"
              >
                <Accessibility className="w-10 h-10 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="font-bold text-lg mb-2">Adaptive Fitness</h3>
                <p className="text-sm text-muted-foreground">Inclusive workouts for all abilities</p>
              </button>
            </ScrollFadeImage>

            <ScrollFadeImage delay={0.1}>
              <button 
                onClick={() => setActiveSection("pricing")}
                className="group p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 hover:shadow-lg transition-all text-left w-full"
              >
                <ShoppingBag className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3" />
                <h3 className="font-bold text-lg mb-2">Pricing Plans</h3>
                <p className="text-sm text-muted-foreground">Choose your perfect plan</p>
              </button>
            </ScrollFadeImage>

            <ScrollFadeImage delay={0.2}>
              <button 
                onClick={() => setActiveSection("rewards")}
                className="group p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 hover:shadow-lg transition-all text-left w-full"
              >
                <Star className="w-10 h-10 text-yellow-600 dark:text-yellow-400 mb-3" />
                <h3 className="font-bold text-lg mb-2">FEFE Rewards</h3>
                <p className="text-sm text-muted-foreground">Earn points & get discounts</p>
              </button>
            </ScrollFadeImage>

            <ScrollFadeImage delay={0.3}>
              <button 
                onClick={() => setActiveSection("profile")}
                className="group p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 hover:shadow-lg transition-all text-left w-full"
              >
                <User className="w-10 h-10 text-pink-600 dark:text-pink-400 mb-3" />
                <h3 className="font-bold text-lg mb-2">Your Profile</h3>
                <p className="text-sm text-muted-foreground">Track your fitness journey</p>
              </button>
            </ScrollFadeImage>
          </div>
        </div>
      </section>

    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <EliteNavigation onNavigate={setActiveSection} />
      <div className="pt-20">
        {renderContent()}
      </div>
      
      {/* Footer */}
      {activeSection === "home" && <Footer />}
      
      {/* Language Selector - Fixed bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <LanguageSelector />
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Award, 
  TrendingUp, 
  ShoppingCart,
  Zap,
  Gift,
  Star,
  Crown,
  Sparkles,
  CheckCircle2,
  Dumbbell,
  Apple,
  Calendar,
  Flame,
  Target,
  Trophy,
  Coins
} from "lucide-react"
import { ScrollAnimatedSection, ScrollFadeImage } from "./ScrollAnimatedSection"

interface UserRewards {
  totalPoints: number
  currentStreak: number
  workoutsCompleted: number
  dietsFollowed: number
  purchasesMade: number
  level: string
  nextLevelPoints: number
}

const pointsActivities = [
  {
    icon: Dumbbell,
    title: "Complete Workout",
    points: 50,
    color: "from-blue-500 to-cyan-500",
    description: "Finish your daily workout"
  },
  {
    icon: Apple,
    title: "Follow Diet Plan",
    points: 30,
    color: "from-green-500 to-emerald-500",
    description: "Stick to your meal plan"
  },
  {
    icon: Flame,
    title: "7-Day Streak",
    points: 200,
    color: "from-orange-500 to-red-500",
    description: "Complete 7 days in a row"
  },
  {
    icon: ShoppingCart,
    title: "Shop Products",
    points: 100,
    color: "from-purple-500 to-pink-500",
    description: "5% back on every purchase"
  },
  {
    icon: Crown,
    title: "Monthly Challenge",
    points: 500,
    color: "from-yellow-500 to-orange-500",
    description: "Complete monthly goals"
  },
  {
    icon: Star,
    title: "Share Progress",
    points: 20,
    color: "from-indigo-500 to-purple-500",
    description: "Share on social media"
  },
]

const rewardsRedemption = [
  {
    title: "₹100 Off Subscription",
    points: 500,
    value: 100,
    icon: Trophy,
    popular: true
  },
  {
    title: "₹200 Product Discount",
    points: 800,
    value: 200,
    icon: Gift,
    popular: false
  },
  {
    title: "Free Month Pro",
    points: 1500,
    value: 1499,
    icon: Crown,
    popular: true
  },
  {
    title: "₹500 Shopping Voucher",
    points: 2000,
    value: 500,
    icon: ShoppingCart,
    popular: false
  },
  {
    title: "1-on-1 Trainer Session",
    points: 2500,
    value: 2999,
    icon: Dumbbell,
    popular: false
  },
  {
    title: "₹1000 Mega Voucher",
    points: 3500,
    value: 1000,
    icon: Sparkles,
    popular: true
  },
]

const levelBenefits = [
  { level: "Bronze", minPoints: 0, badge: "🥉", benefits: ["Basic rewards", "5% cashback"] },
  { level: "Silver", minPoints: 1000, badge: "🥈", benefits: ["7% cashback", "Early access"] },
  { level: "Gold", minPoints: 3000, badge: "🥇", benefits: ["10% cashback", "Priority support"] },
  { level: "Platinum", minPoints: 7000, badge: "💎", benefits: ["15% cashback", "Exclusive deals", "Free shipping"] },
]

export default function RewardsSystem() {
  const [userRewards, setUserRewards] = useState<UserRewards>({
    totalPoints: 0,
    currentStreak: 0,
    workoutsCompleted: 0,
    dietsFollowed: 0,
    purchasesMade: 0,
    level: "Bronze",
    nextLevelPoints: 1000
  })

  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Load rewards from localStorage
    const savedRewards = localStorage.getItem("fefeRewards")
    if (savedRewards) {
      setUserRewards(JSON.parse(savedRewards))
    }
  }, [])

  const getUserLevel = (points: number) => {
    for (let i = levelBenefits.length - 1; i >= 0; i--) {
      if (points >= levelBenefits[i].minPoints) {
        return levelBenefits[i]
      }
    }
    return levelBenefits[0]
  }

  const currentLevel = getUserLevel(userRewards.totalPoints)
  const nextLevel = levelBenefits[levelBenefits.findIndex(l => l.level === currentLevel.level) + 1]
  const progressToNextLevel = nextLevel 
    ? ((userRewards.totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100

  const redeemReward = (reward: typeof rewardsRedemption[0]) => {
    if (userRewards.totalPoints >= reward.points) {
      const newPoints = userRewards.totalPoints - reward.points
      const updatedRewards = { ...userRewards, totalPoints: newPoints }
      setUserRewards(updatedRewards)
      localStorage.setItem("fefeRewards", JSON.stringify(updatedRewards))
      
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      
      alert(`🎉 Reward redeemed! ${reward.title} has been added to your account.`)
    } else {
      alert(`❌ Not enough points. You need ${reward.points - userRewards.totalPoints} more points.`)
    }
  }

  const addTestPoints = (points: number) => {
    const updatedRewards = { 
      ...userRewards, 
      totalPoints: userRewards.totalPoints + points,
      workoutsCompleted: userRewards.workoutsCompleted + 1
    }
    setUserRewards(updatedRewards)
    localStorage.setItem("fefeRewards", JSON.stringify(updatedRewards))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-950 dark:to-purple-950 py-20">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            className="text-9xl"
          >
            🎉
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollAnimatedSection>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-0">
              <Award className="w-4 h-4 mr-2 inline" />
              FEFE Rewards Program
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text dark:gradient-text-dark">
              Earn While You
              <br />
              Get Fit
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete workouts, follow your diet, and earn points for discounts and rewards!
            </p>
          </div>
        </ScrollAnimatedSection>

        {/* Points Dashboard */}
        <ScrollAnimatedSection>
          <Card className="mb-12 bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center md:col-span-2">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Coins className="w-8 h-8" />
                    <h2 className="text-5xl font-bold">{userRewards.totalPoints}</h2>
                  </div>
                  <p className="text-purple-100">FEFE Points</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>{currentLevel.badge} {currentLevel.level}</span>
                      {nextLevel && <span>{nextLevel.badge} {nextLevel.level}</span>}
                    </div>
                    <Progress value={progressToNextLevel} className="h-3 bg-purple-700" />
                    {nextLevel && (
                      <p className="text-sm text-purple-100 mt-2">
                        {nextLevel.minPoints - userRewards.totalPoints} points to {nextLevel.level}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-6 h-6" />
                    <h3 className="text-3xl font-bold">{userRewards.currentStreak}</h3>
                  </div>
                  <p className="text-purple-100">Day Streak</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                    <h3 className="text-3xl font-bold">{userRewards.workoutsCompleted}</h3>
                  </div>
                  <p className="text-purple-100">Workouts Done</p>
                </div>
              </div>

              {/* Test Button */}
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={() => addTestPoints(50)}
                  className="bg-white text-purple-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Simulate Workout (+50 points)
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollAnimatedSection>

        {/* Earn Points */}
        <ScrollAnimatedSection>
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">How to Earn Points</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {pointsActivities.map((activity, index) => (
                <ScrollFadeImage key={index} delay={index * 0.1}>
                  <Card className="hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${activity.color} mb-4`}>
                        <activity.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">{activity.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{activity.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                          +{activity.points} points
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollFadeImage>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Redeem Rewards */}
        <ScrollAnimatedSection>
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Redeem Your Points</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {rewardsRedemption.map((reward, index) => (
                <ScrollFadeImage key={index} delay={index * 0.1}>
                  <Card className={`hover:shadow-xl transition-shadow ${reward.popular ? "border-2 border-purple-500" : ""}`}>
                    {reward.popular && (
                      <div className="bg-purple-500 text-white text-center py-1 text-sm font-semibold">
                        🔥 Popular
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <reward.icon className="w-10 h-10 text-purple-500" />
                        <Badge variant="outline" className="text-lg">
                          {reward.points} pts
                        </Badge>
                      </div>
                      <h3 className="font-bold text-xl mb-2">{reward.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Worth ₹{reward.value}
                      </p>
                      <Button 
                        className="w-full"
                        variant={userRewards.totalPoints >= reward.points ? "default" : "outline"}
                        disabled={userRewards.totalPoints < reward.points}
                        onClick={() => redeemReward(reward)}
                      >
                        {userRewards.totalPoints >= reward.points ? "Redeem Now" : "Need More Points"}
                      </Button>
                    </CardContent>
                  </Card>
                </ScrollFadeImage>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Level Benefits */}
        <ScrollAnimatedSection>
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Membership Levels</CardTitle>
              <CardDescription className="text-center">
                Unlock better rewards as you level up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {levelBenefits.map((level, index) => (
                  <div 
                    key={index} 
                    className={`text-center p-6 rounded-2xl ${
                      currentLevel.level === level.level 
                        ? "bg-purple-100 dark:bg-purple-950 border-2 border-purple-500" 
                        : "bg-slate-50 dark:bg-slate-900"
                    }`}
                  >
                    <div className="text-5xl mb-3">{level.badge}</div>
                    <h3 className="font-bold text-xl mb-2">{level.level}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{level.minPoints}+ points</p>
                    <div className="space-y-2">
                      {level.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollAnimatedSection>

        {/* CTA */}
        <ScrollAnimatedSection>
          <div className="mt-16 text-center p-12 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Start Earning Today!
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Complete your first workout and get 50 FEFE Points instantly
            </p>
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-slate-100 font-semibold text-lg px-8 py-6 rounded-full"
              onClick={() => window.location.href = '/'}
            >
              Start Working Out
              <Flame className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </ScrollAnimatedSection>
      </div>
    </div>
  )
}

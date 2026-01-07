"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Star, 
  Gift, 
  TrendingUp, 
  Zap,
  Award,
  Crown,
  Target,
  ShoppingBag,
  ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"

interface PointsTransaction {
  id: string
  type: 'earn' | 'redeem'
  amount: number
  reason: string
  date: string
}

interface RewardsData {
  totalPoints: number
  lifetimePoints: number
  currentStreak: number
  transactions: PointsTransaction[]
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000
}

const REWARDS_CATALOG = [
  {
    id: 'renewal_5',
    name: '$5 Off Subscription',
    points: 100,
    icon: Crown,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'shop_250',
    name: '$2.50 Shop Discount',
    points: 50,
    icon: ShoppingBag,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'trainer_month',
    name: '1 Month Free Trainer',
    points: 200,
    icon: Target,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'product_50',
    name: 'Free $50 Product',
    points: 500,
    icon: Gift,
    color: 'from-green-500 to-emerald-500'
  }
]

export default function RewardsTracker() {
  const [rewardsData, setRewardsData] = useState<RewardsData>({
    totalPoints: 0,
    lifetimePoints: 0,
    currentStreak: 0,
    transactions: [],
    tier: 'bronze'
  })

  useEffect(() => {
    // Load rewards data from localStorage
    const savedData = localStorage.getItem('fefeRewards')
    if (savedData) {
      setRewardsData(JSON.parse(savedData))
    }
  }, [])

  const saveRewardsData = (data: RewardsData) => {
    localStorage.setItem('fefeRewards', JSON.stringify(data))
    setRewardsData(data)
  }

  const earnPoints = (amount: number, reason: string) => {
    const transaction: PointsTransaction = {
      id: Date.now().toString(),
      type: 'earn',
      amount,
      reason,
      date: new Date().toISOString()
    }

    const newTotal = rewardsData.totalPoints + amount
    const newLifetime = rewardsData.lifetimePoints + amount
    const newTier = calculateTier(newLifetime)

    const updatedData = {
      ...rewardsData,
      totalPoints: newTotal,
      lifetimePoints: newLifetime,
      tier: newTier,
      transactions: [transaction, ...rewardsData.transactions].slice(0, 50) // Keep last 50
    }

    saveRewardsData(updatedData)
  }

  const redeemPoints = (amount: number, rewardName: string) => {
    if (rewardsData.totalPoints < amount) {
      alert('Not enough points!')
      return
    }

    const transaction: PointsTransaction = {
      id: Date.now().toString(),
      type: 'redeem',
      amount,
      reason: `Redeemed: ${rewardName}`,
      date: new Date().toISOString()
    }

    const updatedData = {
      ...rewardsData,
      totalPoints: rewardsData.totalPoints - amount,
      transactions: [transaction, ...rewardsData.transactions].slice(0, 50)
    }

    saveRewardsData(updatedData)
    alert(`Successfully redeemed ${rewardName}!`)
  }

  const calculateTier = (lifetimePoints: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum'
    if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold'
    if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver'
    return 'bronze'
  }

  const getTierProgress = () => {
    const currentTier = rewardsData.tier
    const nextTier = currentTier === 'bronze' ? 'silver' : 
                     currentTier === 'silver' ? 'gold' : 
                     currentTier === 'gold' ? 'platinum' : null

    if (!nextTier) return { progress: 100, nextTierPoints: 0, currentTierPoints: TIER_THRESHOLDS.platinum }

    const currentTierPoints = TIER_THRESHOLDS[currentTier]
    const nextTierPoints = TIER_THRESHOLDS[nextTier]
    const progress = ((rewardsData.lifetimePoints - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100

    return { progress, nextTierPoints, currentTierPoints }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return { icon: Crown, color: 'from-purple-500 to-pink-500' }
      case 'gold': return { icon: Trophy, color: 'from-yellow-500 to-orange-500' }
      case 'silver': return { icon: Award, color: 'from-gray-400 to-gray-500' }
      default: return { icon: Star, color: 'from-orange-700 to-orange-800' }
    }
  }

  const tierInfo = getTierIcon(rewardsData.tier)
  const tierProgress = getTierProgress()

  // Make earnPoints available globally for other components
  useEffect(() => {
    (window as any).earnFefePoints = earnPoints
  }, [rewardsData])

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                {rewardsData.totalPoints}
                <span className="text-sm font-normal opacity-90">FEFE Points</span>
              </CardTitle>
              <CardDescription className="text-white/80 mt-2">
                Lifetime earned: {rewardsData.lifetimePoints} points
              </CardDescription>
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${tierInfo.color}`}>
              <tierInfo.icon className="w-10 h-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="capitalize">{rewardsData.tier} Tier</span>
              {tierProgress.nextTierPoints > 0 && (
                <span>{tierProgress.nextTierPoints - rewardsData.lifetimePoints} points to next tier</span>
              )}
            </div>
            <Progress value={tierProgress.progress} className="h-2 bg-white/20" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{rewardsData.currentStreak}</div>
              <div className="text-xs opacity-90">Day Streak</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{rewardsData.transactions.filter(t => t.type === 'earn').length}</div>
              <div className="text-xs opacity-90">Activities</div>
            </div>
            <div className="text-center">
              <Gift className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{rewardsData.transactions.filter(t => t.type === 'redeem').length}</div>
              <div className="text-xs opacity-90">Redeemed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Earn Points
          </CardTitle>
          <CardDescription>Ways to earn FEFE points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              className="w-full justify-between" 
              variant="outline"
              onClick={() => earnPoints(10, 'Completed workout')}
            >
              <span>Complete Daily Workout</span>
              <Badge className="bg-green-500">+10 pts</Badge>
            </Button>
            <Button 
              className="w-full justify-between" 
              variant="outline"
              onClick={() => earnPoints(5, 'Followed diet plan')}
            >
              <span>Follow Diet Plan</span>
              <Badge className="bg-blue-500">+5 pts</Badge>
            </Button>
            <Button 
              className="w-full justify-between" 
              variant="outline"
              onClick={() => earnPoints(50, 'Made a purchase')}
            >
              <span>Shop Purchase (per $50)</span>
              <Badge className="bg-purple-500">+50 pts</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            Redeem Rewards
          </CardTitle>
          <CardDescription>Exchange your points for rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {REWARDS_CATALOG.map((reward) => (
              <motion.div
                key={reward.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${reward.color} mb-3`}>
                      <reward.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2">{reward.name}</h4>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{reward.points} points</Badge>
                      <Button
                        size="sm"
                        onClick={() => redeemPoints(reward.points, reward.name)}
                        disabled={rewardsData.totalPoints < reward.points}
                      >
                        Redeem
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest point transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {rewardsData.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet. Start earning points!
            </p>
          ) : (
            <div className="space-y-2">
              {rewardsData.transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    {transaction.type === 'earn' ? (
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                        <Gift className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{transaction.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={transaction.type === 'earn' ? 'default' : 'secondary'}>
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

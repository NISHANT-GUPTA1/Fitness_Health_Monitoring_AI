"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  X, 
  Zap,
  Crown,
  Star,
  Camera,
  Users,
  TrendingUp,
  Award,
  Gift,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Trophy,
  Target
} from "lucide-react"
import Link from "next/link"
import { ScrollAnimatedSection, ScrollFadeImage } from "./ScrollAnimatedSection"

interface PricingTier {
  id: string
  name: string
  price: number
  period: string
  description: string
  icon: any
  gradient: string
  popular?: boolean
  features: {
    included: string[]
    notIncluded?: string[]
  }
  badge?: string
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    period: '14 days',
    description: 'Perfect for getting started with basic fitness',
    icon: Zap,
    gradient: 'from-slate-500 to-slate-600',
    features: {
      included: [
        'Basic gym exercises library',
        'Daily workout suggestions',
        'Basic progress tracking',
        'Community access',
        'Nutrition tips',
        'Standard support'
      ],
      notIncluded: [
        'AI Pose Camera',
        'Personal trainer',
        'Advanced analytics',
        'Product discounts'
      ]
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    period: 'month',
    description: 'Full AI-powered form correction for all exercises',
    icon: Camera,
    gradient: 'from-indigo-500 to-purple-600',
    popular: true,
    badge: 'Most Popular',
    features: {
      included: [
        'Everything in Free',
        '✨ AI Pose Camera for ALL exercises',
        'Real-time form correction',
        'Advanced workout plans',
        'Detailed progress analytics',
        'Custom diet plans',
        'Priority support',
        '10% discount on shop products'
      ]
    }
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 79.99,
    period: 'month',
    description: 'Premium experience with human trainer support',
    icon: Crown,
    gradient: 'from-yellow-500 to-orange-500',
    badge: 'Best Value',
    features: {
      included: [
        'Everything in Pro',
        '👤 Dedicated Human Trainer',
        '1-on-1 video consultations',
        'Personalized meal planning',
        'Weekly check-ins',
        'Advanced AI pose analysis',
        '20% discount on shop products',
        'Exclusive community access',
        'Premium rewards multiplier (2x FEFE points)'
      ]
    }
  }
]

export default function PricingSubscription() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const getPrice = (tier: PricingTier) => {
    if (tier.price === 0) return 'Free'
    if (billingPeriod === 'yearly') {
      const yearlyPrice = tier.price * 10 // 2 months free on yearly
      return `$${yearlyPrice}/year`
    }
    return `$${tier.price}/mo`
  }

  const handleSelectPlan = (tierId: string) => {
    setSelectedPlan(tierId)
    // Store selected plan in localStorage
    localStorage.setItem('selectedSubscription', tierId)
    alert(`${tierId === 'free' ? 'Free trial activated!' : 'Plan selected! Redirecting to checkout...'}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-xl px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Choose Your Fitness Journey
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Unlock Your
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Fitness Potential
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start free, upgrade when you're ready. All plans include FEFE rewards points.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={billingPeriod === 'monthly' ? 'text-white font-semibold' : 'text-white/70'}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-16 h-8 bg-white/20 rounded-full transition-all"
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${billingPeriod === 'yearly' ? 'left-9' : 'left-1'}`} />
              </button>
              <span className={billingPeriod === 'yearly' ? 'text-white font-semibold' : 'text-white/70'}>
                Yearly
                <Badge className="ml-2 bg-green-500">Save 17%</Badge>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <ScrollFadeImage key={tier.id} delay={index * 0.1}>
                <Card className={`relative overflow-hidden h-full flex flex-col ${tier.popular ? 'ring-2 ring-indigo-500 shadow-2xl scale-105' : ''}`}>
                  {tier.badge && (
                    <div className="absolute top-0 right-0">
                      <Badge className={`rounded-tl-none rounded-br-none bg-gradient-to-r ${tier.gradient}`}>
                        {tier.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${tier.gradient} mb-4 mx-auto`}>
                      <tier.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                    <CardDescription className="mb-4">{tier.description}</CardDescription>
                    
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{getPrice(tier)}</span>
                      {tier.price > 0 && (
                        <span className="text-muted-foreground ml-2">
                          {billingPeriod === 'monthly' ? '/month' : '/year'}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      {tier.features.included.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {tier.features.notIncluded?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span className="text-sm line-through">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${tier.popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''}`}
                      variant={tier.popular ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => handleSelectPlan(tier.id)}
                    >
                      {tier.price === 0 ? 'Start Free Trial' : 'Get Started'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </ScrollFadeImage>
            ))}
          </div>
        </div>
      </section>

      {/* FEFE Rewards Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                <Trophy className="w-4 h-4 mr-2" />
                FEFE Rewards
              </Badge>
              <h2 className="text-4xl font-bold mb-4 gradient-text dark:gradient-text-dark">
                Earn Points, Get Rewards
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Stay consistent, earn FEFE points, and unlock exclusive benefits
              </p>
            </div>
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: 'Complete Workouts',
                points: '+10 points',
                description: 'Every workout completed on time',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: Award,
                title: 'Follow Diet Plan',
                points: '+5 points',
                description: 'Stick to your daily meal plan',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: ShoppingBag,
                title: 'Shop & Earn',
                points: '+1 point/$',
                description: 'Earn on every purchase',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Gift,
                title: 'Redeem Rewards',
                points: 'Use anytime',
                description: 'Discounts on subscriptions & products',
                gradient: 'from-orange-500 to-red-500'
              },
            ].map((reward, index) => (
              <ScrollFadeImage key={index} delay={index * 0.1}>
                <Card className="text-center hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${reward.gradient} mb-4`}>
                      <reward.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{reward.title}</h3>
                    <Badge className="mb-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      {reward.points}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeImage>
            ))}
          </div>

          {/* Points Redemption Table */}
          <ScrollAnimatedSection>
            <Card className="mt-12">
              <CardHeader>
                <CardTitle>Redemption Options</CardTitle>
                <CardDescription>Use your FEFE points for exclusive benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <p className="font-semibold">100 Points</p>
                      <p className="text-sm text-muted-foreground">$5 off subscription renewal</p>
                    </div>
                    <Badge variant="outline">Renew</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <p className="font-semibold">50 Points</p>
                      <p className="text-sm text-muted-foreground">$2.50 off shop purchases</p>
                    </div>
                    <Badge variant="outline">Shop</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <p className="font-semibold">200 Points</p>
                      <p className="text-sm text-muted-foreground">1 month free trainer consultation</p>
                    </div>
                    <Badge variant="outline">Elite</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <p className="font-semibold">500 Points</p>
                      <p className="text-sm text-muted-foreground">Free product worth $50</p>
                    </div>
                    <Badge variant="outline">Premium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollAnimatedSection>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Feature Comparison</h2>
              <p className="text-muted-foreground">Choose the plan that fits your needs</p>
            </div>
          </ScrollAnimatedSection>

          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Feature</th>
                      <th className="text-center p-4">Free</th>
                      <th className="text-center p-4 bg-indigo-50 dark:bg-indigo-950">Pro</th>
                      <th className="text-center p-4">Elite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Basic Exercises', free: true, pro: true, elite: true },
                      { name: 'AI Pose Camera', free: false, pro: true, elite: true },
                      { name: 'Human Trainer', free: false, pro: false, elite: true },
                      { name: 'Progress Tracking', free: 'Basic', pro: 'Advanced', elite: 'Advanced' },
                      { name: 'Product Discounts', free: '0%', pro: '10%', elite: '20%' },
                      { name: 'FEFE Points Multiplier', free: '1x', pro: '1x', elite: '2x' },
                      { name: 'Support Level', free: 'Standard', pro: 'Priority', elite: '24/7 VIP' },
                    ].map((feature, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="text-center p-4">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          ) : (
                            feature.free
                          )}
                        </td>
                        <td className="text-center p-4 bg-indigo-50 dark:bg-indigo-950">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          ) : (
                            feature.pro
                          )}
                        </td>
                        <td className="text-center p-4">
                          {typeof feature.elite === 'boolean' ? (
                            feature.elite ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          ) : (
                            feature.elite
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimatedSection>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-slate-100 font-semibold text-lg px-8 rounded-full"
                onClick={() => handleSelectPlan('free')}
              >
                Start Free Trial
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
              <Link href="/">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-xl text-lg px-8 rounded-full"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>
    </div>
  )
}

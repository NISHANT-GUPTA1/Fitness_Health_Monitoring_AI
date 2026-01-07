"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  X, 
  Crown, 
  Zap,
  Users,
  Camera,
  Dumbbell,
  Award,
  ShoppingCart,
  TrendingUp,
  Star,
  Sparkles
} from "lucide-react"
import { ScrollAnimatedSection, ScrollFadeImage } from "./ScrollAnimatedSection"

const pricingTiers = [
  {
    name: "Free Trial",
    price: 0,
    period: "Forever",
    icon: Dumbbell,
    color: "from-gray-500 to-gray-600",
    popular: false,
    features: [
      { text: "Basic gym exercises library", included: true },
      { text: "Pre-recorded workout videos", included: true },
      { text: "Basic progress tracking", included: true },
      { text: "Community support", included: true },
      { text: "AI workout generator (3/month)", included: true },
      { text: "AI Pose Camera", included: false },
      { text: "Personalized training", included: false },
      { text: "Human trainer support", included: false },
      { text: "Product discounts", included: false },
    ]
  },
  {
    name: "Pro",
    price: 19.99,
    period: "per month",
    icon: Camera,
    color: "from-indigo-500 to-purple-500",
    popular: true,
    features: [
      { text: "Everything in Free", included: true },
      { text: "AI Pose Camera - All exercises", included: true },
      { text: "Real-time form correction", included: true },
      { text: "Advanced progress analytics", included: true },
      { text: "Unlimited AI workout plans", included: true },
      { text: "Custom diet plans", included: true },
      { text: "10% off all products", included: true },
      { text: "100 FEFE Points/month", included: true },
      { text: "Human trainer support", included: false },
    ]
  },
  {
    name: "Elite",
    price: 49.99,
    period: "per month",
    icon: Crown,
    color: "from-yellow-500 to-orange-500",
    popular: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Personal Human Trainer", included: true },
      { text: "1-on-1 Video Sessions (4/month)", included: true },
      { text: "Custom meal prep plans", included: true },
      { text: "24/7 Trainer WhatsApp support", included: true },
      { text: "20% off all products", included: true },
      { text: "Priority customer support", included: true },
      { text: "300 FEFE Points/month", included: true },
      { text: "Exclusive challenges & prizes", included: true },
    ]
  },
]

export default function PricingTiers() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const handleSubscribe = (tierName: string, price: number) => {
    setSelectedTier(tierName)
    if (price === 0) {
      alert("🎉 Free Trial activated! Start exploring basic exercises.")
    } else {
      alert(`🚀 Redirecting to payment for ${tierName} plan...`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollAnimatedSection>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-0">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Choose Your Plan
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text dark:gradient-text-dark">
              Unlock Your Full
              <br />
              Fitness Potential
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. Cancel anytime.
            </p>
          </div>
        </ScrollAnimatedSection>

        {/* Billing Toggle */}
        <ScrollAnimatedSection>
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={billingPeriod === "monthly" ? "font-semibold" : "text-muted-foreground"}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-7 bg-indigo-600 rounded-full transition-colors"
              aria-label={`Switch to ${billingPeriod === "monthly" ? "yearly" : "monthly"} billing`}
            >
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingPeriod === "yearly" ? "translate-x-7" : ""
              }`} />
            </button>
            <span className={billingPeriod === "yearly" ? "font-semibold" : "text-muted-foreground"}>
              Yearly
            </span>
            {billingPeriod === "yearly" && (
              <Badge className="bg-green-500">Save 20%</Badge>
            )}
          </div>
        </ScrollAnimatedSection>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => {
            const yearlyPrice = tier.price * 12 * 0.8
            const displayPrice = billingPeriod === "yearly" && tier.price > 0 
              ? (yearlyPrice / 12).toFixed(2)
              : tier.price

            return (
              <ScrollFadeImage key={tier.name} delay={index * 0.1}>
                <Card className={`relative overflow-hidden ${
                  tier.popular ? "border-indigo-500 border-2 shadow-2xl scale-105" : ""
                }`}>
                  {tier.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                      ⭐ Most Popular
                    </div>
                  )}
                  
                  <CardHeader className={tier.popular ? "pt-12" : ""}>
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${tier.color} mb-4 w-fit`}>
                      <tier.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-4xl font-bold text-foreground">
                          ${displayPrice}
                        </span>
                        <span className="text-muted-foreground">/{tier.period}</span>
                      </div>
                      {billingPeriod === "yearly" && tier.price > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          Save ${(tier.price * 12 * 0.2).toFixed(2)}/year
                        </p>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <Button 
                      className={`w-full ${tier.popular ? "bg-gradient-to-r from-indigo-600 to-purple-600" : ""}`}
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(tier.name, tier.price)}
                    >
                      {tier.price === 0 ? "Start Free" : "Subscribe Now"}
                    </Button>

                    <div className="space-y-3 pt-4">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground"}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollFadeImage>
            )
          })}
        </div>

        {/* Features Comparison */}
        <ScrollAnimatedSection>
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">AI Pose Camera</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time form correction with AI-powered pose detection for all exercises
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">Human Trainers</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional certified trainers for personalized guidance and support
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">FEFE Rewards</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn points for workouts and use them for discounts on subscriptions and products
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollAnimatedSection>

        {/* FAQ */}
        <ScrollAnimatedSection>
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes! You can cancel your subscription anytime. You'll have access until the end of your billing period."
                },
                {
                  q: "What are FEFE Points?",
                  a: "FEFE Points are rewards you earn by completing workouts and following your diet plan. Use them for discounts!"
                },
                {
                  q: "How does the AI Pose Camera work?",
                  a: "Our AI analyzes your form in real-time using your device camera and provides instant feedback on your technique."
                },
                {
                  q: "Can I upgrade/downgrade my plan?",
                  a: "Absolutely! You can change your plan anytime. Changes take effect immediately with prorated billing."
                }
              ].map((faq, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* CTA */}
        <ScrollAnimatedSection>
          <div className="mt-16 text-center p-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands achieving their fitness goals with FEFE
            </p>
            <Button 
              size="lg"
              className="bg-white text-indigo-600 hover:bg-slate-100 font-semibold text-lg px-8 py-6 rounded-full"
              onClick={() => handleSubscribe("Free Trial", 0)}
            >
              Start Free Trial
              <Zap className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </ScrollAnimatedSection>
      </div>
    </div>
  )
}

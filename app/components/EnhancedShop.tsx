"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ShoppingCart, 
  Star, 
  Truck, 
  Shield, 
  Zap,
  Heart,
  ChevronRight,
  Package,
  Award,
  TrendingUp,
  Dumbbell,
  Apple,
  Watch,
  Shirt
} from "lucide-react"
import { ScrollAnimatedSection, ScrollFadeImage } from "./ScrollAnimatedSection"

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  description: string
  rating: number
  category: 'equipment' | 'supplements' | 'apparel' | 'accessories'
  tag?: 'sale' | 'new' | 'bestseller'
  brand: string
  affiliate?: boolean
}

const products: Product[] = [
  // Equipment
  {
    id: 1,
    name: "Pro Adjustable Dumbbells",
    price: 399,
    originalPrice: 499,
    image: "/shopimages/dumberl.png",
    description: "Space-saving design replaces 15 sets of weights",
    rating: 4.8,
    category: 'equipment',
    tag: 'sale',
    brand: 'PowerFit',
    affiliate: true
  },
  {
    id: 2,
    name: "Smart Treadmill X1",
    price: 899,
    originalPrice: 1099,
    image: "/shopimages/trademil.png",
    description: "Foldable electric treadmill with heart rate monitor",
    rating: 4.7,
    category: 'equipment',
    tag: 'bestseller',
    brand: 'TechFit',
    affiliate: true
  },
  {
    id: 3,
    name: "Home Gym Station",
    price: 1299,
    image: "/shopimages/multi.png",
    description: "Complete workout station with cable pulleys",
    rating: 4.9,
    category: 'equipment',
    brand: 'IronMaster',
    affiliate: true
  },
  
  // Supplements
  {
    id: 4,
    name: "Whey Protein Isolate",
    price: 49.99,
    originalPrice: 59.99,
    image: "/shopimages/whey.png",
    description: "25g protein per serving, chocolate flavor",
    rating: 4.9,
    category: 'supplements',
    tag: 'bestseller',
    brand: 'NutraPro',
    affiliate: true
  },
  {
    id: 5,
    name: "Pre-Workout Formula",
    price: 39.99,
    image: "/shopimages/pre.png",
    description: "Energy boost with beta-alanine and caffeine",
    rating: 4.7,
    category: 'supplements',
    tag: 'new',
    brand: 'EnergyMax',
    affiliate: true
  },
  {
    id: 6,
    name: "BCAA Recovery",
    price: 34.99,
    image: "/shopimages/bcaa.png",
    description: "Essential amino acids for muscle recovery",
    rating: 4.8,
    category: 'supplements',
    brand: 'RecoverPro',
    affiliate: true
  },
  
  // Apparel
  {
    id: 7,
    name: "Performance T-Shirt",
    price: 29.99,
    originalPrice: 39.99,
    image: "/shopimages/tshirt.png",
    description: "Moisture-wicking athletic shirt",
    rating: 4.6,
    category: 'apparel',
    tag: 'sale',
    brand: 'AthleteWear',
    affiliate: true
  },
  {
    id: 8,
    name: "Training Shorts",
    price: 34.99,
    image: "/shopimages/shorts.png",
    description: "Breathable fabric with secure pockets",
    rating: 4.7,
    category: 'apparel',
    brand: 'FlexFit',
    affiliate: true
  },
  
  // Accessories
  {
    id: 9,
    name: "Fitness Tracker Watch",
    price: 129.99,
    originalPrice: 179.99,
    image: "/shopimages/watch.png",
    description: "Heart rate, sleep tracking, and GPS",
    rating: 4.8,
    category: 'accessories',
    tag: 'new',
    brand: 'TechHealth',
    affiliate: true
  },
  {
    id: 10,
    name: "Yoga Mat Pro",
    price: 49.99,
    image: "/shopimages/yoga.png",
    description: "Non-slip, eco-friendly material",
    rating: 4.9,
    category: 'accessories',
    brand: 'ZenFlow',
    affiliate: true
  },
]

const categories = [
  { id: 'all', name: 'All Products', icon: Package },
  { id: 'equipment', name: 'Equipment', icon: Dumbbell },
  { id: 'supplements', name: 'Supplements', icon: Apple },
  { id: 'apparel', name: 'Apparel', icon: Shirt },
  { id: 'accessories', name: 'Accessories', icon: Watch },
]

const featuredBrands = [
  { name: 'PowerFit', logo: '💪', description: 'Premium gym equipment' },
  { name: 'NutraPro', logo: '🥤', description: 'Quality supplements' },
  { name: 'AthleteWear', logo: '👕', description: 'Performance apparel' },
  { name: 'TechHealth', logo: '⌚', description: 'Smart fitness gear' },
]

export default function EnhancedShop() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState<number[]>([])
  const [showPricing, setShowPricing] = useState(false)

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const addToCart = (productId: number) => {
    setCart(prev => [...prev, productId])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, id) => {
      const product = products.find(p => p.id === id)
      return total + (product?.price || 0)
    }, 0)
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
              <Award className="w-4 h-4 mr-2 inline" />
              Partner Brands & Exclusive Deals
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Premium Fitness
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Gear & Supplements
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Curated selection from top brands. Earn rewards on every purchase supporting your fitness journey.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partner Brands */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 gradient-text dark:gradient-text-dark">
                Our Partner Brands
              </h2>
              <p className="text-muted-foreground">
                Collaborating with the best in fitness industry
              </p>
            </div>
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-4 gap-6">
            {featuredBrands.map((brand, index) => (
              <ScrollFadeImage key={index} delay={index * 0.1}>
                <Card className="text-center hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                      {brand.logo}
                    </div>
                    <h3 className="font-bold mb-2">{brand.name}</h3>
                    <p className="text-sm text-muted-foreground">{brand.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeImage>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 sticky top-20 z-40 glass dark:glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </Button>
              ))}
            </div>
            
            {cart.length > 0 && (
              <Button className="relative">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart
                <Badge className="ml-2 bg-white text-indigo-600">
                  {cart.length}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-muted-foreground">
                {filteredProducts.length} products available
              </p>
            </div>
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ScrollFadeImage key={product.id} delay={index * 0.05}>
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src = `https://via.placeholder.com/300x200/6366f1/ffffff?text=${product.category}`
                      }}
                    />
                    
                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.tag === 'sale' && (
                        <Badge className="bg-red-500">Sale</Badge>
                      )}
                      {product.tag === 'new' && (
                        <Badge className="bg-green-500">New</Badge>
                      )}
                      {product.tag === 'bestseller' && (
                        <Badge className="bg-yellow-500">Bestseller</Badge>
                      )}
                      {product.affiliate && (
                        <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/90">
                          Partner
                        </Badge>
                      )}
                    </div>

                    {/* Wishlist */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Product Info */}
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                      <h3 className="font-semibold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">(250+ reviews)</span>
                      </div>
                    </div>

                    {/* Price & Button */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through mr-2">
                            ${product.originalPrice}
                          </span>
                        )}
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                          ${product.price}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => addToCart(product.id)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </ScrollFadeImage>
            ))}
          </div>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 gradient-text dark:gradient-text-dark">
                Why Shop With Us?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get the best deals from trusted brands while supporting your fitness journey
              </p>
            </div>
          </ScrollAnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Exclusive Deals',
                description: 'Special discounts from our partner brands for community members',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: Shield,
                title: 'Quality Guaranteed',
                description: 'Only premium products from verified and trusted brands',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Zap,
                title: 'Rewards Program',
                description: 'Earn points on purchases to unlock premium features',
                gradient: 'from-purple-500 to-pink-500'
              },
            ].map((feature, index) => (
              <ScrollFadeImage key={index} delay={index * 0.1}>
                <Card className="text-center hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollFadeImage>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Summary Floating */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Card className="shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cart Total</p>
                  <p className="text-2xl font-bold">${getTotalPrice().toFixed(2)}</p>
                </div>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  Checkout
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

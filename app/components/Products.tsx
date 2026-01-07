"use client"

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Trash2, Plus, Minus, Heart, Info, Star, ChevronLeft, ChevronRight, Truck, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number; // For discounted items
  image: string;
  description: string;
  rating?: number;
  category: 'equipment' | 'supplements' | 'apparel' | 'accessories';
  tag?: 'sale' | 'new' | 'bestseller';
  freeDelivery?: boolean;
}

// Sample product data organized by category
const products: Product[] = [
  // Gym Equipment
  {
    id: 1,
    name: "Compact Treadmill X1",
    price: 699,
    originalPrice: 899,
    image: "shopimages/trademil.png",
    description: "Foldable electric treadmill with digital display and heart rate monitor",
    rating: 4.8,
    category: 'equipment',
    tag: 'sale',
    freeDelivery: true
  },
  {
    id: 2,
    name: "Pro Elliptical Trainer",
    price: 1199,
    image: "shopimages/proeliptical.png",
    description: "Low-impact cardio machine with 15 resistance levels and stride adjustments",
    rating: 4.7,
    category: 'equipment',
    freeDelivery: true
  },
  {
    id: 3,
    name: "Smart Exercise Bike",
    price: 899,
    originalPrice: 1099,
    image: "shopimages/smartbike.png",
    description: "Interactive stationary bike with live and on-demand classes integration",
    rating: 4.9,
    category: 'equipment',
    tag: 'sale',
    freeDelivery: true
  },
  {
    id: 4,
    name: "Adjustable Dumbbell Set",
    price: 399,
    image: "shopimages/dumberl.png",
    description: "Space-saving design replaces 15 sets of weights with quick adjustment dial",
    rating: 4.8,
    category: 'equipment',
    freeDelivery: true
  },
  {
    id: 5,
    name: "Multifunctional Home Gym",
    price: 1299,
    image: "shopimages/multi.png",
    description: "Complete workout station with bench, cable pulleys, and leg developer",
    rating: 4.6,
    category: 'equipment',
    tag: 'bestseller',
    freeDelivery: true
  },
  
  // Supplements
  {
    id: 6,
    name: "Whey Protein Isolate",
    price: 39.99,
    image: "shopimages/whey.png",
    description: "25g of protein per serving for optimal muscle recovery and growth",
    rating: 4.9,
    category: 'supplements',
    tag: 'bestseller',
    freeDelivery: true
  },
  {
    id: 7,
    name: "Pre-Workout Energy Formula",
    price: 29.99,
    image: "shopimages/womenl.png",
    description: "Enhanced focus and energy with beta-alanine and caffeine",
    rating: 4.7,
    category: 'supplements',
    freeDelivery: true
  },
  {
    id: 8,
    name: "BCAA Recovery Drink",
    price: 24.99,
    image: "shopimages/bcaa.png",
    description: "2:1:1 ratio of essential amino acids for muscle preservation",
    rating: 4.6,
    category: 'supplements',
    freeDelivery: true
  },
  {
    id: 9,
    name: "Creatine Monohydrate",
    price: 19.99,
    image: "shopimages/creatine.png",
    description: "Increases ATP production for improved strength and performance",
    rating: 4.8,
    category: 'supplements'
  },
  {
    id: 10,
    name: "Multivitamin For Athletes",
    price: 22.99,
    originalPrice: 29.99,
    image: "shopimages/multivitamin.png",
    description: "Complete formula with extra minerals for active lifestyles",
    rating: 4.5,
    category: 'supplements',
    tag: 'sale'
  },
  
  // Apparel
  {
    id: 11,
    name: "Men's Performance T-Shirt",
    price: 34.99,
    image: "shopimages/mentshirt.png",
    description: "Moisture-wicking fabric with anti-odor technology",
    rating: 4.7,
    category: 'apparel',
    tag: 'new'
  },
  {
    id: 12,
    name: "Women's Training Leggings",
    price: 49.99,
    image: "shopimages/womenl.png",
    description: "High-waisted design with 4-way stretch and hidden pocket",
    rating: 4.9,
    category: 'apparel',
    tag: 'bestseller',
    freeDelivery: true
  },
  {
    id: 13,
    name: "Compression Shorts",
    price: 29.99,
    image: "shopimages/shorts.png",
    description: "Supportive fit for improved blood circulation during workouts",
    rating: 4.6,
    category: 'apparel'
  },
  
  // Accessories
  {
    id: 14,
    name: "Smart Fitness Tracker",
    price: 79.99,
    originalPrice: 99.99,
    image: "shopimages/tracker.png",
    description: "Monitors heart rate, sleep quality, and workout metrics",
    rating: 4.8,
    category: 'accessories',
    tag: 'sale',
    freeDelivery: true
  },
  {
    id: 15,
    name: "Premium Yoga Mat",
    price: 49.99,
    image: "shopimages/yogamat.png",
    description: "Non-slip, eco-friendly material with alignment markers",
    rating: 4.7,
    category: 'accessories',
    freeDelivery: true
  },
  {
    id: 16,
    name: "Foam Roller Set",
    price: 34.99,
    image: "shopimages/roller.png",
    description: "Textured surface targets deep tissues for myofascial release",
    rating: 4.6,
    category: 'accessories'
  }
];

interface CartItem extends Product {
  quantity: number;
}

export default function Products() {
  const { t } = useTranslation()
  const [cart, setCart] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [showCartModal, setShowCartModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Disability selection states
  const [hasDisability, setHasDisability] = useState(false)
  const [disabilityType, setDisabilityType] = useState<string>("")
  const [showingAdaptiveProducts, setShowingAdaptiveProducts] = useState(false)

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }
    
    setCart((prevCart) => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    )
  }, [removeFromCart])

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    )
  }, [])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
  }

  // State for hero carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      title: "Deals don't get better than this",
      image: "shopimages/banner3.png",
      btnText: "SHOP NOW",
      btnLink: "#deals"
    },
    {
      title: "Premium Fitness Equipment",
      image: "shopimages/banner2.png",
      btnText: "EXPLORE",
      btnLink: "#equipment"
    },
    {
      title: "Performance Nutrition",
      image: "shopimages/banner1.png",
      btnText: "VIEW ALL",
      btnLink: "#supplements"
    }
  ];

  // Filter products by category
  const equipmentProducts = products.filter(p => p.category === 'equipment');
  const supplementProducts = products.filter(p => p.category === 'supplements');
  const apparelProducts = products.filter(p => p.category === 'apparel');
  const accessoryProducts = products.filter(p => p.category === 'accessories');

  // Carousel functionality
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Auto slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedProduct) setSelectedProduct(null);
        if (showCartModal) setShowCartModal(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedProduct, showCartModal]);
  
  // Reset adaptive products view when disability options change
  useEffect(() => {
    setShowingAdaptiveProducts(false);
  }, [hasDisability, disabilityType]);

  const renderProductCard = (product: Product) => (
    <div 
      key={product.id} 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100 cursor-pointer flex flex-col h-full"
      onClick={() => setSelectedProduct(product)}
    >
      {/* Fixed height and width image container */}
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 relative overflow-hidden flex items-center justify-center">
        <div className="w-full h-full relative flex items-center justify-center">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-contain object-center p-2"
            loading="lazy"
          />
        </div>
        {product.tag && (
          <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded
            ${product.tag === 'sale' ? 'bg-red-500' : 
              product.tag === 'new' ? 'bg-green-500' : 
              'bg-blue-500'}`
          }>
            {product.tag.toUpperCase()}
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-800"
          aria-label={`Add ${product.name} to favorites`}
        >
          <Heart className={`h-5 w-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-medium text-lg mb-1 line-clamp-2 h-14">{product.name}</h3>
        
        <div className="flex justify-between items-center mt-2 mb-3">
          <div className="flex items-end gap-2">
            <span className="font-bold text-lg">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm line-through text-gray-500">₹{product.originalPrice}</span>
            )}
          </div>
          {product.rating && renderStars(product.rating)}
        </div>
        
        {product.freeDelivery && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mb-3">
            <Truck className="h-3.5 w-3.5" />
            <span>FREE DELIVERY</span>
          </div>
        )}
        
        <div className="mt-auto pt-3">
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t("add_to_cart", "Add to Cart")}
          </Button>
        </div>
      </div>
    </div>
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const totalPrice = subtotal + shipping

  const disabilityOptions = [
    { id: "upper_body", label: "Upper Body Disability" },
    { id: "lower_body", label: "Lower Body Disability" },
    { id: "mobility", label: "General Mobility Impairment" },
    { id: "visual", label: "Visual Impairment" },
    { id: "hearing", label: "Hearing Impairment" },
    { id: "cognitive", label: "Cognitive Disability" },
    { id: "other", label: "Other" }
  ]

  return (
    <div className="space-y-8">
      {/* Cart Summary Banner */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Shopping Cart Summary */}
          <div className="flex items-center space-x-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg w-full lg:w-auto">
            <button 
              onClick={() => setShowCartModal(true)}
              className="relative flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-medium"
              aria-label="Open shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{t("cart", "Cart")}</span>
              {totalItems > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {totalItems}
                </Badge>
              )}
            </button>
            
            {totalItems > 0 && (
              <>
                <div className="h-6 w-px bg-purple-200 dark:bg-purple-700"></div>
                <div className="text-sm">
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                </div>
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 h-8"
                  onClick={() => {
                    // Checkout logic would go here
                    alert('Proceeding to checkout...');
                  }}
                >
                  {t("checkout", "Checkout")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Accessibility Options Banner */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("accessibility_options", "Accessibility Options")}</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="disability-toggle"
                title="Disability Toggle"
                checked={hasDisability}
                onChange={(e) => {
                  setHasDisability(e.target.checked)
                  if (!e.target.checked) setDisabilityType("")
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="disability-toggle" className="font-medium">
                {t("has_disability", "I have a disability")}
              </Label>
            </div>
            
            {hasDisability && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="disability-type" className="block">
                    {t("disability_type", "Type of Disability")}
                  </Label>
                  <Select 
                    value={disabilityType} 
                    onValueChange={setDisabilityType}
                  >
                    <SelectTrigger id="disability-type" className="w-full">
                      <SelectValue placeholder={t("select_disability_type", "Select type...")} />
                    </SelectTrigger>
                    <SelectContent>
                      {disabilityOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>{t(option.id, option.label)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Free Delivery Banner */}
      <div className="bg-black text-white py-2.5 text-center font-medium">
        FREE DELIVERY ON ALL ORDERS
      </div>

      {/* Hero Carousel */}
      <div className="relative overflow-hidden h-[400px] rounded-lg shadow-xl">
        {heroSlides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 bg-cover bg-center bg-black/30 ${
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center -z-10">
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-center">{slide.title}</h2>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                {slide.btnText}
              </Button>
            </div>
          </div>
        ))}
        
        {/* Carousel Controls */}
        <button 
          onClick={prevSlide} 
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button variant="outline" className="flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          {/* Bestseller products */}
          {products
            .filter(p => p.tag === 'bestseller')
            .map(renderProductCard)}
          
          {/* If we don't have enough bestsellers, add some sale items */}
          {products
            .filter(p => p.tag === 'sale')
            .slice(0, 4 - products.filter(p => p.tag === 'bestseller').length)
            .map(renderProductCard)}
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="equipment" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl">
            <TabsTrigger value="equipment">Gym Equipment</TabsTrigger>
            <TabsTrigger value="supplements">Supplements</TabsTrigger>
            <TabsTrigger value="apparel">Apparel</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Free Delivery Banner for Products */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full font-medium">
            <Truck className="h-4 w-4" />
            FREE DELIVERY ON ALL ORDERS
          </div>
        </div>

        {/* Equipment Tab */}
        <TabsContent value="equipment">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
            {equipmentProducts.map(renderProductCard)}
          </div>
        </TabsContent>

        {/* Supplements Tab */}
        <TabsContent value="supplements">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
            {supplementProducts.map(renderProductCard)}
          </div>
        </TabsContent>

        {/* Apparel Tab */}
        <TabsContent value="apparel">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
            {apparelProducts.map(renderProductCard)}
          </div>
        </TabsContent>

        {/* Accessories Tab */}
        <TabsContent value="accessories">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
            {accessoryProducts.map(renderProductCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Accessibility Products Banner - appears if disability is selected */}
      {hasDisability && disabilityType && (
        <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-inner text-center">
          <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-300 mb-3">
            {t("accessible_products", "Accessible Products for")} {t(disabilityType, disabilityOptions.find(opt => opt.id === disabilityType)?.label || "")}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-4">
            {t("accessibility_products_description", "Browse our selection of products designed to enhance accessibility and independence for individuals with specific needs.")}
          </p>
          
          <Button 
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            disabled={!hasDisability || !disabilityType}
            onClick={() => {
              setShowingAdaptiveProducts(true);
              // In a real application, you would fetch adaptive products here
              // For now we'll just show a message
              alert(`Showing adaptive products for ${disabilityOptions.find(opt => opt.id === disabilityType)?.label || "accessibility needs"}`);
            }}
          >
            {t("show_adaptive_products", "Show Adaptive Products")}
          </Button>
        </div>
      )}
      
      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>{t("cart", "Cart")}</span>
                <Badge variant="secondary">{totalItems}</Badge>
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setShowCartModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-500">
                <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-6">{t("cart_empty", "Your cart is empty")}</p>
                <Button 
                  onClick={() => setShowCartModal(false)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {t("continue_shopping", "Continue Shopping")}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-white dark:bg-gray-600 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="max-w-full max-h-full object-contain p-1"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-1">{item.name}</h4>
                          <div className="text-sm text-gray-500 dark:text-gray-400">₹{item.price} × {item.quantity}</div>
                          <div className="flex items-center gap-1 mt-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 mt-2"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t("subtotal", "Subtotal")}:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t("shipping", "Shipping")}:</span>
                      <span>{shipping === 0 ? t("free", "Free") : `₹${shipping}`}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                      <span>{t("total", "Total")}:</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCartModal(false)}
                    >
                      {t("continue_shopping", "Continue Shopping")}
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        // Checkout logic would go here
                        alert('Proceeding to checkout...');
                        setShowCartModal(false);
                      }}
                    >
                      {t("checkout", "Checkout")}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                    <Truck className="h-4 w-4" />
                    <span>{t("free_shipping_note", "Free shipping on orders over ₹500")}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95">
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 h-8 w-8 bg-white/80 dark:bg-gray-700/80 z-10 rounded-full"
              onClick={() => setSelectedProduct(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* Product Image */}
            <div className="w-full md:w-1/2 h-[300px] md:h-auto relative bg-white flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center p-6">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              {selectedProduct.tag && (
                <div className={`absolute top-4 left-4 px-2 py-1 text-xs font-bold text-white rounded
                  ${selectedProduct.tag === 'sale' ? 'bg-red-500' : 
                    selectedProduct.tag === 'new' ? 'bg-green-500' : 
                    'bg-blue-500'}`
                }>
                  {selectedProduct.tag.toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">₹{selectedProduct.price}</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-base line-through text-gray-500">₹{selectedProduct.originalPrice}</span>
                    )}
                  </div>
                  
                  {selectedProduct.originalPrice && (
                    <Badge className="bg-red-500">
                      {Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>
                
                {selectedProduct.rating && (
                  <div className="flex items-center gap-2">
                    {renderStars(selectedProduct.rating)}
                    <span className="text-sm text-gray-500">({Math.floor(selectedProduct.rating * 10)} reviews)</span>
                  </div>
                )}
                
                <div className="border-t border-b py-4">
                  <p className="text-gray-700 dark:text-gray-300">{selectedProduct.description}</p>
                </div>
                
                {selectedProduct.freeDelivery && (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <Truck className="h-5 w-5" />
                    <span>FREE DELIVERY</span>
                  </div>
                )}
                
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className="h-11 w-11"
                    >
                      <Heart className={`h-5 w-5 ${favorites.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </Button>
                    
                    <Button 
                      className="flex-1 bg-purple-600 hover:bg-purple-700 py-6"
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                        setShowCartModal(true);
                      }}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {t("add_to_cart", "Add to Cart")}
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Buy now logic
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      // Redirect to checkout
                      alert('Proceeding to checkout...');
                    }}
                  >
                    {t("buy_now", "Buy Now")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

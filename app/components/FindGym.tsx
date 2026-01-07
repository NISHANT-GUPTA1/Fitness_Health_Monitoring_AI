"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Phone, Clock, Dumbbell, Ticket, Building, Filter } from "lucide-react"

// Define types for gym data
interface GymReview {
  username: string
  rating: number
  comment: string
  date: string
}

interface GymSubscription {
  name: string
  price: number
  period: string
  features: string[]
}

interface Gym {
  id: string
  name: string
  address: string
  distance: number
  rating: number
  reviewCount: number
  phone: string
  hours: string
  equipment: string[]
  amenities: string[]
  image: string
  subscriptions: GymSubscription[]
  reviews: GymReview[]
  coordinates: { lat: number; lng: number }
  tags: string[]
}

export default function FindGym() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [distance, setDistance] = useState<string>("10")
  const [rating, setRating] = useState<string>("any")
  const [amenities, setAmenities] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  
  // Mock gym data - in a real app, this would come from an API
  const gyms: Gym[] = [
    {
      id: "1",
      name: "FitZone Plus",
      address: "123 Main St, Downtown",
      distance: 0.8,
      rating: 4.7,
      reviewCount: 234,
      phone: "(555) 123-4567",
      hours: "6am-11pm",
      equipment: ["Free weights", "Cardio machines", "Resistance machines", "Functional training"],
      amenities: ["Parking", "Showers", "Lockers", "Personal trainers"],
      image: "gymimages/image.png",
      tags: ["24/7", "Group Classes", "Pool"],
      coordinates: { lat: 37.7833, lng: -122.4167 },
      subscriptions: [
        {
          name: "Basic",
          price: 29.99,
          period: "monthly",
          features: ["Gym access", "Basic equipment"]
        },
        {
          name: "Premium",
          price: 49.99,
          period: "monthly",
          features: ["Gym access", "All equipment", "Classes included", "Guest passes"]
        }
      ],
      reviews: [
        {
          username: "FitnessEnthusiast",
          rating: 5,
          comment: "Great facility with all the equipment I need!",
          date: "2023-05-10"
        },
        {
          username: "WorkoutQueen",
          rating: 4,
          comment: "Good gym, sometimes gets crowded after work hours",
          date: "2023-04-22"
        }
      ]
    },
    {
      id: "2",
      name: "PowerFlex Gym",
      address: "456 Oak Ave, Westside",
      distance: 1.2,
      rating: 4.5,
      reviewCount: 187,
      phone: "(555) 987-6543",
      hours: "5am-10pm",
      equipment: ["Olympic lifting", "Powerlifting equipment", "Strongman area", "Cardio machines"],
      amenities: ["Parking", "Showers", "Lockers", "Smoothie bar"],
      image: "shopimages/dumberl.png",
      tags: ["Strength focused", "Powerlifting", "No contract"],
      coordinates: { lat: 37.7735, lng: -122.4219 },
      subscriptions: [
        {
          name: "Monthly",
          price: 39.99,
          period: "monthly",
          features: ["Full access", "Free parking"]
        },
        {
          name: "Annual",
          price: 29.99,
          period: "monthly",
          features: ["Full access", "Free parking", "2 months free"]
        }
      ],
      reviews: [
        {
          username: "PowerLifter123",
          rating: 5,
          comment: "Best gym for serious lifters in the city!",
          date: "2023-06-15"
        },
        {
          username: "StrongGuy",
          rating: 4,
          comment: "Great equipment for strength training",
          date: "2023-05-30"
        }
      ]
    },
    {
      id: "3",
      name: "Urban Fitness Center",
      address: "789 Market St, Financial District",
      distance: 1.5,
      rating: 4.3,
      reviewCount: 156,
      phone: "(555) 456-7890",
      hours: "24 hours",
      equipment: ["Cardio zone", "Weight machines", "Free weights", "Functional area"],
      amenities: ["Towel service", "Sauna", "Steam room", "Child care"],
      image: "gymimages/image1.png",
      tags: ["24/7", "Modern", "Sauna"],
      coordinates: { lat: 37.7879, lng: -122.4074 },
      subscriptions: [
        {
          name: "Basic",
          price: 35.99,
          period: "monthly",
          features: ["Gym access", "Limited hours"]
        },
        {
          name: "Premium",
          price: 59.99,
          period: "monthly",
          features: ["24/7 access", "All amenities", "Guest privileges"]
        }
      ],
      reviews: [
        {
          username: "FitnessFanatic",
          rating: 4,
          comment: "Modern equipment and clean facilities",
          date: "2023-06-05"
        },
        {
          username: "GymLover",
          rating: 5,
          comment: "Love that it's open 24/7!",
          date: "2023-05-18"
        }
      ]
    },
    {
      id: "4",
      name: "Wellness Hub",
      address: "321 Pine St, Eastside",
      distance: 2.3,
      rating: 4.8,
      reviewCount: 207,
      phone: "(555) 789-0123",
      hours: "6am-10pm",
      equipment: ["Yoga studio", "Pilates equipment", "Light weights", "Cardio machines"],
      amenities: ["Wellness center", "Massage", "Nutritionist", "Spa"],
      image: "gymimages/image2.png",
      tags: ["Holistic", "Classes", "Beginner friendly"],
      coordinates: { lat: 37.7699, lng: -122.4271 },
      subscriptions: [
        {
          name: "Standard",
          price: 45.99,
          period: "monthly",
          features: ["Gym access", "2 classes/week"]
        },
        {
          name: "Ultimate",
          price: 79.99,
          period: "monthly",
          features: ["Unlimited access", "All classes", "1 massage/month", "Nutrition consult"]
        }
      ],
      reviews: [
        {
          username: "YogaQueen",
          rating: 5,
          comment: "Amazing yoga classes and peaceful environment",
          date: "2023-06-12"
        },
        {
          username: "WellnessJourney",
          rating: 5,
          comment: "The holistic approach to fitness is exactly what I needed",
          date: "2023-05-25"
        }
      ]
    },
    {
      id: "5",
      name: "Iron Athletics",
      address: "555 Industrial Way, Warehouse District",
      distance: 3.0,
      rating: 4.6,
      reviewCount: 175,
      phone: "(555) 234-5678",
      hours: "5am-11pm",
      equipment: ["Heavy weights", "Powerlifting platforms", "Boxing ring", "Turf area"],
      amenities: ["Parking", "Showers", "Pro shop", "Supplements"],
      image: "gymimages/image3.png",
      tags: ["Bodybuilding", "Crossfit", "Boxing"],
      coordinates: { lat: 37.7632, lng: -122.4121 },
      subscriptions: [
        {
          name: "Basic",
          price: 42.99,
          period: "monthly",
          features: ["Gym access", "Basic equipment"]
        },
        {
          name: "Elite",
          price: 69.99,
          period: "monthly",
          features: ["Full access", "All classes", "Protein shake daily", "Personal training session"]
        }
      ],
      reviews: [
        {
          username: "IronPumper",
          rating: 5,
          comment: "Serious gym for serious gains!",
          date: "2023-06-02"
        },
        {
          username: "LiftHeavy",
          rating: 4,
          comment: "Great atmosphere for pushing your limits",
          date: "2023-05-15"
        }
      ]
    }
  ];
  
  // Get user's location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      try {
        // Skip actual geolocation and use default locations for demo
        // This prevents the geolocation error in browsers that restrict it
        setUserLocation({ lat: 37.7749, lng: -122.4194 }); // Default location (San Francisco)
        setLoading(false);
        
        // We're not using actual geolocation to avoid permission errors
        // if (navigator.geolocation) {
        //   navigator.geolocation.getCurrentPosition(
        //     (position) => {
        //       const { latitude, longitude } = position.coords;
        //       setUserLocation({ lat: latitude, lng: longitude });
        //       setLoading(false);
        //     },
        //     (error) => {
        //       console.error("Error getting location:", error);
        //       setUserLocation({ lat: 37.7749, lng: -122.4194 }); // Default location (San Francisco)
        //       setLoading(false);
        //     },
        //     { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        //   );
        // } else {
        //   console.error("Geolocation is not supported by this browser.");
        //   setUserLocation({ lat: 37.7749, lng: -122.4194 }); // Default location
        //   setLoading(false);
        // }
      } catch (err) {
        console.log("Using default location");
        setUserLocation({ lat: 37.7749, lng: -122.4194 }); // Default location
        setLoading(false);
      }
    };

    // Simulate a delay for loading effect
    setTimeout(() => {
      getUserLocation();
    }, 1000);
  }, []);
  
  // Filter gyms based on search and filter criteria
  const filteredGyms = gyms.filter((gym) => {
    // Filter by search query
    if (
      searchQuery &&
      !gym.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !gym.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by distance
    if (distance !== "any" && gym.distance > parseInt(distance)) {
      return false;
    }
    
    // Filter by rating
    if (rating !== "any" && gym.rating < parseInt(rating)) {
      return false;
    }
    
    return true;
  });
  
  // Sort gyms by distance
  const sortedGyms = [...filteredGyms].sort((a, b) => a.distance - b.distance);
  
  // Render star rating component
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : star - 0.5 <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and filter section */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="col-span-4 md:col-span-2">
              <div className="relative">
                <Input
                  placeholder={t("search_gyms", "Search gyms by name or location...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <Select value={distance} onValueChange={setDistance}>
                <SelectTrigger>
                  <SelectValue placeholder={t("distance", "Distance")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t("any_distance", "Any distance")}</SelectItem>
                  <SelectItem value="1">{"< 1 " + t("mile", "mile")}</SelectItem>
                  <SelectItem value="3">{"< 3 " + t("miles", "miles")}</SelectItem>
                  <SelectItem value="5">{"< 5 " + t("miles", "miles")}</SelectItem>
                  <SelectItem value="10">{"< 10 " + t("miles", "miles")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder={t("rating", "Rating")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t("any_rating", "Any rating")}</SelectItem>
                  <SelectItem value="3">{"3+ " + t("stars", "stars")}</SelectItem>
                  <SelectItem value="4">{"4+ " + t("stars", "stars")}</SelectItem>
                  <SelectItem value="4.5">{"4.5+ " + t("stars", "stars")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gym list */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">
            {sortedGyms.length > 0
              ? `Found ${sortedGyms.length} gyms near you`
              : t("no_gyms_found", "No gyms match your filters")}
          </h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedGyms.map((gym) => (
                <Card 
                  key={gym.id} 
                  className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-md transition-shadow cursor-pointer ${
                    selectedGym?.id === gym.id ? "border-2 border-primary" : ""
                  }`}
                  onClick={() => setSelectedGym(gym)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Gym image */}
                      <div className="w-full md:w-40 h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                        {gym.image ? (
                          <img 
                            src={`/${gym.image}`} 
                            alt={gym.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Dumbbell className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Gym info */}
                      <div className="flex-grow space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg">{gym.name}</h3>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {gym.distance} {t("miles", "miles")}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {renderStars(gym.rating)}
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            {gym.rating} ({gym.reviewCount})
                          </span>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">{gym.address}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">{gym.hours}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {gym.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="text-sm font-medium">{t("subscriptions_from", "Memberships from")}</p>
                            <p className="text-lg font-bold text-green-600">${gym.subscriptions[0].price}/mo</p>
                          </div>
                          <Button size="sm" className="bg-primary text-primary-foreground">
                            {t("view_details", "View Details")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Gym details or map */}
        <div className="col-span-1">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm sticky top-4">
            <CardHeader>
              <CardTitle>{selectedGym ? selectedGym.name : t("map", "Map View")}</CardTitle>
              <CardDescription>
                {selectedGym 
                  ? t("selected_gym_info", "Selected gym information") 
                  : t("select_gym", "Select a gym to see details")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedGym ? (
                <div className="space-y-4">
                  {/* Simple Map View */}
                  <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                    {/* This is a very simple map visualization */}
                    <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/30">
                      {/* Grid lines to simulate map */}
                      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                        {Array(16).fill(0).map((_, i) => (
                          <div key={i} className="border-[0.5px] border-blue-200 dark:border-blue-800"></div>
                        ))}
                      </div>
                      
                      {/* Roads */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600"></div>
                      <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300 dark:bg-gray-600"></div>
                      <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-gray-300 dark:bg-gray-600"></div>
                      
                      {/* User location */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-8 h-8 bg-blue-500/30 rounded-full absolute -top-2 -left-2"></div>
                      </div>
                      
                      {/* Gym locations */}
                      <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                        <MapPin className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="absolute top-3/4 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
                        <MapPin className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="absolute top-1/3 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
                        <MapPin className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="absolute top-2/3 left-1/5 transform -translate-x-1/2 -translate-y-1/2">
                        <MapPin className="h-5 w-5 text-red-500" />
                      </div>
                      
                      {/* Current gym highlight */}
                      <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-8 h-8 bg-red-500/30 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-1 right-1 bg-white/80 dark:bg-gray-800/80 text-xs px-2 py-1 rounded">
                      {selectedGym.distance} miles
                    </div>
                  </div>
                  
                  {/* Contact info */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="text-sm">{selectedGym.phone}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <p className="text-sm">{selectedGym.address}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <p className="text-sm">{selectedGym.hours}</p>
                    </div>
                  </div>
                  
                  {/* Membership options */}
                  <div className="space-y-2">
                    <h4 className="font-medium">{t("subscriptions", "Membership Options")}</h4>
                    {selectedGym.subscriptions.map((sub, i) => (
                      <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{sub.name}</span>
                          <span className="font-bold text-green-600">${sub.price}/{t(sub.period)}</span>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {sub.features.map((feature, j) => (
                            <li key={j} className="text-sm flex items-center">
                              <CheckIcon className="h-3 w-3 mr-2 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden">
                  {/* Simple Map View */}
                  <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/30">
                    {/* Grid lines to simulate map */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                      {Array(36).fill(0).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-blue-200 dark:border-blue-800"></div>
                      ))}
                    </div>
                    
                    {/* Roads */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    
                    {/* User location */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-8 h-8 bg-blue-500/30 rounded-full absolute -top-2 -left-2"></div>
                    </div>
                    
                    {/* Gym locations */}
                    {!loading && (
                      <>
                        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                          <MapPin className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="absolute top-3/4 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
                          <MapPin className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="absolute top-1/3 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
                          <MapPin className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="absolute top-2/3 left-1/5 transform -translate-x-1/2 -translate-y-1/2">
                          <MapPin className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="absolute top-2/5 left-3/5 transform -translate-x-1/2 -translate-y-1/2">
                          <MapPin className="h-5 w-5 text-red-500" />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-gray-700 dark:text-gray-300 mt-3">
                            {t("getting_location", "Getting your location...")}
                          </p>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-8 w-8 text-gray-600 dark:text-gray-400 mx-auto" />
                          <p className="text-gray-700 dark:text-gray-300 mt-2">
                            {t("select_gym_view", "Select a gym to view details")}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {selectedGym && (
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  {t("call", "Call")}
                </Button>
                <Button className="bg-primary text-primary-foreground">
                  <Ticket className="h-4 w-4 mr-2" />
                  {t("get_pass", "Get Free Pass")}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Simple check icon component
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

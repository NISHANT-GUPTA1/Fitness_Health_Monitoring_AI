"use client"

import { useEffect, useState } from "react"

interface HeroBackgroundProps {
  children?: React.ReactNode
}

export default function HeroBackground({ children }: HeroBackgroundProps) {
  const [scrollPosition, setScrollPosition] = useState(0)

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY
      setScrollPosition(position)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Calculate opacity based on scroll position
  const heroOpacity = Math.max(0.15, Math.min(1, 1 - scrollPosition / 300))
  const overlayOpacity = Math.min(0.5, 0.2 + (scrollPosition / 1000))
  
  return (
    <div className="relative min-h-screen">
      {/* Fixed background image */}
      <div 
        className="fixed top-0 left-0 w-full h-screen bg-cover bg-center bg-no-repeat z-[-2]"
        style={{
          backgroundImage: "url('/images/hero-bg-fitness.jpg')",
          opacity: heroOpacity,
        }}
      />
      
      {/* Dark gradient overlay - gets darker as you scroll */}
      <div 
        className="fixed top-0 left-0 w-full h-screen bg-gradient-to-b from-black/20 to-black/50 z-[-1]"
        style={{ opacity: overlayOpacity }}
      />
      
      {/* App content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white/80 to-purple-50/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm">
        {children}
      </div>
    </div>
  )
}

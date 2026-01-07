"use client"

import { ReactNode, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface ScrollAnimatedSectionProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function ScrollAnimatedSection({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = "" 
}: ScrollAnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: false, // Allow re-animation on scroll
    margin: "-100px" // Trigger slightly before entering viewport
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.1, 0.25, 1] // Smooth easing
        }
      } : { 
        opacity: 0, 
        y: 60 
      }}
      exit={{ 
        opacity: 0, 
        y: -30,
        transition: { duration: 0.4 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ScrollFadeImageProps {
  src?: string
  alt?: string
  children?: ReactNode
  delay?: number
  className?: string
}

export function ScrollFadeImage({ 
  src, 
  alt, 
  children, 
  delay = 0,
  className = "" 
}: ScrollFadeImageProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: false,
    margin: "-80px"
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={isInView ? { 
        opacity: 1, 
        scale: 1,
        y: 0,
        transition: {
          duration: 0.7,
          delay,
          ease: [0.16, 1, 0.3, 1] // Smooth spring-like easing
        }
      } : { 
        opacity: 0, 
        scale: 0.9,
        y: 40 
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.95,
        y: -20,
        transition: { duration: 0.5 }
      }}
      className={className}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        children
      )}
    </motion.div>
  )
}

export function ScrollParallax({ 
  children, 
  offset = 50,
  className = "" 
}: { 
  children: ReactNode
  offset?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: false,
    margin: "0px"
  })

  return (
    <motion.div
      ref={ref}
      initial={{ y: 0 }}
      animate={isInView ? { 
        y: 0,
      } : { 
        y: offset 
      }}
      transition={{ 
        duration: 0.8,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AccessibilityContextType {
  voiceGuidanceEnabled: boolean
  screenReaderMode: boolean
  highContrastMode: boolean
  largeTextMode: boolean
  keyboardNavigationEnabled: boolean
  voiceNavigationEnabled: boolean
  toggleVoiceGuidance: () => void
  toggleScreenReaderMode: () => void
  toggleHighContrast: () => void
  toggleLargeText: () => void
  toggleKeyboardNavigation: () => void
  toggleVoiceNavigation: () => void
  speak: (text: string) => void
  announceAction: (action: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(false)
  const [screenReaderMode, setScreenReaderMode] = useState(false)
  const [highContrastMode, setHighContrastMode] = useState(false)
  const [largeTextMode, setLargeTextMode] = useState(false)
  const [keyboardNavigationEnabled, setKeyboardNavigationEnabled] = useState(true)
  const [voiceNavigationEnabled, setVoiceNavigationEnabled] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setVoiceGuidanceEnabled(settings.voiceGuidanceEnabled || false)
      setScreenReaderMode(settings.screenReaderMode || false)
      setHighContrastMode(settings.highContrastMode || false)
      setLargeTextMode(settings.largeTextMode || false)
      setKeyboardNavigationEnabled(settings.keyboardNavigationEnabled !== false)
      setVoiceNavigationEnabled(settings.voiceNavigationEnabled || false)
    }

    // Check if user has screen reader active
    const hasScreenReader = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (hasScreenReader) {
      setScreenReaderMode(true)
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      voiceGuidanceEnabled,
      screenReaderMode,
      highContrastMode,
      largeTextMode,
      keyboardNavigationEnabled,
      voiceNavigationEnabled
    }
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))

    // Apply body classes for accessibility modes
    if (highContrastMode) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }

    if (largeTextMode) {
      document.body.classList.add('large-text')
    } else {
      document.body.classList.remove('large-text')
    }
  }, [voiceGuidanceEnabled, screenReaderMode, highContrastMode, largeTextMode, keyboardNavigationEnabled, voiceNavigationEnabled])

  // Text-to-speech function
  const speak = (text: string) => {
    if (voiceGuidanceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.cancel() // Cancel any ongoing speech
      window.speechSynthesis.speak(utterance)
    }
  }

  // Announce actions for screen readers and voice guidance
  const announceAction = (action: string) => {
    if (screenReaderMode || voiceGuidanceEnabled) {
      // Create ARIA live region announcement
      const announcement = document.createElement('div')
      announcement.setAttribute('role', 'status')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = action
      document.body.appendChild(announcement)
      
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)

      // Also speak if voice guidance is enabled
      if (voiceGuidanceEnabled) {
        speak(action)
      }
    }
  }

  const toggleVoiceGuidance = () => {
    setVoiceGuidanceEnabled(prev => {
      const newValue = !prev
      if (newValue) {
        speak('Voice guidance enabled. I will now read out all actions and information.')
      }
      return newValue
    })
  }

  const toggleScreenReaderMode = () => {
    setScreenReaderMode(prev => {
      const newValue = !prev
      announceAction(newValue ? 'Screen reader mode enabled' : 'Screen reader mode disabled')
      return newValue
    })
  }

  const toggleHighContrast = () => {
    setHighContrastMode(prev => {
      const newValue = !prev
      announceAction(newValue ? 'High contrast mode enabled' : 'High contrast mode disabled')
      return newValue
    })
  }

  const toggleLargeText = () => {
    setLargeTextMode(prev => {
      const newValue = !prev
      announceAction(newValue ? 'Large text mode enabled' : 'Large text mode disabled')
      return newValue
    })
  }

  const toggleKeyboardNavigation = () => {
    setKeyboardNavigationEnabled(prev => {
      const newValue = !prev
      announceAction(newValue ? 'Keyboard navigation enabled' : 'Keyboard navigation disabled')
      return newValue
    })
  }

  const toggleVoiceNavigation = () => {
    setVoiceNavigationEnabled(prev => {
      const newValue = !prev
      if (newValue) {
        speak('Voice navigation enabled. You can now use voice commands to navigate.')
      } else {
        speak('Voice navigation disabled')
      }
      return newValue
    })
  }

  return (
    <AccessibilityContext.Provider
      value={{
        voiceGuidanceEnabled,
        screenReaderMode,
        highContrastMode,
        largeTextMode,
        keyboardNavigationEnabled,
        voiceNavigationEnabled,
        toggleVoiceGuidance,
        toggleScreenReaderMode,
        toggleHighContrast,
        toggleLargeText,
        toggleKeyboardNavigation,
        toggleVoiceNavigation,
        speak,
        announceAction
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

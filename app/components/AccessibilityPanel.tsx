"use client"

import { useState } from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Accessibility, 
  Volume2, 
  Eye, 
  Type, 
  Contrast, 
  Keyboard, 
  Mic,
  Info,
  CheckCircle2
} from 'lucide-react'

export default function AccessibilityPanel() {
  const {
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
    announceAction
  } = useAccessibility()

  const accessibilityFeatures = [
    {
      id: 'voice-guidance',
      icon: Volume2,
      title: 'Voice Guidance',
      description: 'Hear audio descriptions of all actions and workout instructions',
      enabled: voiceGuidanceEnabled,
      toggle: toggleVoiceGuidance,
      helpFor: 'Blind and visually impaired users',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'screen-reader',
      icon: Eye,
      title: 'Screen Reader Mode',
      description: 'Enhanced compatibility with JAWS, NVDA, and VoiceOver',
      enabled: screenReaderMode,
      toggle: toggleScreenReaderMode,
      helpFor: 'Blind and low vision users',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'high-contrast',
      icon: Contrast,
      title: 'High Contrast Mode',
      description: 'Increase color contrast for better visibility',
      enabled: highContrastMode,
      toggle: toggleHighContrast,
      helpFor: 'Low vision and color blind users',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'large-text',
      icon: Type,
      title: 'Large Text Mode',
      description: 'Increase text size throughout the application',
      enabled: largeTextMode,
      toggle: toggleLargeText,
      helpFor: 'Low vision users',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'keyboard-nav',
      icon: Keyboard,
      title: 'Keyboard Navigation',
      description: 'Navigate the entire app using only your keyboard',
      enabled: keyboardNavigationEnabled,
      toggle: toggleKeyboardNavigation,
      helpFor: 'Users with motor disabilities',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'voice-nav',
      icon: Mic,
      title: 'Voice Navigation',
      description: 'Control the app using voice commands',
      enabled: voiceNavigationEnabled,
      toggle: toggleVoiceNavigation,
      helpFor: 'Users with motor disabilities and blind users',
      color: 'from-red-500 to-pink-500'
    }
  ]

  const handleToggle = (feature: typeof accessibilityFeatures[0]) => {
    feature.toggle()
    announceAction(`${feature.title} ${!feature.enabled ? 'enabled' : 'disabled'}`)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Accessibility className="w-12 h-12 text-blue-600" />
          <h1 className="text-4xl font-bold">Accessibility Options</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          FEFE is designed for everyone. Enable features below to customize your experience based on your needs.
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Designed for Every Ability</h3>
              <p className="text-gray-700 dark:text-gray-300">
                All accessibility features work together to create an inclusive fitness experience. 
                You can enable multiple features simultaneously. Changes are saved automatically and will persist across sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accessibilityFeatures.map((feature) => {
          const Icon = feature.icon
          return (
            <Card 
              key={feature.id}
              className={`relative overflow-hidden transition-all ${
                feature.enabled 
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
            >
              {feature.enabled && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor={feature.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {feature.enabled ? 'Enabled' : 'Disabled'}
                  </Label>
                  <Switch
                    id={feature.id}
                    checked={feature.enabled}
                    onCheckedChange={() => handleToggle(feature)}
                    aria-label={`Toggle ${feature.title}`}
                  />
                </div>
                
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Helpful for:</span> {feature.helpFor}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Keyboard Shortcuts Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </CardTitle>
          <CardDescription>
            Use these shortcuts to navigate the app quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'Tab', action: 'Navigate forward' },
              { key: 'Shift + Tab', action: 'Navigate backward' },
              { key: 'Enter / Space', action: 'Activate button or link' },
              { key: 'Esc', action: 'Close dialog or menu' },
              { key: 'Arrow Keys', action: 'Navigate within menus' },
              { key: 'Alt + A', action: 'Open accessibility panel' }
            ].map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <kbd className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm">
                  {shortcut.key}
                </kbd>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {shortcut.action}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Commands Guide (shown when voice navigation is enabled) */}
      {voiceNavigationEnabled && (
        <Card className="border-2 border-blue-500 dark:border-blue-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Commands
            </CardTitle>
            <CardDescription>
              Say these commands to navigate the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { command: 'Go to workouts', action: 'Navigate to workout planner' },
                { command: 'Go to adaptive fitness', action: 'Open adaptive fitness' },
                { command: 'Check my form', action: 'Open form analysis camera' },
                { command: 'Go to tracker', action: 'Open wellness tracking' },
                { command: 'Go to profile', action: 'Open user profile' },
                { command: 'Go home', action: 'Return to home screen' },
                { command: 'Start workout', action: 'Begin daily exercises' },
                { command: 'Read this', action: 'Read current content aloud' }
              ].map((cmd, index) => (
                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                    "{cmd.command}"
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cmd.action}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

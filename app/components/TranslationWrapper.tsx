"use client"

import { useEffect, useState, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { translateText } from "@/lib/translation-api"

interface TranslationWrapperProps {
  children: ReactNode
  text?: string
  as?: keyof JSX.IntrinsicElements
  className?: string
  useApi?: boolean
}

/**
 * TranslationWrapper component that falls back to API translation
 * when static translations are not available
 */
export default function TranslationWrapper({ 
  children, 
  text, 
  as: Component = 'span',
  className = '',
  useApi = true
}: TranslationWrapperProps) {
  const { i18n, t } = useTranslation()
  const [translatedText, setTranslatedText] = useState<string>(text || '')
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    const handleLanguageChange = async () => {
      if (!text || !useApi) return
      
      // Check if we have a static translation first
      const staticTranslation = t(text, { defaultValue: '' })
      if (staticTranslation && staticTranslation !== text) {
        setTranslatedText(staticTranslation)
        return
      }

      // Fall back to API translation for non-English languages
      if (i18n.language !== 'en') {
        setIsTranslating(true)
        try {
          const translated = await translateText(text, i18n.language, 'en')
          setTranslatedText(translated)
        } catch (error) {
          console.error('Translation failed:', error)
          setTranslatedText(text) // Fallback to original
        } finally {
          setIsTranslating(false)
        }
      } else {
        setTranslatedText(text)
      }
    }

    handleLanguageChange()

    // Listen for language changes
    const handleChange = () => handleLanguageChange()
    window.addEventListener('languageChanged', handleChange)
    
    return () => {
      window.removeEventListener('languageChanged', handleChange)
    }
  }, [text, i18n.language, useApi, t])

  if (!text) {
    return <>{children}</>
  }

  return (
    <Component className={className}>
      {isTranslating ? <span className="opacity-50">{text}</span> : translatedText}
    </Component>
  )
}

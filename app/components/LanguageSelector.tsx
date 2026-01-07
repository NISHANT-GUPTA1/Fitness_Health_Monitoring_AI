"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { toast } from "sonner"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
]

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(
    languages.find((lang) => lang.code === i18n.language) || languages[0],
  )
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage')
    if (savedLang && savedLang !== i18n.language) {
      const lang = languages.find((l) => l.code === savedLang)
      if (lang) {
        i18n.changeLanguage(savedLang)
        setCurrentLanguage(lang)
      }
    }
  }, [])

  const changeLanguage = async (languageCode: string) => {
    if (isChanging || languageCode === currentLanguage.code) return
    
    setIsChanging(true)
    toast.loading(`Switching to ${languages.find(l => l.code === languageCode)?.name}...`)
    
    try {
      await i18n.changeLanguage(languageCode)
      const newLanguage = languages.find((lang) => lang.code === languageCode)
      if (newLanguage) {
        setCurrentLanguage(newLanguage)
        localStorage.setItem('preferredLanguage', languageCode)
        
        // Trigger custom event for dynamic translation
        window.dispatchEvent(new CustomEvent('languageChanged', { 
          detail: { language: languageCode } 
        }))
        
        toast.dismiss()
        toast.success(`Language changed to ${newLanguage.name}`)
        
        // Reload page to apply translations throughout
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error('Language change error:', error)
      toast.dismiss()
      toast.error('Failed to change language')
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80"
          disabled={isChanging}
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="mr-1">{currentLanguage.flag}</span>
          {currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm dark:bg-slate-800/95">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            disabled={isChanging}
            className={`cursor-pointer ${
              currentLanguage.code === language.code ? "bg-purple-50 dark:bg-purple-900/20" : ""
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

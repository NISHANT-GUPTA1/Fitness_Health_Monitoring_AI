"use client"

import React from 'react'
import '../i18n/config-compatibility'

interface I18nProviderProps {
  children: React.ReactNode
}

export default function I18nProvider({ children }: I18nProviderProps) {
  return <>{children}</>
}

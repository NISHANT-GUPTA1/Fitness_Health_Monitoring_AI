"use client"

import React from 'react'
import { useTranslation } from 'react-i18next'

export default function TranslationTester() {
  const { t } = useTranslation();
  
  // Test keys with both formats
  const testKeys = [
    'daily_desc',  // Original with underscores
    'daily desc',  // Space version
    'fitness_tracker', // Another original with underscores
    'fitness tracker'  // Another space version
  ];
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Translation Format Test</h2>
      <div className="space-y-2">
        {testKeys.map((key) => (
          <div key={key} className="flex flex-col p-2 border rounded">
            <span className="font-mono text-sm text-gray-500">Key: {key}</span>
            <span className="font-medium">{t(key)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import I18nProvider from './components/I18nProvider'
import { WorkoutProvider } from './contexts/WorkoutContext'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'FEFE - Fitness for Everyone',
  description: 'Designed for Every Body, Every Ability. Your inclusive fitness companion for adaptive workouts, personalized training, and wellness tracking.',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <AccessibilityProvider>
              <WorkoutProvider>
                {children}
                <Toaster position="top-right" richColors />
              </WorkoutProvider>
            </AccessibilityProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

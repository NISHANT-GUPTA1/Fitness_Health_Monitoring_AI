import type { Metadata } from 'next'
import './globals.css'
import I18nProvider from './components/I18nProvider'
import { WorkoutProvider } from './contexts/WorkoutContext'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'AI Fitness App',
  description: 'Your AI-powered fitness companion for a healthier lifestyle.',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <WorkoutProvider>
            {children}
            <Toaster position="top-right" richColors />
          </WorkoutProvider>
        </I18nProvider>
      </body>
    </html>
  )
}

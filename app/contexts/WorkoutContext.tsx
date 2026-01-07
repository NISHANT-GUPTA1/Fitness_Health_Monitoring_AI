"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

// Add a utility function to check if APIs are available
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    // Try to ping the API endpoint with a small timeout
    const response = await fetch('/api/openrouter/ping', { 
      signal: AbortSignal.timeout(3000) 
    });
    return response.ok;
  } catch (error) {
    console.warn('API connectivity check failed:', error);
    return false;
  }
};

interface WorkoutPlan {
  id: string
  name: string
  duration: string
  difficulty: string
  totalWorkouts: number
  estimatedCalories: number
  schedule: any[]
  status: 'active' | 'saved' | 'completed'
  savedAt: string
  startedAt?: string
  goals?: string[]
  originalFitnessLevel?: string
  createdFrom?: string
}

// Add type declaration for global window property
declare global {
  interface Window {
    API_CONNECTION_FAILED?: boolean;
  }
}

interface WorkoutContextType {
  savedPlans: WorkoutPlan[]
  setSavedPlans: React.Dispatch<React.SetStateAction<WorkoutPlan[]>>
  activePlan: WorkoutPlan | null
  getActivePlan: () => WorkoutPlan | null
  savePlan: (plan: WorkoutPlan) => void
  deletePlan: (planId: string) => void
  startPlan: (plan: WorkoutPlan) => void
  apiAvailable: boolean
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [savedPlans, setSavedPlans] = useState<WorkoutPlan[]>([]);
  const [apiAvailable, setApiAvailable] = useState<boolean>(true);

  // Load saved plans from localStorage on mount
  useEffect(() => {
    const loadSavedPlans = () => {
      try {
        const saved = localStorage.getItem('workoutPlans')
        if (saved) {
          setSavedPlans(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Error loading saved plans:', error)
      }
    }
    loadSavedPlans()
    
    // Check API connectivity on initial load
    const checkApiConnectivity = async () => {
      try {
        const isAvailable = await checkApiStatus();
        setApiAvailable(isAvailable);
        console.log("API connectivity check:", isAvailable ? "AVAILABLE" : "UNAVAILABLE");
        
        // Store API status in localStorage for other components to access
        localStorage.setItem('apiAvailable', String(isAvailable));
        
        // If API is unavailable, set a flag to use mock responses in all components
        if (!isAvailable) {
          window.API_CONNECTION_FAILED = true;
        }
      } catch (error) {
        console.error("Error checking API status:", error);
        setApiAvailable(false);
        localStorage.setItem('apiAvailable', 'false');
      }
    };
    
    checkApiConnectivity();
  }, [])

  // Save plans to localStorage whenever savedPlans changes
  useEffect(() => {
    try {
      localStorage.setItem('workoutPlans', JSON.stringify(savedPlans))
    } catch (error) {
      console.error('Error saving plans:', error)
    }
  }, [savedPlans])

  const getActivePlan = () => {
    return savedPlans.find(plan => plan.status === 'active') || null
  }

  const savePlan = (plan: WorkoutPlan) => {
    const newPlan = {
      ...plan,
      id: plan.id || Date.now().toString(),
      status: 'saved' as const,
      savedAt: new Date().toISOString()
    }
    setSavedPlans(prev => [...prev, newPlan])
  }

  const deletePlan = (planId: string) => {
    setSavedPlans(prev => prev.filter(plan => plan.id !== planId))
  }

  const startPlan = (plan: WorkoutPlan) => {
    setSavedPlans(prev => prev.map(p => ({
      ...p,
      status: p.id === plan.id ? 'active' as const : (p.status === 'active' ? 'saved' as const : p.status)
    })))
  }

  const activePlan = getActivePlan()

  return (
    <WorkoutContext.Provider value={{
      savedPlans,
      setSavedPlans,
      activePlan,
      getActivePlan,
      savePlan,
      deletePlan,
      startPlan,
      apiAvailable
    }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  const context = useContext(WorkoutContext)
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }
  return context
}

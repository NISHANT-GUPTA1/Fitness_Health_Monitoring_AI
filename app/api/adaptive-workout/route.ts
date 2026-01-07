import { NextRequest, NextResponse } from 'next/server';
import { generateAdaptiveWorkoutPlan } from '@/lib/gemma-api';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    const { disabilityType, mobilityLimitations, preferredExerciseTypes, sessionDuration } = requestData;
    
    // Validate required parameters
    if (!disabilityType) {
      return NextResponse.json({ error: 'Disability type is required' }, { status: 400 });
    }
    
    // Generate the adaptive workout plan
    const plan = await generateAdaptiveWorkoutPlan(
      disabilityType,
      mobilityLimitations || [],
      preferredExerciseTypes || [],
      sessionDuration || '30-45'
    );
    
    // Return the generated plan
    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error generating adaptive workout plan:', error);
    return NextResponse.json({ error: 'Failed to generate adaptive workout plan' }, { status: 500 });
  }
}

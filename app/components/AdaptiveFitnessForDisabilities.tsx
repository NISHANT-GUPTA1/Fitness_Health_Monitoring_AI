'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Heart, 
  Accessibility, 
  Brain, 
  Eye, 
  Ear, 
  Activity,
  Dumbbell,
  Wind,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface DisabilityCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  exercises: Exercise[];
}

interface Exercise {
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  benefits: string[];
  instructions: string[];
  modifications: string[];
  equipment: string[];
  videoUrl?: string;
}

export default function AdaptiveFitnessForDisabilities() {
  const [selectedCategory, setSelectedCategory] = useState<string>('mobility');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const disabilityCategories: DisabilityCategory[] = [
    {
      id: 'mobility',
      name: 'Mobility Impairments',
      icon: <Accessibility className="w-6 h-6" />,
      description: 'Exercises designed for wheelchair users and those with limited mobility',
      exercises: [
        {
          name: 'Seated Upper Body Workout',
          difficulty: 'Beginner',
          duration: '15-20 minutes',
          benefits: [
            'Improves upper body strength',
            'Enhances shoulder and arm flexibility',
            'Boosts cardiovascular health'
          ],
          instructions: [
            'Sit upright in your wheelchair or chair with back support',
            'Start with arm circles - 10 forward, 10 backward',
            'Perform seated shoulder presses with light weights or resistance bands',
            'Do chest presses with resistance bands attached to the back of chair',
            'Finish with seated torso twists for core engagement'
          ],
          modifications: [
            'Use lighter weights or no weights initially',
            'Reduce repetitions if fatigue occurs',
            'Focus on form over speed'
          ],
          equipment: ['Resistance bands', 'Light dumbbells (1-5 lbs)', 'Sturdy chair']
        },
        {
          name: 'Wheelchair Cardio Circuit',
          difficulty: 'Intermediate',
          duration: '20-30 minutes',
          benefits: [
            'Increases heart rate and endurance',
            'Burns calories effectively',
            'Improves coordination'
          ],
          instructions: [
            'Warm up with gentle arm movements for 3-5 minutes',
            'Perform rapid arm circles for 30 seconds',
            'Do wheelchair sprints (push forward and back) for 1 minute',
            'Rest for 30 seconds',
            'Repeat circuit 5-8 times',
            'Cool down with gentle stretches'
          ],
          modifications: [
            'Adjust intensity based on fitness level',
            'Take longer rest periods if needed',
            'Reduce circuit repetitions'
          ],
          equipment: ['Wheelchair', 'Open space', 'Timer']
        },
        {
          name: 'Adaptive Yoga Flow',
          difficulty: 'Beginner',
          duration: '25-30 minutes',
          benefits: [
            'Reduces stress and anxiety',
            'Improves flexibility',
            'Enhances mind-body connection'
          ],
          instructions: [
            'Begin in a comfortable seated position',
            'Practice deep breathing - inhale for 4 counts, exhale for 4 counts',
            'Perform seated cat-cow stretches',
            'Do gentle side bends and forward folds',
            'Practice guided meditation for final 5 minutes'
          ],
          modifications: [
            'Use props like cushions for support',
            'Skip poses that cause discomfort',
            'Focus on breathing if physical movement is limited'
          ],
          equipment: ['Yoga mat or comfortable surface', 'Cushions', 'Blanket']
        }
      ]
    },
    {
      id: 'visual',
      name: 'Visual Impairments',
      icon: <Eye className="w-6 h-6" />,
      description: 'Safe and effective exercises with audio cues and tactile guidance',
      exercises: [
        {
          name: 'Guided Floor Exercises',
          difficulty: 'Beginner',
          duration: '15-20 minutes',
          benefits: [
            'Builds core strength',
            'Improves balance and spatial awareness',
            'Safe environment for exercise'
          ],
          instructions: [
            'Use a yoga mat to define your exercise space',
            'Start on hands and knees for stability',
            'Perform bird dog exercise - extend opposite arm and leg',
            'Do modified planks on knees',
            'Practice bridges lying on back',
            'Use audio cues or workout buddy for guidance'
          ],
          modifications: [
            'Keep one hand on mat for spatial awareness',
            'Use textured mats for better orientation',
            'Practice in familiar space first'
          ],
          equipment: ['Textured yoga mat', 'Audio guide/app', 'Safe, clear space']
        },
        {
          name: 'Stationary Cardio Workout',
          difficulty: 'Intermediate',
          duration: '20-25 minutes',
          benefits: [
            'Cardiovascular fitness without navigation',
            'Safe stationary movement',
            'Customizable intensity'
          ],
          instructions: [
            'Use stationary bike or elliptical with audio feedback',
            'March in place for warm-up (3 minutes)',
            'Perform high knees for 30 seconds',
            'Do jumping jacks or modified jacks for 30 seconds',
            'Rest for 30 seconds',
            'Repeat circuit 8-10 times'
          ],
          modifications: [
            'Use wall or rail for balance support',
            'Reduce intensity of movements',
            'Use tactile markers for foot placement'
          ],
          equipment: ['Stationary equipment (optional)', 'Audio timer', 'Support rail']
        },
        {
          name: 'Resistance Band Training',
          difficulty: 'Beginner',
          duration: '15-20 minutes',
          benefits: [
            'Builds muscle strength safely',
            'Provides tactile feedback',
            'Low risk of injury'
          ],
          instructions: [
            'Secure resistance band to stable anchor point',
            'Use tactile markers on band for grip placement',
            'Perform rows, chest presses, and arm curls',
            'Each exercise: 3 sets of 12 repetitions',
            'Focus on feeling muscle engagement'
          ],
          modifications: [
            'Use different resistance levels',
            'Work with a partner for guidance',
            'Use braille or large print workout cards'
          ],
          equipment: ['Resistance bands with tactile markers', 'Secure anchor point', 'Audio guide']
        }
      ]
    },
    {
      id: 'hearing',
      name: 'Hearing Impairments',
      icon: <Ear className="w-6 h-6" />,
      description: 'Visual-based exercises with clear demonstrations and written instructions',
      exercises: [
        {
          name: 'Visual Cue HIIT Workout',
          difficulty: 'Intermediate',
          duration: '20-25 minutes',
          benefits: [
            'High-intensity calorie burn',
            'Improves cardiovascular fitness',
            'Follows visual timing cues'
          ],
          instructions: [
            'Use visual timer or light-based signals',
            'Warm up: light jog in place (3 minutes)',
            'Round 1: Burpees with visual countdown',
            'Round 2: Mountain climbers',
            'Round 3: Jump squats',
            'Each round: 40 seconds work, 20 seconds rest',
            'Repeat 3 times'
          ],
          modifications: [
            'Use video demonstrations with captions',
            'Follow along with visual workout apps',
            'Practice moves slowly first'
          ],
          equipment: ['Visual timer', 'Exercise mat', 'Video guide with captions']
        },
        {
          name: 'Strength Training Circuit',
          difficulty: 'Beginner',
          duration: '25-30 minutes',
          benefits: [
            'Builds overall body strength',
            'Easy to follow visual routines',
            'Structured progression'
          ],
          instructions: [
            'Follow printed or digital visual guide',
            'Station 1: Dumbbell squats (12 reps)',
            'Station 2: Push-ups or modified push-ups (10 reps)',
            'Station 3: Bent-over rows (12 reps)',
            'Station 4: Plank hold (30 seconds)',
            'Rest 1 minute between circuits',
            'Complete 3-4 circuits'
          ],
          modifications: [
            'Use mirror for form checking',
            'Work with visual workout cards',
            'Use fitness apps with visual demonstrations'
          ],
          equipment: ['Dumbbells', 'Workout mat', 'Visual instruction cards', 'Mirror']
        },
        {
          name: 'Yoga with Visual Flow',
          difficulty: 'Beginner',
          duration: '30-40 minutes',
          benefits: [
            'Stress reduction',
            'Flexibility improvement',
            'Mind-body awareness'
          ],
          instructions: [
            'Follow video guide with captions and clear demonstrations',
            'Start with breathing exercises shown visually',
            'Flow through sun salutations',
            'Hold warrior poses',
            'Perform balancing poses with visual reference',
            'End with savasana'
          ],
          modifications: [
            'Use visual pose charts',
            'Practice with mirror feedback',
            'Use vibrating timer for transitions'
          ],
          equipment: ['Yoga mat', 'Visual guide/video', 'Blocks and straps', 'Mirror']
        }
      ]
    },
    {
      id: 'cognitive',
      name: 'Cognitive/Neurological',
      icon: <Brain className="w-6 h-6" />,
      description: 'Simple, structured routines for cognitive and neurological conditions',
      exercises: [
        {
          name: 'Gentle Movement Therapy',
          difficulty: 'Beginner',
          duration: '15-20 minutes',
          benefits: [
            'Improves motor control',
            'Enhances cognitive function',
            'Reduces stress'
          ],
          instructions: [
            'Start with simple marching in place',
            'Practice arm raises - one at a time',
            'Do gentle leg lifts while standing or seated',
            'Perform simple balance exercises holding support',
            'End with stretching and deep breathing'
          ],
          modifications: [
            'Break into shorter sessions',
            'Use visual and verbal cues together',
            'Have caregiver present for support'
          ],
          equipment: ['Supportive chair', 'Clear space', 'Visual cue cards']
        },
        {
          name: 'Structured Walking Program',
          difficulty: 'Beginner',
          duration: '10-30 minutes',
          benefits: [
            'Improves cardiovascular health',
            'Easy to follow routine',
            'Builds daily exercise habit'
          ],
          instructions: [
            'Walk in familiar, safe environment',
            'Start with 10 minutes, gradually increase',
            'Maintain steady, comfortable pace',
            'Use walking aids if needed',
            'Follow same route for consistency'
          ],
          modifications: [
            'Walk with companion for safety',
            'Use treadmill indoors',
            'Take frequent breaks as needed'
          ],
          equipment: ['Comfortable shoes', 'Walking aid if needed', 'Safe route']
        },
        {
          name: 'Chair Exercise Routine',
          difficulty: 'Beginner',
          duration: '20-25 minutes',
          benefits: [
            'Full body workout seated',
            'Reduces fall risk',
            'Easy to remember sequence'
          ],
          instructions: [
            'Sit in sturdy chair with feet flat on floor',
            'Perform seated marching for 1 minute',
            'Do arm circles and shoulder rolls',
            'Practice sit-to-stand (with support if needed)',
            'Perform ankle circles and leg extensions',
            'Repeat sequence 3 times'
          ],
          modifications: [
            'Use chair with arms for support',
            'Do partial movements only',
            'Have caregiver demonstrate'
          ],
          equipment: ['Sturdy chair', 'Clear space', 'Support nearby']
        }
      ]
    },
    {
      id: 'chronic',
      name: 'Chronic Conditions',
      icon: <Heart className="w-6 h-6" />,
      description: 'Low-impact exercises for heart conditions, diabetes, arthritis, and more',
      exercises: [
        {
          name: 'Gentle Water Aerobics',
          difficulty: 'Beginner',
          duration: '20-30 minutes',
          benefits: [
            'Low-impact on joints',
            'Improves circulation',
            'Builds strength with water resistance'
          ],
          instructions: [
            'Enter pool gradually, adjust to temperature',
            'Walk in water for 5 minutes (warm-up)',
            'Perform leg lifts forward, side, and back',
            'Do arm movements pushing water',
            'Practice gentle water jogging',
            'Cool down with slow walking'
          ],
          modifications: [
            'Stay in shallow water for safety',
            'Use pool noodle for support',
            'Adjust intensity based on energy levels'
          ],
          equipment: ['Access to pool', 'Pool noodle', 'Water shoes']
        },
        {
          name: 'Arthritis-Friendly Stretching',
          difficulty: 'Beginner',
          duration: '15-20 minutes',
          benefits: [
            'Reduces joint stiffness',
            'Maintains range of motion',
            'Minimizes pain'
          ],
          instructions: [
            'Warm joints with gentle movement or warm compress',
            'Stretch each major joint gently',
            'Hold stretches for 15-30 seconds',
            'Never force or bounce',
            'Focus on smooth, controlled movements',
            'Practice morning and evening'
          ],
          modifications: [
            'Use heat before stretching',
            'Work within pain-free range',
            'Skip painful movements'
          ],
          equipment: ['Comfortable surface', 'Warm compress', 'Supportive chair']
        },
        {
          name: 'Heart-Healthy Walking Routine',
          difficulty: 'Beginner',
          duration: '20-30 minutes',
          benefits: [
            'Strengthens cardiovascular system',
            'Lowers blood pressure',
            'Manages weight'
          ],
          instructions: [
            'Start with 5-minute easy pace warm-up',
            'Walk at moderate pace (able to talk)',
            'Monitor heart rate if advised',
            'Gradually increase duration over weeks',
            'Cool down with slower pace last 5 minutes',
            'Stay hydrated'
          ],
          modifications: [
            'Walk on flat terrain',
            'Take breaks as needed',
            'Consult doctor on heart rate zones'
          ],
          equipment: ['Comfortable walking shoes', 'Heart rate monitor', 'Water bottle']
        }
      ]
    }
  ];

  const currentCategory = disabilityCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Accessibility className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Adaptive Fitness
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Personalized exercise programs designed for every ability. Your fitness journey, your way.
          </p>
        </div>

        {/* Category Selection */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {disabilityCategories.map((category) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedCategory === category.id
                  ? 'ring-2 ring-indigo-500 shadow-lg bg-indigo-50 dark:bg-indigo-950'
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedExercise(null);
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3 text-indigo-600 dark:text-indigo-400">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        {currentCategory && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Exercise List */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {currentCategory.icon}
                    <span className="ml-2">{currentCategory.name}</span>
                  </CardTitle>
                  <CardDescription>{currentCategory.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentCategory.exercises.map((exercise, index) => (
                      <Button
                        key={index}
                        variant={selectedExercise === exercise ? "default" : "outline"}
                        className="w-full justify-start text-left h-auto py-4"
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{exercise.name}</div>
                          <div className="text-xs mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {exercise.difficulty}
                            </Badge>
                            <span className="text-muted-foreground">{exercise.duration}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exercise Details */}
            <div className="lg:col-span-2">
              {selectedExercise ? (
                <Card className="shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <CardTitle className="text-2xl">{selectedExercise.name}</CardTitle>
                    <CardDescription className="text-indigo-100">
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {selectedExercise.difficulty}
                        </Badge>
                        <span className="flex items-center">
                          <Activity className="w-4 h-4 mr-1" />
                          {selectedExercise.duration}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Benefits */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                        Benefits
                      </h3>
                      <ul className="space-y-2">
                        {selectedExercise.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Dumbbell className="w-5 h-5 mr-2 text-indigo-500" />
                        Step-by-Step Instructions
                      </h3>
                      <ol className="space-y-3">
                        {selectedExercise.instructions.map((instruction, index) => (
                          <li key={index} className="flex">
                            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                              {index + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Modifications */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="modifications">
                        <AccordionTrigger className="text-lg font-semibold">
                          <div className="flex items-center">
                            <Wind className="w-5 h-5 mr-2 text-blue-500" />
                            Modifications & Adaptations
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 mt-2">
                            {selectedExercise.modifications.map((mod, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                <span>{mod}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="equipment">
                        <AccordionTrigger className="text-lg font-semibold">
                          Required Equipment
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 mt-2">
                            {selectedExercise.equipment.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-indigo-500 mr-2">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Safety Note */}
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        <strong>Important:</strong> Always consult with your healthcare provider before starting any new exercise program. 
                        Listen to your body and stop if you experience pain or discomfort.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Activity className="w-4 h-4 mr-2" />
                        Start Workout
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Save to My Routines
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <Accessibility className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      Select an Exercise
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      Choose an exercise from the list to view details and instructions
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Resources Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle>Additional Resources & Support</CardTitle>
              <CardDescription>Connect with professionals and communities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Find a Specialist</div>
                    <div className="text-xs text-muted-foreground">Connect with adapted fitness trainers</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Join Community</div>
                    <div className="text-xs text-muted-foreground">Share experiences with others</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Video Library</div>
                    <div className="text-xs text-muted-foreground">Watch demonstrations & tutorials</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

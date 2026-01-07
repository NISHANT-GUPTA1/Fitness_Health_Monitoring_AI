# FEFE Functions & Technical Implementation Guide

## Overview

This document provides a comprehensive guide to all technical implementations, animations, and core functionalities used in the FEFE (Fitness For Everyone) application. It covers MediaPipe integration, animation systems, and the complete technology stack.

---

## Table of Contents

1. [MediaPipe Pose Estimation](#mediapipe-pose-estimation)
2. [Animation System](#animation-system)
3. [Technology Stack](#technology-stack)
4. [Exercise Correction System](#exercise-correction-system)
5. [AI Integration](#ai-integration)
6. [Architecture Overview](#architecture-overview)

---

## MediaPipe Pose Estimation

### Overview

The application uses **MediaPipe Pose** for real-time pose detection and exercise form analysis. This provides 100% client-side processing with no video data sent to servers, ensuring complete privacy and GDPR/HIPAA compliance.

### Implementation Architecture

```
lib/pose/
 ├── pose.ts          # MediaPipe initialization & configuration
 ├── angles.ts        # Angle calculation utilities for joints
 ├── rules.ts         # Exercise correctness validation rules
 ├── repCounter.ts    # Automated rep counting state machine
 └── index.ts         # Public API exports

app/components/
 ├── PoseCamera.tsx          # Webcam integration with MediaPipe
 ├── FeedbackPanel.tsx       # Real-time UI feedback display
 └── LivePoseAnalysis.tsx    # Complete analysis component
```

### Key Features

#### ✅ Core Capabilities
- **Real-time pose detection** using MediaPipe Pose library
- **Webcam integration** with HTML5 Camera API
- **Visual feedback** with skeleton overlay on live video
- **3 exercise types**: Squat, Push-up, Plank
- **Automatic rep counting** for squats and push-ups
- **Form validation** with precise angle analysis

#### ✅ Privacy & Security
- **100% client-side processing** - no video transmitted to servers
- **GDPR & HIPAA compliant** - all data stays in browser
- **Works offline** after initial model download
- **No data storage** - real-time processing only

#### ✅ Technical Implementation
- **TypeScript** throughout for type safety
- **Modular architecture** - easy to extend with new exercises
- **Performance optimized** - debounced processing for smooth performance
- **Error handling** - graceful camera permission failures
- **Responsive design** - works on mobile and desktop

### MediaPipe Configuration

```typescript
// Core MediaPipe initialization
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

### Angle Calculation System

The system uses precise geometric calculations to measure joint angles:

```typescript
// Calculate angle between three points (landmark indices)
function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - 
                  Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}
```

### Exercise Validation Rules

#### Squat Detection
- **Key points**: Hip, Knee, Ankle alignment
- **Down position**: Knee angle < 100°
- **Up position**: Knee angle > 160°
- **Form check**: Back straight, knees over toes

#### Push-up Detection
- **Key points**: Shoulder, Elbow, Wrist alignment
- **Down position**: Elbow angle < 90°
- **Up position**: Elbow angle > 160°
- **Form check**: Body straight, core engaged

#### Plank Validation
- **Key points**: Shoulder, Hip, Ankle alignment
- **Time-based**: Hold position for target duration
- **Form check**: Body straight, no sagging

### Integration Examples

#### Basic Integration
```tsx
import LivePoseAnalysis from "@/app/components/LivePoseAnalysis";

export default function WorkoutPage() {
  return <LivePoseAnalysis />;
}
```

#### Custom Exercise Integration
```tsx
import PoseCamera from "@/app/components/PoseCamera";
import { checkExerciseForm } from "@/lib/pose";

function CustomWorkout() {
  const handlePose = (results) => {
    const feedback = checkExerciseForm("squat", results);
    console.log(feedback);
  };

  return <PoseCamera onResults={handlePose} />;
}
```

### Adding New Exercises

To add a new exercise, extend the rules in `lib/pose/rules.ts`:

```typescript
export function bicepCurlRule(results: Results): FeedbackResult {
  const landmarks = results.poseLandmarks;
  
  // Define key landmarks
  const shoulder = landmarks[11]; // Left shoulder
  const elbow = landmarks[13];    // Left elbow
  const wrist = landmarks[15];    // Left wrist
  
  // Calculate angle
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  
  // Validation logic
  if (elbowAngle < 50) {
    return { correct: true, message: "Good curl! Keep going." };
  } else {
    return { correct: false, message: "Curl your arm more" };
  }
}
```

---

## Animation System

### Framer Motion Integration

The application uses **Framer Motion** for smooth, performant animations throughout the interface.

### Scroll-Based Animations

#### ScrollAnimatedSection Component

Located in `app/components/ScrollAnimatedSection.tsx`, this component provides scroll-triggered animations:

```tsx
import { motion, useInView } from "framer-motion";

export function ScrollAnimatedSection({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

#### ScrollFadeImage Component

Provides delayed fade-in effects for image galleries and grids:

```tsx
export function ScrollFadeImage({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Hero Section Animations

#### Floating Blobs
```tsx
<motion.div 
  className="absolute top-20 left-10 w-72 h-72 bg-purple-500"
  animate={{
    y: [0, -30, 0],
    scale: [1, 1.1, 1],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

#### Text Reveal Animations
```tsx
<motion.h1 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>
  Transform Your Body
</motion.h1>
```

### Interactive Animations

#### Hover Effects
```tsx
<Card className="hover:scale-105 transition-all duration-300">
  {/* Content */}
</Card>
```

#### Button Animations
```tsx
<Button className="group">
  Get Started
  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
</Button>
```

### Performance Optimization

- **Use `useInView` hook** to trigger animations only when elements are visible
- **Debounced scroll listeners** to prevent performance issues
- **GPU-accelerated properties** (transform, opacity) for smooth animations
- **`will-change` CSS property** for elements with frequent animations

---

## Technology Stack

### Core Technologies

#### Frontend Framework
- **Next.js 15** - React framework with server-side rendering, static site generation, and API routes
- **React 19** - Component-based UI library with latest features
- **TypeScript** - Type-safe JavaScript for reduced bugs and better developer experience

#### UI Framework & Styling
- **Tailwind CSS** - Utility-first CSS framework for rapid development
- **shadcn/ui** - High-quality, accessible React components
- **Lucide Icons** - Beautiful, consistent SVG icons
- **Framer Motion** - Production-ready animation library

#### AI & Machine Learning
- **TensorFlow.js** - Browser-based machine learning
- **MediaPipe** - Real-time pose detection framework
- **OpenRouter API** - Access to multiple AI models (Google Gemma)

#### State Management
- **React Context API** - Built-in state management
- **React Hooks** - Modern state and lifecycle management

#### Backend
- **Flask** - Python micro-framework for ML model serving
- **Python 3.8+** - Backend processing and AI integration

#### Internationalization
- **i18next** - Comprehensive internationalization framework
- **react-i18next** - React integration for translations

### Why This Stack?

#### Next.js & React
- **Performance**: Server-side rendering for fast initial loads
- **SEO-friendly**: Better search engine indexing
- **Development Speed**: Hot reload and Fast Refresh
- **API Routes**: Built-in backend endpoints
- **Image Optimization**: Automatic image optimization

#### Tailwind CSS & shadcn/ui
- **Rapid Development**: Pre-built utility classes
- **Consistency**: Design token system
- **Customizable**: Easily themed components
- **Responsive**: Mobile-first design utilities
- **Dark Mode**: Simple theme switching
- **Small Bundle**: Purged unused CSS in production

#### TensorFlow.js & MediaPipe
- **Client-Side Processing**: No server uploads needed
- **Privacy**: User data stays on device
- **Low Latency**: Real-time feedback
- **Offline Support**: Works without internet
- **Cross-Platform**: Runs in any modern browser

#### Flask Backend
- **Lightweight**: Minimal overhead
- **ML Integration**: Python ecosystem for AI/ML
- **Flexible**: Easy to extend
- **RESTful APIs**: Standard API patterns

---

## Exercise Correction System

### Backend Implementation

The exercise correction system uses a Flask backend with MediaPipe for video analysis.

#### Architecture
```
backend/
 ├── app.py              # Flask server main entry
 ├── requirements.txt    # Python dependencies
 └── exercises/          # Exercise-specific logic
```

#### Key Dependencies
```
flask
flask-cors
opencv-python
mediapipe
numpy
pyttsx3  # Text-to-speech for voice feedback
```

### Voice Feedback System

Real-time audio feedback using `pyttsx3`:
- Announces rep counts
- Provides form corrections
- Accessibility support for visually impaired users

### Setup Instructions

#### Windows
```bash
start_backend.bat
```

#### Mac/Linux
```bash
chmod +x start_backend.sh
./start_backend.sh
```

The backend runs on `http://localhost:5000`

---

## AI Integration

### OpenRouter API

The app uses OpenRouter to access multiple AI models including Google Gemma.

#### Features
- **Workout Generation**: Personalized workout plans based on user goals
- **Diet Planning**: Custom meal plans with nutritional information
- **Adaptive Workouts**: Exercise modifications for disabilities

#### Configuration
```typescript
// lib/gemma-api.ts
const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const MODEL = "google/gemma-2-9b-it:free";

async function generateWorkout(params) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a fitness expert..." },
        { role: "user", content: userPrompt }
      ]
    })
  });
  return response.json();
}
```

### Error Handling

- **Fallback Plans**: Pre-defined workout/diet plans if API fails
- **JSON Parsing**: Multiple parsing strategies for robustness
- **Validation**: Structure validation before rendering
- **Logging**: Detailed error logs for debugging

---

## Architecture Overview

### Component Structure

```
┌─────────────────────────────────────────┐
│          EliteNavigation                │
│  (Header with theme toggle)             │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│          Main Page Router               │
│  - Home                                 │
│  - Workout Planner                      │
│  - Pose Analysis                        │
│  - Shop                                 │
│  - Tracker                              │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│     Feature Components                  │
│  - ScrollAnimatedSection                │
│  - PoseCamera                           │
│  - LivePoseAnalysis                     │
│  - CombinedPlanner                      │
│  - RewardsSystem                        │
└─────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction** → Component State
2. **Component State** → Context API (global state)
3. **API Requests** → Flask Backend / OpenRouter
4. **AI Processing** → Response Parsing
5. **UI Update** → Animated Rendering

### State Management Patterns

#### Context Providers
```tsx
// contexts/WorkoutContext.tsx
export const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [progress, setProgress] = useState({});
  
  return (
    <WorkoutContext.Provider value={{ workoutPlan, progress }}>
      {children}
    </WorkoutContext.Provider>
  );
}
```

### Performance Optimizations

1. **Code Splitting**: Dynamic imports for large components
2. **Image Optimization**: Next.js Image component
3. **Lazy Loading**: Components load on-demand
4. **Memoization**: React.memo for expensive components
5. **Debouncing**: Scroll and input event handlers
6. **GPU Acceleration**: Transform-based animations

---

## Development Workflow

### Local Development

1. **Install Dependencies**
```bash
npm install
```

2. **Start Dev Server**
```bash
npm run dev
```

3. **Start Backend** (if needed)
```bash
cd backend
python app.py
```

### Building for Production

```bash
npm run build
npm run start
```

### Testing

- **Pose Detection**: Visit `/pose` route
- **AI Integration**: Use workout/diet planner components
- **Animations**: Scroll through homepage

---

## Browser Compatibility

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- WebGL 2.0 (for TensorFlow.js)
- WebRTC (for camera access)
- ES2020 JavaScript features
- CSS Grid & Flexbox

---

## Future Enhancements

### Planned Features
- [ ] Additional exercise types (yoga, pilates)
- [ ] Multi-person pose detection
- [ ] Video upload for analysis
- [ ] Social features & challenges
- [ ] Progressive Web App (PWA)
- [ ] Offline workout library

### Technical Improvements
- [ ] WebAssembly optimization
- [ ] Service Worker caching
- [ ] Real-time multiplayer workouts
- [ ] Advanced analytics dashboard

---

## Troubleshooting

### Common Issues

#### Camera Not Working
- Check browser permissions
- Ensure HTTPS (required for camera access)
- Try different browser

#### Pose Detection Slow
- Reduce `modelComplexity` in MediaPipe config
- Ensure GPU acceleration enabled
- Close other tabs/applications

#### AI API Errors
- Verify API key in `.env.local`
- Check API rate limits
- Review network console for errors

---

## Contributing

To add new features or exercises:

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request with documentation

---

## License

This project is part of FEFE (Fitness For Everyone) - making fitness accessible to all.

---

**Last Updated**: January 2026  
**Version**: 2.0  
**Maintainer**: FEFE Development Team

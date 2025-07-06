# Fitness Health Monitoring AI

A comprehensive AI-powered fitness and health monitoring application built with Next.js, TypeScript, and Tailwind CSS.

## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Backend Setup](#backend-setup)
- [Project Structure](#project-structure)
- [Components](#components)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

🏋 *Workout Planner* - Create personalized workout routines  

📊 *Fitness Tracker* - Monitor your progress and fitness metrics  
🏃 *Daily Exercises* - Track daily exercise activities  
🧘 *Posture Checker* - AI-powered posture analysis  
🤝 *Partner Finder* - Find workout partners in your area  
💪 *Gym Machine Guide* - Learn how to use gym equipment properly  
👤 *User Profile* - Manage your personal fitness profile  
🌍 *Internationalization* - Multi-language support  

## Tech Stack

- *Frontend*: Next.js 14, React, TypeScript
- *Styling*: Tailwind CSS
- *UI Components*: Custom component library with shadcn/ui
- *Backend*: Flask (Python) for AI processing
- *Database*: SQL database setup included

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.8+ (for AI backend)

### Installation

1. Clone the repository:
bash
git clone https://github.com/NISHANT-GUPTA1/Fitness_Health_Monitoring_AI.git
cd Fitness_Health_Monitoring_AI


2. Install dependencies:

npm install
# or
pnpm install


3. Run the development server:
bash
npm run dev
# or
pnpm dev


4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup

1. Navigate to the scripts directory and set up the Python backend:
bash
cd scripts
pip install flask
python flask_backend.py


2. Set up the database:
bash
# Run the SQL setup script in your preferred database management system
# File: scripts/database_setup.sql


## Project Structure

text
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── i18n/             # Internationalization configs
│   └── globals.css       # Global styles
├── components/            # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
│   └── images/          # Gym equipment images
├── scripts/              # Backend and database scripts
└── styles/              # Additional styling


## Components

- *DailyExercises*: Track and log daily workouts
- *FitnessTracker*: Monitor fitness metrics and progress
- *GymMachineGuide*: Visual guide for gym equipment
- *PostureChecker*: AI-powered posture analysis
- *PartnerFinder*: Connect with workout partners
- *UserProfile*: Manage user information and preferences
- *WorkoutPlanner*: Create and schedule workout routines

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - [@NISHANT-GUPTA1](https://github.com/NISHANT-GUPTA1)

Project Link: [(https://fitnesshealthmonitoringai.netlify.app/)]

---

[⬆ Back to Top](#fitness-health-monitoring-ai)

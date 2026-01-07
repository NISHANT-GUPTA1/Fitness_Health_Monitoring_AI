"use client";

/**
 * LivePoseAnalysis Component
 * Complete integration: Camera + Pose Detection + Rules + Rep Counting + Feedback
 */

import { useState, useCallback } from "react";
import PoseCamera from "./PoseCamera";
import FeedbackPanel from "./FeedbackPanel";
import { Results } from "@/lib/pose/pose";
import { checkExerciseForm, FeedbackResult } from "@/lib/pose/rules";
import { SquatCounter, PushUpCounter } from "@/lib/pose/repCounter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExerciseType = "squat" | "pushup" | "plank";

// Initialize rep counters
const repCounters = {
  squat: new SquatCounter(),
  pushup: new PushUpCounter(),
  plank: new SquatCounter(), // Plank doesn't use reps, but keeping for consistency
};

export default function LivePoseAnalysis() {
  const [exercise, setExercise] = useState<ExerciseType>("squat");
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const handlePoseResults = useCallback(
    (results: Results) => {
      if (!isActive) return;

      // Check exercise form
      const formFeedback = checkExerciseForm(exercise, results);
      setFeedback(formFeedback);

      // Update rep count for squat and pushup
      if (exercise === "squat" || exercise === "pushup") {
        const counter = repCounters[exercise];
        const landmarks = results.poseLandmarks;

        if (landmarks && formFeedback.details) {
          const angle = formFeedback.details.kneeAngle || formFeedback.details.elbowAngle;
          if (angle) {
            counter.updateFromAngle(angle);
            setRepCount(counter.getCount());
          }
        }
      }
    },
    [exercise, isActive]
  );

  const handleStart = () => {
    setIsActive(true);
    repCounters[exercise].reset();
    setRepCount(0);
    setFeedback(null);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    repCounters[exercise].reset();
    setRepCount(0);
    setFeedback(null);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">🏋️ Live Pose Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Camera */}
            <div className="space-y-4">
              <div className="w-full" style={{ aspectRatio: '9/16' }}>
                <PoseCamera
                  onResults={handlePoseResults}
                  width={720}
                  height={1280}
                  showCanvas={true}
                />
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Select
                  value={exercise}
                  onValueChange={(value) => {
                    setExercise(value as ExerciseType);
                    handleReset();
                  }}
                  disabled={isActive}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="squat">Squat</SelectItem>
                    <SelectItem value="pushup">Push-up</SelectItem>
                    <SelectItem value="plank">Plank</SelectItem>
                  </SelectContent>
                </Select>

                {!isActive ? (
                  <Button onClick={handleStart} className="flex-1">
                    Start Analysis
                  </Button>
                ) : (
                  <Button onClick={handleStop} variant="destructive" className="flex-1">
                    Stop
                  </Button>
                )}

                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </div>

            {/* Right: Feedback */}
            <div>
              <FeedbackPanel
                feedback={feedback}
                repCount={repCount}
                exercise={exercise.charAt(0).toUpperCase() + exercise.slice(1)}
              />
            </div>
          </div>

          {/* Privacy Note - Footer */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              🔒 <strong>Privacy Protected:</strong> All pose detection happens in your browser. No video is sent to any server. GDPR & HIPAA compliant.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

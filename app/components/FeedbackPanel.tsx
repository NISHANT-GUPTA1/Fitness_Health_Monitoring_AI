"use client";

/**
 * FeedbackPanel Component
 * Real-time exercise feedback UI
 */

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackResult } from "@/lib/pose/rules";

interface FeedbackPanelProps {
  feedback: FeedbackResult | null;
  repCount?: number;
  exercise?: string;
}

export default function FeedbackPanel({
  feedback,
  repCount = 0,
  exercise = "Exercise",
}: FeedbackPanelProps) {
  return (
    <div className="space-y-4">
      {/* Rep Counter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{exercise}</span>
            <Badge variant="secondary" className="text-2xl px-4 py-2">
              {repCount} reps
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Form Feedback */}
      {feedback && (
        <Alert variant={feedback.correct ? "default" : "destructive"}>
        <AlertTitle className="text-lg">
          {feedback.correct ? "✅ Good Form" : "⚠️ Form Check"}
        </AlertTitle>
        <AlertDescription className="text-base mt-2">
          {feedback.message}
        </AlertDescription>

        {/* Technical Details */}
        {feedback.details && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-mono">
              {Object.entries(feedback.details).map(([key, value]) => (
                <span key={key} className="mr-4">
                  {key}: <strong>{value}°</strong>
                </span>
              ))}
            </p>
          </div>
        )}
      </Alert>
      )}

      {!feedback && (
        <Alert>
          <AlertTitle>Ready to start</AlertTitle>
          <AlertDescription>Click "Start Analysis" to begin tracking your form</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

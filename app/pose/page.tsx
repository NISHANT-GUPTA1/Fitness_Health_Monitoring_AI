"use client";

/**
 * Pose Estimation Demo Page
 * Showcase MediaPipe integration
 */

import LivePoseAnalysis from "@/app/components/LivePoseAnalysis";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PoseEstimationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <LivePoseAnalysis />
    </main>
  );
}

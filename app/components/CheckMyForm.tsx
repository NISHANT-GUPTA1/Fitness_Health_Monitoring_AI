"use client"

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle } from "lucide-react";

export default function CheckMyForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after a short delay to simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {t("exercise_correction")}
        </CardTitle>
        <CardDescription>
          {t("exercise_correction_description")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="aspect-[16/9] flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading exercise analyzer...</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[16/9] bg-black">
              <iframe 
                src="/exercise-correction/index.html" 
                className="absolute inset-0 w-full h-full border-none"
                title="Exercise Form Analyzer"
                allow="camera; microphone"
              ></iframe>
            </div>
          )}
          
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">How to use the Exercise Analyzer</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Getting Started:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Allow camera access when prompted</li>
                  <li>Stand 6-8 feet back from your camera</li>
                  <li>Select your exercise using the buttons at the bottom</li>
                  <li>Start performing the exercise</li>
                </ol>
                
                <h3 className="font-semibold text-lg mt-4">Supported Exercises:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="font-medium">Squat</span> - Stand with feet shoulder-width apart</li>
                  <li><span className="font-medium">Push-up</span> - Ensure your full body is visible</li>
                  <li><span className="font-medium">Bicep Curl</span> - Keep elbows close to your body</li>
                  <li><span className="font-medium">Plank</span> - Position camera to see your side profile</li>
                  <li><span className="font-medium">Lunge</span> - Ensure both legs are visible</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Reading the Feedback:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="text-green-500 font-medium">Green text</span> - Good form</li>
                  <li><span className="text-red-500 font-medium">Red text</span> - Form needs correction</li>
                  <li><span className="text-yellow-500 font-medium">Yellow text</span> - Getting into position</li>
                </ul>
                
                <h3 className="font-semibold text-lg mt-4">Keyboard Shortcuts:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="font-mono">1</span> - Focus on Squat detection</li>
                  <li><span className="font-mono">2</span> - Focus on Push-up detection</li>
                  <li><span className="font-mono">3</span> - Focus on Bicep Curl detection</li>
                  <li><span className="font-mono">4</span> - Focus on Plank detection</li>
                  <li><span className="font-mono">0</span> - Detect all exercises</li>
                  <li><span className="font-mono">D</span> - Toggle debug mode</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-lg">Tips for Best Results:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Wear form-fitting clothes for better tracking</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Ensure your entire body is visible in the camera</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Use good lighting conditions</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Perform exercises slowly and with control</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Make sure you have enough space to move safely</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Position camera to see your full body from the side for certain exercises</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Privacy Note:</h3>
              <p className="text-gray-700 dark:text-gray-300">
                All processing happens directly in your browser. No video data is sent to any server. 
                The AI model runs locally on your device to analyze your form.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

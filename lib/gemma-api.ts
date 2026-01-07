// API endpoints for AI completions
const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const OPENROUTER_API_ENDPOINT = "/api/openrouter"; // Using our local API route to avoid CORS issues

// API keys from environment variables
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";

// Flag to determine if API key is available
const API_KEY_AVAILABLE = !!(OPENROUTER_API_KEY || OPENAI_API_KEY);

// Flag to switch between API providers
const USE_OPENAI = process.env.NEXT_PUBLIC_USE_OPENAI === "true" && OPENAI_API_KEY;

/**
 * Function to generate response from AI model using fetch API
 * @param prompt The prompt to send to the model
 * @returns The model's response text
 */
export async function generateGemmaResponse(prompt: string, maxRetries = 2): Promise<string> {
  // Check if API key is available
  if (!API_KEY_AVAILABLE) {
    throw new Error("API key is not configured. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your .env.local file.");
  }
  
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      // Check if API endpoints are available
      const apiEndpoint = USE_OPENAI ? OPENAI_API_ENDPOINT : OPENROUTER_API_ENDPOINT;
      const apiKey = USE_OPENAI ? OPENAI_API_KEY : ""; // API key is stored in our API route
      
      if (USE_OPENAI && !apiKey) {
        throw new Error("OpenAI API key is missing. Please set the appropriate environment variable.");
      }
      
      // Use Qwen3 Coder - optimized for complex structured generation
      const modelName = USE_OPENAI ? "gpt-4-turbo" : "qwen/qwen3-coder:free";
      
      console.log(`🚀 Sending request to ${USE_OPENAI ? "OpenAI" : "OpenRouter"} API using ${modelName}... (Attempt ${retries + 1}/${maxRetries + 1})`);
      
      // Enhanced system prompt to emphasize JSON structure
      const systemPrompt = `You are an AI fitness assistant that generates detailed workout and diet plans.
Your responses must always be in valid JSON format without any additional text, explanation or markdown formatting.
Focus on providing complete, structured data following exactly the schema requested.
Ensure all JSON keys and values are properly formatted with double quotes.
Never include explanatory text or markdown formatting outside the JSON object.`;
      
      // Log the request being sent (for debugging)
      const requestBody: any = {
        model: modelName,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2, // Lower temperature for more predictable outputs
        max_tokens: 3000 // Optimized for faster responses while maintaining completeness
      };
      
      // Add response format for OpenAI
      if (USE_OPENAI) {
        requestBody.response_format = { type: "json_object" };
      }
      console.log("📤 Request:", JSON.stringify(requestBody, null, 2));
      
      // Build headers for the request
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization for OpenAI (our API route handles OpenRouter auth)
      if (USE_OPENAI) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      console.log("Using API endpoint:", apiEndpoint);
      console.log("Using model:", modelName);
      
      // Set a timeout for the fetch request to avoid hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout for complex plans
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        cache: 'no-store', // Ensure we don't cache API responses
        signal: controller.signal
      });

      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      console.log('📡 Received response with status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error("Failed to parse error response as JSON", errorText);
        }
        console.error("❌ API Error:", response.status, errorData);
        throw new Error(`API responded with status ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("📥 API Response:", JSON.stringify(data, null, 2));
      
      // Handle different API response formats
      if (!data.choices || !data.choices[0]) {
        console.error("❌ Invalid response format:", data);
        throw new Error("API response did not contain expected choices");
      }
      
      // Handle both OpenAI and Claude/OpenRouter response formats
      let content = "";
      if (data.choices[0].message && data.choices[0].message.content) {
        // OpenAI format
        content = data.choices[0].message.content;
      } else if (data.choices[0].text) {
        // Claude/Anthropic format via OpenRouter
        content = data.choices[0].text;
      } else {
        console.error("❌ Unknown response format:", data.choices[0]);
        throw new Error("API response did not contain expected content structure");
      }
      
      // Check if the content is valid JSON
      try {
        JSON.parse(content.trim());
        console.log("✅ Successfully parsed response as JSON");
        return content;
      } catch (parseError) {
        console.warn("⚠️ Response is not valid JSON, trying to extract JSON...");
        // Let the parseJsonResponse function handle this case
        return content;
      }
      
    } catch (error) {
      retries++;
      console.error(`❌ Error calling ${USE_OPENAI ? "OpenAI" : "OpenRouter"} API (Attempt ${retries}/${maxRetries + 1}):`, error);
      
      if (retries > maxRetries) {
        console.error("❌ API request failed after maximum retries");
        throw new Error(`Failed to generate response after ${maxRetries + 1} attempts: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      console.log(`Retrying in 1 second... (Attempt ${retries + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
  
  throw new Error("Failed to generate response after maximum retries");
}

/**
 * Function to parse JSON from model response
 * Attempts to extract JSON even if the response contains additional text
 * @param response The raw response from the model
 * @param type The type of plan we're parsing (for fallback generation)
 * @returns Parsed JSON object or a fallback if parsing fails
 */
export function parseJsonResponse(response: string, type: string = "general"): any {
  try {
    console.log("Parsing response for type:", type);
    console.log("Response sample:", response.substring(0, 100) + "...");
    
    // Remove markdown code block syntax if present
    let cleanedResponse = response.replace(/```json\s*|\s*```/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*|\s*```/g, '');
    
    // First try to parse the entire cleaned response as JSON
    try {
      const parsed = JSON.parse(cleanedResponse);
      console.log("✅ Successfully parsed complete JSON response");
      return parsed;
    } catch (e) {
      console.log("Initial JSON parse failed, trying to extract JSON content");
    }
    
    // If that fails, try to extract JSON content using regex
    try {
      // Look for content that appears to be JSON (between curly braces)
      const jsonMatch = response.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log("✅ Successfully parsed JSON using regex match");
          return parsed;
        } catch (parseError) {
          console.error("Error parsing extracted JSON:", parseError);
          
          // Try more aggressive JSON extraction - find all text between first { and last }
          const firstBrace = response.indexOf('{');
          const lastBrace = response.lastIndexOf('}');
          
          if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
            const jsonSubstring = response.substring(firstBrace, lastBrace + 1);
            try {
              const parsed = JSON.parse(jsonSubstring);
              console.log("✅ Successfully parsed JSON using brace extraction");
              return parsed;
            } catch (subError) {
              console.error("Error parsing JSON substring:", subError);
              console.log("JSON substring sample:", jsonSubstring.substring(0, 100) + "...");
              
              // Try even more aggressive JSON fixing
              try {
                // Replace common issues that break JSON
                let fixedJson = jsonSubstring
                  .replace(/,\s*}/g, '}')  // Remove trailing commas
                  .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
                  .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')  // Ensure property names are quoted
                  .replace(/:\s*'([^']*)'/g, ':"$1"')  // Replace single quotes with double quotes
                  .replace(/\\'/g, "'")  // Replace escaped single quotes
                  .replace(/\\"/g, '"')  // Replace escaped double quotes
                  .replace(/\n/g, ' ');  // Remove newlines
                
                const parsed = JSON.parse(fixedJson);
                console.log("✅ Successfully parsed JSON after fixing common issues");
                return parsed;
              } catch (fixError) {
                console.error("Error parsing JSON after fixes:", fixError);
              }
            }
          }
        }
      }
    } catch (innerError) {
      console.error("Error extracting JSON from response:", innerError);
    }
    
    console.warn("⚠️ Could not parse JSON from response. Sample:", response.substring(0, 200));
    
    // Final attempt - try to build a minimally valid object based on type
    if (type === "workout") {
      console.log("Attempting to construct minimal workout plan from response text");
      try {
        const dayRegex = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/gi;
        const days = [];
        let match;
        const text = response.toString();
        
        while ((match = dayRegex.exec(text)) !== null) {
          days.push(match[0]);
        }
        
          // If we found some days, construct a minimal plan
        if (days.length > 0) {
          const minimalPlan: any = {
            name: "Basic Fitness Plan",
            difficulty: "Intermediate",
            duration: "1 week",
            totalWorkouts: days.length,
            estimatedCalories: days.length * 300,
            schedule: [],
            _usedFallback: true // Mark as using fallback
          };
          
          // Add unique days to the schedule
          const uniqueDays = [...new Set(days)];
          uniqueDays.forEach(day => {
            minimalPlan.schedule.push({
              day: day,
              type: "General Fitness",
              duration: 45,
              exercises: [
                {name: "Push-ups", sets: 3, reps: "10-12", rest: "60s"},
                {name: "Squats", sets: 3, reps: "15", rest: "60s"},
                {name: "Plank", sets: 3, reps: "30s", rest: "30s"}
              ],
              calories: 300
            });
          });          console.log("✅ Created minimal workout plan from text", minimalPlan);
          return minimalPlan;
        }
      } catch (e) {
        console.error("Failed to create minimal workout plan:", e);
      }
    }
    
    // If parsing fails, throw an error to trigger a retry
    throw new Error("Failed to parse JSON response");
  } catch (finalError) {
    console.error("Error in parseJsonResponse:", finalError);
    throw finalError; // Re-throw to allow retry logic to work
  }
}

/**
 * Returns workout types based on selected fitness goals
 */
function getWorkoutTypesForGoals(goals: string[]): string[] {
  const types = [];
  
  if (goals.includes('weight-loss')) {
    types.push('HIIT', 'Cardio', 'Circuit Training', 'Metabolic Conditioning');
  }
  if (goals.includes('muscle-gain')) {
    types.push('Upper Body Strength', 'Lower Body Strength', 'Push Day', 'Pull Day', 'Hypertrophy Training');
  }
  if (goals.includes('endurance')) {
    types.push('Cardio Endurance', 'Stamina Training', 'Long-Duration Training');
  }
  if (goals.includes('strength')) {
    types.push('Power Training', 'Compound Lifts', 'Strength Focus');
  }
  if (goals.includes('flexibility')) {
    types.push('Mobility Work', 'Dynamic Stretching', 'Yoga Flow');
  }
  if (goals.includes('general-fitness')) {
    types.push('Full Body', 'Functional Training', 'Balanced Workout');
  }
  
  // Ensure we have at least some workout types
  if (types.length === 0) {
    return ['Full Body', 'Cardio', 'Strength', 'Active Recovery'];
  }
  
  return types;
}

/**
 * Returns calorie burn rate based on fitness level
 */
function getFitnessLevelCalories(fitnessLevel: string): number {
  switch(fitnessLevel.toLowerCase()) {
    case 'beginner': return 6;  // calories per minute
    case 'intermediate': return 8;
    case 'advanced': return 10;
    default: return 7;
  }
}

/**
 * Returns guidelines based on fitness goals
 */
function getGoalsGuidelines(goals: string[]): string {
  const guidelines = [];
  
  if (goals.includes('weight-loss')) {
    guidelines.push("Include high-intensity intervals and metabolic conditioning to maximize calorie burn.");
  }
  if (goals.includes('muscle-gain')) {
    guidelines.push("Focus on progressive overload with adequate rest between sets and compound exercises.");
  }
  if (goals.includes('endurance')) {
    guidelines.push("Incorporate longer duration activities with moderate intensity and shorter rest periods.");
  }
  if (goals.includes('strength')) {
    guidelines.push("Prioritize heavy compound movements with longer rest periods and lower rep ranges.");
  }
  if (goals.includes('flexibility')) {
    guidelines.push("Include dynamic and static stretching, mobility work, and flexibility-focused exercises.");
  }
  if (goals.includes('general-fitness')) {
    guidelines.push("Create balanced workouts that address cardio, strength, flexibility and core stability.");
  }
  
  return guidelines.join(" ");
}

/**
 * Returns guidelines based on fitness level
 */
function getFitnessLevelGuidelines(fitnessLevel: string): string {
  switch(fitnessLevel.toLowerCase()) {
    case 'beginner':
      return "Use basic exercise variations, provide longer rest periods (60-90s), focus on form and technique, and use moderate volume (2-3 sets, 10-15 reps).";
    case 'intermediate':
      return "Use standard exercise variations, provide moderate rest periods (45-75s), include some complex movements, and use moderate to high volume (3-4 sets, 8-12 reps).";
    case 'advanced':
      return "Use challenging exercise variations, provide shorter rest periods (30-60s), include complex and compound movements, and use higher volume (4-5 sets, varied rep ranges).";
    default:
      return "Provide exercises appropriate for intermediate fitness level with options to modify.";
  }
}

/**
 * Generate a fallback workout plan when AI response fails
 * @returns A simple workout plan
 */
function generateFallbackWorkoutPlan(
  fitnessLevel = "intermediate", 
  goals = ["general-fitness", "strength"], 
  days = ["monday", "wednesday", "friday"],
  hasDisability = false,
  disabilityType = "",
  disabilityLevel = "moderate",
  specificNeeds = ""
): any {
  console.log("⚠️ Using fallback workout plan with params:", { 
    fitnessLevel, 
    goals, 
    days,
    hasDisability,
    disabilityType,
    disabilityLevel,
    specificNeeds
  });
  
  // Map day IDs to full names for better readability
  const dayMapping: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday", 
    wednesday: "Wednesday", 
    thursday: "Thursday", 
    friday: "Friday", 
    saturday: "Saturday", 
    sunday: "Sunday"
  };
  
  // Create a map for goal-specific workouts
  const goalWorkouts: Record<string, any> = {
    "weight-loss": {
      type: "High-Intensity Cardio",
      exercises: [
        { name: "Jumping Jacks", sets: 3, reps: "30 seconds", rest: "15s" },
        { name: "Mountain Climbers", sets: 3, reps: "30 seconds", rest: "15s" },
        { name: "Burpees", sets: 3, reps: "10-12", rest: "30s" },
        { name: "Jump Squats", sets: 3, reps: "15", rest: "30s" },
        { name: "High Knees", sets: 3, reps: "30 seconds", rest: "20s" }
      ],
      calories: 400
    },
    "muscle-gain": {
      type: "Hypertrophy Training",
      exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Incline Dumbbell Press", sets: 4, reps: "10-12", rest: "90s" },
        { name: "Cable Flyes", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Tricep Pushdowns", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Skull Crushers", sets: 3, reps: "10-12", rest: "60s" }
      ],
      calories: 350
    },
    "strength": {
      type: "Strength Building",
      exercises: [
        { name: "Deadlifts", sets: 5, reps: "5", rest: "180s" },
        { name: "Barbell Squats", sets: 5, reps: "5", rest: "180s" },
        { name: "Bench Press", sets: 5, reps: "5", rest: "180s" },
        { name: "Pull-Ups", sets: 4, reps: "6-8", rest: "120s" },
        { name: "Military Press", sets: 4, reps: "6-8", rest: "120s" }
      ],
      calories: 450
    },
    "endurance": {
      type: "Endurance Training",
      exercises: [
        { name: "Running", sets: 1, reps: "20-30 mins", rest: "0" },
        { name: "Cycling", sets: 1, reps: "15-20 mins", rest: "0" },
        { name: "Jump Rope", sets: 3, reps: "3 mins", rest: "60s" },
        { name: "Circuit Training", sets: 3, reps: "5 mins", rest: "90s" },
        { name: "Swimming", sets: 1, reps: "20 mins", rest: "0" }
      ],
      calories: 500
    },
    "flexibility": {
      type: "Flexibility & Mobility",
      exercises: [
        { name: "Dynamic Stretching", sets: 1, reps: "10 mins", rest: "0" },
        { name: "Yoga Flow", sets: 1, reps: "20 mins", rest: "0" },
        { name: "Static Stretching", sets: 1, reps: "10 mins", rest: "0" },
        { name: "Foam Rolling", sets: 1, reps: "10 mins", rest: "0" }
      ],
      calories: 150
    },
    "general-fitness": {
      type: "Full Body Workout",
      exercises: [
        { name: "Push-ups", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Bodyweight Squats", sets: 3, reps: "15-20", rest: "60s" },
        { name: "Plank", sets: 3, reps: "45-60 seconds", rest: "45s" },
        { name: "Dumbbell Rows", sets: 3, reps: "12 each arm", rest: "60s" },
        { name: "Jumping Jacks", sets: 3, reps: "30 seconds", rest: "30s" }
      ],
      calories: 300
    }
  };
  
  // Create a personalized workout schedule
  const schedule = [];
  
  // Generate full week schedule with rest days
  const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  let dayIndex = 0;
  
  for (const day of allDays) {
    // If this day is in our workout days list
    if (days.includes(day)) {
      // Pick a goal-based workout (rotate through goals)
      const currentGoal = goals[dayIndex % goals.length];
      const workout = goalWorkouts[currentGoal] || goalWorkouts["general-fitness"];
      
      // Adjust for fitness level
      const duration = fitnessLevel === "beginner" ? 30 : fitnessLevel === "intermediate" ? 45 : 60;
      const calorieMultiplier = fitnessLevel === "beginner" ? 0.8 : fitnessLevel === "intermediate" ? 1 : 1.2;
      
      schedule.push({
        day: dayMapping[day],
        type: workout.type,
        duration: duration,
        exercises: workout.exercises.map(ex => ({
          ...ex,
          // Adjust reps based on fitness level
          reps: typeof ex.reps === 'string' && ex.reps.includes('-') 
            ? ex.reps 
            : fitnessLevel === "beginner" 
              ? isNaN(Number(ex.reps)) ? ex.reps : Math.max(8, Math.floor(Number(ex.reps) * 0.7)) 
              : fitnessLevel === "advanced"
                ? isNaN(Number(ex.reps)) ? ex.reps : Math.floor(Number(ex.reps) * 1.2)
                : ex.reps
        })),
        calories: Math.round(workout.calories * calorieMultiplier)
      });
      dayIndex++;
    } else {
      // Rest day
      schedule.push({
        day: dayMapping[day],
        type: "Rest Day",
        duration: 0,
        exercises: [],
        calories: 0
      });
    }
  }
  
  // Calculate total stats
  const totalWorkouts = schedule.filter(day => day.type !== "Rest Day").length;
  const totalCalories = schedule.reduce((sum, day) => sum + day.calories, 0);
  const planDifficulty = fitnessLevel === "beginner" ? "Beginner" : fitnessLevel === "intermediate" ? "Intermediate" : "Advanced";
  
  // Generate plan name based on goals
  const goalNames = goals.map(goal => {
    switch(goal) {
      case "weight-loss": return "Fat Loss";
      case "muscle-gain": return "Muscle Building";
      case "strength": return "Strength";
      case "endurance": return "Endurance";
      case "flexibility": return "Flexibility";
      case "general-fitness": return "Fitness";
      default: return "Custom";
    }
  });
  const planName = `${goalNames.join(' & ')} ${planDifficulty} Plan`;
  
  // Create the base plan object
  const workoutPlan = {
    name: hasDisability ? `Accessible ${planName}` : planName,
    duration: "1 week",
    difficulty: planDifficulty,
    totalWorkouts: totalWorkouts,
    estimatedCalories: totalCalories,
    schedule: schedule,
    goals: goals
  };
  
  // Add accessibility information if needed
  if (hasDisability) {
    // Add general adaptation comments to exercises
    workoutPlan.schedule = workoutPlan.schedule.map(day => {
      // Skip rest days
      if (day.type === "Rest Day" || day.exercises.length === 0) {
        return day;
      }
      
      // Add adaptations to exercises
      const adaptedExercises = day.exercises.map(exercise => {
        let adaptation = "";
        switch(disabilityType.toLowerCase()) {
          case "mobility":
            adaptation = "Perform from seated position if needed. Reduce range of motion as necessary.";
            break;
          case "visual":
            adaptation = "Use tactile markers. Ensure stable positioning. Verbal cues recommended.";
            break;
          case "hearing":
            adaptation = "Use visual demonstrations. Written instructions recommended.";
            break;
          case "cognitive":
            adaptation = "Simplified instructions. Break movement into steps. Visual demonstrations helpful.";
            break;
          default:
            adaptation = "Adapt as needed based on individual capabilities.";
        }
        
        return {
          ...exercise,
          adaptation
        };
      });
      
      return {
        ...day,
        exercises: adaptedExercises
      };
    });
    
    // Add accessibility section to plan
    workoutPlan.accessibility = {
      hasDisability: true,
      disabilityType,
      disabilityLevel,
      adaptations: `This plan has been adapted for ${disabilityType} disability with ${disabilityLevel} severity level.${specificNeeds ? ` Specific needs addressed: ${specificNeeds}` : ''}`
    };
  }
  
  return workoutPlan;
}

/**
 * Converts frequency string to actual number of occurrences
 */
function getFrequencyAmount(frequency: string): number {
  switch(frequency.toLowerCase()) {
    case 'never': return 0;
    case 'rarely': return 2;
    case 'sometimes': return 5;
    case 'often': return 10;
    case 'daily': return 14; // twice a day
    default: return 3;
  }
}

/**
 * Returns detailed description for diet type
 */
function getDietTypeDescription(dietType: string): string {
  switch(dietType.toLowerCase()) {
    case 'veg':
      return "vegetarian diet with eggs and dairy but no meat or fish";
    case 'non-veg':
      return "diet including all food groups with meat, fish, eggs, and dairy";
    case 'vegan':
      return "plant-based diet with no animal products including eggs, dairy, or honey";
    default:
      return "balanced diet";
  }
}

/**
 * Returns dietary guidelines based on diet type
 */
function getDietTypeGuidelines(dietType: string): string {
  switch(dietType.toLowerCase()) {
    case 'veg':
      return "Include dairy, eggs, legumes, tofu, and plant-based protein sources. NO meat, fish, or seafood.";
    case 'non-veg':
      return "Include balanced portions of meat, fish, eggs, dairy, vegetables, fruits, and grains.";
    case 'vegan':
      return "Use ONLY plant-based ingredients. NO animal products including eggs, dairy, honey, or gelatin.";
    default:
      return "Provide a balanced diet with appropriate protein sources.";
  }
}

/**
 * Returns lifestyle-based dietary guidelines
 */
function getLifestyleGuidelines(lifestyle: string): string {
  switch(lifestyle.toLowerCase()) {
    case 'balanced':
      return "Focus on nutritionally balanced meals with moderate calories and balanced macronutrients.";
    case 'junk food':
      return "Incorporate some indulgent options while maintaining overall nutritional balance.";
    case 'salad':
      return "Emphasize vegetable-forward dishes, fresh ingredients, and lighter preparations.";
    case 'sweets':
      return "Include some sweet options while maintaining overall nutritional balance.";
    default:
      return "Provide balanced nutrition appropriate for everyday health maintenance.";
  }
}

/**
 * Generate a fallback diet plan when AI response fails
 * @returns A simple diet plan
 */
function generateFallbackDietPlan(
  dietType = "veg", 
  allergies = "", 
  lifestyle = "balanced",
  junkFoodFreq = "rarely",
  sweetsFreq = "rarely",
  saladFreq = "sometimes",
  hasDisability = false,
  disabilityType = "none",
  disabilityLevel = "moderate",
  mealPreparation = "independent",
  specificNeeds = ""
): any {
  console.log("⚠️ Using fallback diet plan with params:", { 
    dietType, allergies, lifestyle, junkFoodFreq, sweetsFreq, saladFreq,
    hasDisability, disabilityType, disabilityLevel, mealPreparation, specificNeeds
  });
  
  // Parse allergies into array for filtering
  const allergyList = allergies
    .toLowerCase()
    .split(",")
    .map(a => a.trim())
    .filter(a => a.length > 0);
  
  // Set up diet type meals
  const dietMeals: Record<string, Record<string, string[]>> = {
    "veg": {
      breakfast: [
        "Greek yogurt parfait with granola and berries",
        "Protein oatmeal with banana and peanut butter",
        "Vegetable omelet with whole grain toast",
        "Smoothie bowl with spinach, banana, and protein powder",
        "Avocado toast with poached eggs"
      ],
      lunch: [
        "Lentil and vegetable soup with whole grain bread",
        "Chickpea salad with feta cheese and olive oil",
        "Black bean and sweet potato burrito bowl",
        "Caprese sandwich with mozzarella and tomato",
        "Quinoa bowl with roasted vegetables and halloumi"
      ],
      dinner: [
        "Eggplant parmesan with side salad",
        "Tofu stir-fry with mixed vegetables and brown rice",
        "Vegetable lasagna with ricotta cheese",
        "Spinach and feta quiche with roasted potatoes",
        "Bean and cheese enchiladas with Mexican rice"
      ]
    },
    "non-veg": {
      breakfast: [
        "Scrambled eggs with bacon and whole grain toast",
        "Protein pancakes with Greek yogurt and berries",
        "Egg white omelet with turkey and vegetables",
        "Chicken sausage with sweet potato hash",
        "Smoked salmon on bagel with cream cheese"
      ],
      lunch: [
        "Grilled chicken salad with mixed greens",
        "Turkey and avocado wrap with vegetables",
        "Tuna salad sandwich on whole grain bread",
        "Beef and vegetable stir-fry with brown rice",
        "Chicken Caesar salad with whole grain croutons"
      ],
      dinner: [
        "Baked salmon with roasted vegetables and quinoa",
        "Lean steak with sweet potato and asparagus",
        "Chicken fajitas with peppers and onions",
        "Turkey meatballs with whole wheat pasta",
        "Shrimp and vegetable curry with brown rice"
      ]
    },
    "vegan": {
      breakfast: [
        "Tofu scramble with vegetables and whole grain toast",
        "Overnight oats with almond milk and chia seeds",
        "Avocado toast with nutritional yeast and hemp seeds",
        "Smoothie with plant protein, banana, and spinach",
        "Quinoa breakfast bowl with fruit and nuts"
      ],
      lunch: [
        "Lentil soup with whole grain bread",
        "Chickpea and vegetable Buddha bowl",
        "Tempeh and vegetable wrap with hummus",
        "Mixed bean salad with olive oil dressing",
        "Tofu and vegetable stir-fry with brown rice"
      ],
      dinner: [
        "Vegan chili with mixed beans and vegetables",
        "Cauliflower and chickpea curry with brown rice",
        "Portobello mushroom burgers with sweet potato fries",
        "Vegetable and tofu pad thai with rice noodles",
        "Quinoa stuffed bell peppers with black beans"
      ]
    }
  };
  
  // Special diet additions based on preferences
  const junkFood = [
    "Pizza with vegetables and cheese",
    "Veggie burger with fries",
    "Mac and cheese with broccoli",
    "Bean and cheese nachos",
    "Falafel wrap with tahini sauce"
  ];
  
  const sweets = [
    "Dark chocolate squares",
    "Greek yogurt with honey",
    "Fruit sorbet",
    "Protein cookies",
    "Chia seed pudding with berries"
  ];
  
  const salads = [
    "Greek salad with feta and olives",
    "Quinoa tabbouleh salad",
    "Mixed green salad with balsamic vinaigrette",
    "Spinach and strawberry salad",
    "Kale Caesar salad"
  ];
  
  // Filter out any allergies
  const filterAllergies = (meal: string): boolean => {
    if (allergyList.length === 0) return true;
    return !allergyList.some(allergy => meal.toLowerCase().includes(allergy));
  };
  
  // Determine daily calories based on diet type
  let dailyCalories: number;
  switch (dietType) {
    case "vegan":
      dailyCalories = 2400;
      break;
    case "non-veg":
      dailyCalories = 2600;
      break;
    case "veg":
    default:
      dailyCalories = 2300;
      break;
  }
  
  // Create meal plan for each day
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const mealPlan: Record<string, Record<string, string>> = {};
  
  // Apply disability-specific adaptations
      const adaptMealForDisability = (meal: string, mealType: string): string => {
    if (!hasDisability) return meal;
    
    // Create adaptation notes based on disability level and meal preparation needs
    const levelNote = disabilityLevel === "mild" ? "minimal adaptation" : 
                      disabilityLevel === "severe" ? "significant adaptation" : 
                      "moderate adaptation";
                      
    const prepNote = mealPreparation === "independent" ? "independent preparation" :
                     mealPreparation === "full-assistance" ? "requires full assistance" :
                     "requires some assistance";
    
    switch (disabilityType.toLowerCase()) {
      case 'mobility':
        return `${meal} (${levelNote}, ${mealType === 'breakfast' ? 'minimal handling required' : 
                         mealType === 'lunch' ? 'pre-cut ingredients recommended' : 
                         'consider ready-made options'}, ${prepNote})`;
      case 'visual':
        return `${meal} (${levelNote}, ${mealType === 'breakfast' ? 'distinct textures for identification' : 
                        mealType === 'lunch' ? 'simple components with different textures' : 
                        'easy to identify by touch and smell'}, ${prepNote})`;
      case 'cognitive':
        return `${meal} (${levelNote}, ${mealType === 'breakfast' ? 'simple preparation' : 
                        mealType === 'lunch' ? 'straightforward assembly' : 
                        'easy-to-follow preparation steps'}, ${prepNote})`;
      case 'other':
        return specificNeeds ? `${meal} (${levelNote}, adapted for: ${specificNeeds}, ${prepNote})` : 
                               `${meal} (${levelNote}, adapted preparation, ${prepNote})`;
      default:
        return meal;
    }
  };  days.forEach(day => {
    // Get filtered meals for current diet type
    const dietOptions = dietMeals[dietType] || dietMeals["veg"];
    const filteredBreakfast = dietOptions.breakfast.filter(filterAllergies);
    const filteredLunch = dietOptions.lunch.filter(filterAllergies);
    const filteredDinner = dietOptions.dinner.filter(filterAllergies);
    
    // Select random meals
    let breakfast = filteredBreakfast[Math.floor(Math.random() * filteredBreakfast.length)];
    let lunch = filteredLunch[Math.floor(Math.random() * filteredLunch.length)];
    let dinner = filteredDinner[Math.floor(Math.random() * filteredDinner.length)];
    
    // Add preferences based on frequency
    if (saladFreq === "often" || saladFreq === "daily" || 
        (saladFreq === "sometimes" && Math.random() > 0.6)) {
      // Add salad to lunch
      const filteredSalads = salads.filter(filterAllergies);
      if (filteredSalads.length > 0) {
        lunch = filteredSalads[Math.floor(Math.random() * filteredSalads.length)];
      }
    }
    
    if (junkFoodFreq === "often" || junkFoodFreq === "daily" || 
        (junkFoodFreq === "sometimes" && Math.random() > 0.7)) {
      // Add junk food to dinner occasionally
      const filteredJunk = junkFood.filter(filterAllergies);
      if (filteredJunk.length > 0) {
        dinner = filteredJunk[Math.floor(Math.random() * filteredJunk.length)];
      }
    }
    
    if (sweetsFreq === "often" || sweetsFreq === "daily" || 
        (sweetsFreq === "sometimes" && Math.random() > 0.7)) {
      // Add something sweet
      const filteredSweets = sweets.filter(filterAllergies);
      if (filteredSweets.length > 0) {
        const sweet = filteredSweets[Math.floor(Math.random() * filteredSweets.length)];
        // Add as dessert to dinner
        dinner = `${dinner} with ${sweet}`;
      }
    }
    
    // Apply disability adaptations if needed
    if (hasDisability) {
      breakfast = adaptMealForDisability(breakfast, 'breakfast');
      lunch = adaptMealForDisability(lunch, 'lunch');
      dinner = adaptMealForDisability(dinner, 'dinner');
    }
    
    mealPlan[day] = {
      breakfast,
      lunch,
      dinner
    };
  });
  
  // Generate diet plan name based on type and lifestyle
  let dietName: string;
  switch (lifestyle) {
    case "junk food":
      dietName = "Flexible ";
      break;
    case "salad":
      dietName = "Fresh & Healthy ";
      break;
    case "sweets":
      dietName = "Balanced Sweet Tooth ";
      break;
    default:
      dietName = "Balanced ";
  }
  
  switch (dietType) {
    case "vegan":
      dietName += "Plant-Based Nutrition Plan";
      break;
    case "non-veg":
      dietName += "Protein-Rich Nutrition Plan";
      break;
    case "veg":
    default:
      dietName += "Vegetarian Nutrition Plan";
  }
  
  // Calculate macros based on diet type
  let macros: Record<string, string>;
  switch (dietType) {
    case "vegan":
      macros = {
        protein: "20%",
        carbs: "55%",
        fat: "25%"
      };
      break;
    case "non-veg":
      macros = {
        protein: "35%",
        carbs: "40%",
        fat: "25%"
      };
      break;
    case "veg":
    default:
      macros = {
        protein: "25%",
        carbs: "50%",
        fat: "25%"
      };
  }
  
  // Add accessibility information if disability is specified
  const result: any = {
    "name": dietName,
    "type": dietType,
    "dailyCalories": dailyCalories,
    "macroBreakdown": macros,
    "schedule": mealPlan
  };
  
  if (hasDisability) {
    result.accessibilityInfo = {
      hasDisability,
      disabilityType,
      disabilityLevel,
      mealPreparation,
      specificNeeds: specificNeeds || undefined,
      adaptations: `This meal plan has been adapted for ${disabilityType} accessibility needs with ${disabilityLevel} severity level.`
    };
  }
  
  return result;
}

/**
 * Generate a workout plan using the AI model
 * @param goals Selected fitness goals
 * @param fitnessLevel User's fitness level
 * @param workoutDays Selected workout days
 * @param sessionDuration Workout session duration
 * @param hasDisability Whether the user has a disability
 * @param disabilityType Type of disability if applicable
 * @param disabilityLevel Level of disability severity if applicable
 * @param specificNeeds Specific needs or accommodations if applicable
 * @returns Generated workout plan as a JSON object
 */
export async function generateWorkoutPlan(
  goals: string[],
  fitnessLevel: string,
  workoutDays: string[],
  sessionDuration: string,
  hasDisability: boolean = false,
  disabilityType: string = "",
  disabilityLevel: string = "moderate",
  specificNeeds: string = ""
): Promise<any> {
  try {
    console.log("🏋️ Generating workout plan for:", { 
      goals, 
      fitnessLevel, 
      workoutDays, 
      sessionDuration,
      hasDisability,
      disabilityType: hasDisability ? disabilityType : "none",
      disabilityLevel: hasDisability ? disabilityLevel : "none",
      specificNeeds: hasDisability ? specificNeeds : ""
    });
    
    // Check if we're using mock responses or had connectivity issues
    if (USE_MOCK_RESPONSES || API_CONNECTION_FAILED) {
      console.log("Using enhanced fallback workout plan with actual parameters");
      // Generate a fallback plan with the actual parameters for a better experience
      return generateFallbackWorkoutPlan(
        fitnessLevel, 
        goals, 
        workoutDays,
        hasDisability,
        disabilityType,
        disabilityLevel,
        specificNeeds
      );
    }
    
    // Get session duration in minutes
    let durationMinutes = 45; // Default to 45 minutes
    if (sessionDuration === "15-30") {
      durationMinutes = 30;
    } else if (sessionDuration === "30-45") {
      durationMinutes = 45;
    } else if (sessionDuration === "45-60") {
      durationMinutes = 60;
    } else if (sessionDuration === "60+") {
      durationMinutes = 75;
    }
    
    // Create array of day names that match the selected workout days
    const selectedDays = workoutDays.map(day => {
      const capitalized = day.charAt(0).toUpperCase() + day.slice(1);
      return capitalized;
    });
    
    // Generate workout types based on goals
    const workoutTypes = getWorkoutTypesForGoals(goals);
    
    // Calculate appropriate calories and intensity based on fitness level
    const caloriesPerMin = getFitnessLevelCalories(fitnessLevel);
    
    const prompt = `Create a personalized workout plan as JSON for these parameters:
- Goals: ${goals.join(", ")}
- Fitness level: ${fitnessLevel}
- Workout days: ${selectedDays.join(", ")}
- Session duration: ${durationMinutes} minutes
${hasDisability ? `- Has disability: Yes
- Disability type: ${disabilityType}
- Disability level: ${disabilityLevel}
- Specific needs: ${specificNeeds || "No specific needs mentioned"}` : ''}

IMPORTANT GUIDELINES:
1. For goals "${goals.join(", ")}":
   ${getGoalsGuidelines(goals)}
   
2. For fitness level "${fitnessLevel}":
   ${getFitnessLevelGuidelines(fitnessLevel)}

${hasDisability ? `3. For disability accommodations:
   - Adapt exercises to be accessible for ${disabilityType} disability with ${disabilityLevel} severity
   - Prioritize safety and proper form over intensity
   - Include alternative exercise options when needed
   - ${specificNeeds ? `Address these specific needs: ${specificNeeds}` : 'Provide general adaptations appropriate for this disability type'}
   - Ensure rest periods are appropriate for the disability level
` : ''}

${hasDisability ? '4' : '3'}. Create a progressive plan where:
   - Different days focus on different muscle groups/fitness aspects
   - Each workout includes warm-up, main exercises, and cool-down components
   - Exercises are appropriate and safe for the specified fitness level${hasDisability ? ' and disability type' : ''}
   - There's variety across the week to target all aspects of the specified goals
   - Rest periods are appropriate for the fitness level (longer for beginners, shorter for advanced)${hasDisability ? ' and disability considerations' : ''}

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "name": "MEANINGFUL_NAME_THAT_REFLECTS_GOALS_AND_LEVEL${hasDisability ? '_AND_ACCESSIBILITY' : ''}",
  "difficulty": "${fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1)}",
  "duration": "1 week",
  "totalWorkouts": ${selectedDays.length},
  "estimatedCalories": NUMBER_BETWEEN_${durationMinutes * caloriesPerMin * selectedDays.length - 200}_AND_${durationMinutes * caloriesPerMin * selectedDays.length + 200},
  ${hasDisability ? `"accessibility": {
    "hasDisability": true,
    "disabilityType": "${disabilityType}",
    "disabilityLevel": "${disabilityLevel}",
    "adaptations": "BRIEF_SUMMARY_OF_HOW_THE_PLAN_IS_ADAPTED"
  },` : ''}
  "schedule": [
    ${selectedDays.map((day, index) => `{
      "day": "${day}",
      "type": "${workoutTypes[index % workoutTypes.length] || "Full Body"}",
      "duration": ${durationMinutes},
      "exercises": [
        {"name": "SPECIFIC_EXERCISE_NAME", "sets": NUMBER, "reps": "SPECIFIC_REPS_OR_DURATION", "rest": "SPECIFIC_REST_PERIOD"${hasDisability ? ', "adaptation": "SPECIFIC_ADAPTATION_FOR_THIS_EXERCISE"' : ''}}
        // Include 4-6 exercises per workout day with specific details
      ],
      "calories": NUMBER_BETWEEN_${durationMinutes * caloriesPerMin - 50}_AND_${durationMinutes * caloriesPerMin + 50}
    }`).join(',\n    ')}
  ]
}

For each day, provide 4-6 specific exercises (not generic ones like "cardio") with appropriate sets, reps, and rest periods.
Use specific exercise names (e.g., "Barbell Back Squats" instead of just "Squats").
Specify exact rep ranges (e.g., "8-10" or "30 seconds") and rest periods (e.g., "60s" or "90s").
Do NOT include any explanations, comments, or text outside the JSON structure.
Ensure the JSON is valid and properly formatted with all keys and values using double quotes where needed.`;

    // Make up to 3 attempts to get a valid workout plan
    const response = await generateGemmaResponse(prompt, 2);
    const result = parseJsonResponse(response, "workout");
    
    // Add additional validation to ensure schedule structure is correct
    if (result) {
      // Transform old format to new format if needed
      if (result.schedule && !Array.isArray(result.schedule)) {
        console.log("Converting old schedule format to new format");
        const oldSchedule = result.schedule;
        result.schedule = [];
        
        for (const day in oldSchedule) {
          const dayData = oldSchedule[day];
          result.schedule.push({
            day: day,
            type: dayData.focus || "General",
            duration: durationMinutes,
            exercises: dayData.exercises || [],
            calories: Math.floor(durationMinutes * 7)
          });
        }
      }
      
      // Set fallback name if missing
      if (!result.name) {
        result.name = `${goals.join(" & ")} ${hasDisability ? "Accessible " : ""}Workout Plan`;
      }
      
      // Set fallback difficulty if missing
      if (!result.difficulty) {
        result.difficulty = fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1);
      }
      
      // Ensure we have an array for schedule
      if (!result.schedule) {
        result.schedule = [];
      }
      
      // Add accessibility information if missing but needed
      if (hasDisability && !result.accessibility) {
        result.accessibility = {
          hasDisability: true,
          disabilityType: disabilityType,
          disabilityLevel: disabilityLevel,
          adaptations: `Adaptations for ${disabilityType} disability with ${disabilityLevel} severity level.${specificNeeds ? ` Addressing specific needs: ${specificNeeds}` : ''}`
        };
      }
      
      // Ensure each selected day has an entry in the schedule
      const scheduledDays = result.schedule.map((day: any) => day.day);
      
      for (const day of selectedDays) {
        if (!scheduledDays.includes(day)) {
          console.warn(`Schedule missing day: ${day}, adding default`);
          const focusArea = goals.length > 0 ? 
            goals[0].charAt(0).toUpperCase() + goals[0].slice(1).replace("-", " ") : 
            "General Fitness";
          
          result.schedule.push({
            day: day,
            type: focusArea,
            duration: durationMinutes,
            exercises: [
              {name: "Push-ups", sets: 3, reps: "10-12", rest: "60s"},
              {name: "Squats", sets: 3, reps: "15", rest: "60s"},
              {name: "Plank", sets: 3, reps: "30s", rest: "30s"}
            ],
            calories: Math.floor(durationMinutes * 7)
          });
        }
      }
      
      // Make sure all required fields are there for each day
      result.schedule = result.schedule.map((day: any) => ({
        day: day.day || "Unknown",
        type: day.type || day.focus || "General",
        duration: day.duration || durationMinutes,
        exercises: Array.isArray(day.exercises) ? day.exercises : [],
        calories: day.calories || Math.floor(durationMinutes * 7)
      }));
    }
    
    return result;
  } catch (error) {
    console.error("Failed to generate workout plan:", error);
    return generateFallbackWorkoutPlan(
      fitnessLevel, 
      goals, 
      workoutDays,
      hasDisability,
      disabilityType,
      disabilityLevel,
      specificNeeds
    );
  }
}

/**
 * Generate a diet plan using the AI model
 * @param dietType Type of diet (veg, non-veg, vegan)
 * @param allergies User's food allergies
 * @param lifestyle User's lifestyle
 * @param junkFoodFreq Junk food frequency
 * @param sweetsFreq Sweets frequency
 * @param saladFreq Salad frequency
 * @returns Generated diet plan as a JSON object
 */
export async function generateDietPlan(
  dietType: string,
  allergies: string,
  lifestyle: string,
  junkFoodFreq: string,
  sweetsFreq: string,
  saladFreq: string,
  hasDisability: boolean = false,
  disabilityType: string = "none",
  disabilityLevel: string = "moderate",
  mealPreparation: string = "independent",
  specificNeeds: string = ""
): Promise<any> {
  try {
    console.log("🥗 Generating diet plan for:", { dietType, allergies, lifestyle, junkFoodFreq, sweetsFreq, saladFreq, hasDisability, disabilityType, disabilityLevel, mealPreparation, specificNeeds });
    
    // Check if we're using mock responses or had connectivity issues
    if (USE_MOCK_RESPONSES || API_CONNECTION_FAILED) {
      console.log("Using enhanced fallback diet plan with actual parameters");
      // Generate a fallback plan with the actual parameters for a better experience
      return generateFallbackDietPlan(
        dietType, 
        allergies, 
        lifestyle, 
        junkFoodFreq, 
        sweetsFreq, 
        saladFreq, 
        hasDisability, 
        disabilityType, 
        disabilityLevel,
        mealPreparation, 
        specificNeeds
      );
    }
    
    // Process allergies to create a clean list
    const allergyList = allergies 
      ? allergies.split(',').map(a => a.trim()).filter(Boolean).join(', ')
      : "None";
    
    // Determine meal frequency preferences more precisely
    const junkFoodAmount = getFrequencyAmount(junkFoodFreq);
    const sweetsAmount = getFrequencyAmount(sweetsFreq);
    const saladAmount = getFrequencyAmount(saladFreq);
    
    const prompt = `Create a personalized weekly diet plan as JSON for:
- Diet type: ${dietType} (${getDietTypeDescription(dietType)})
- Allergies: ${allergyList}
- Lifestyle: ${lifestyle}
- Junk food frequency: ${junkFoodFreq}
- Sweets frequency: ${sweetsFreq}
- Salad frequency: ${saladFreq}
${hasDisability ? `- Has disability: Yes
- Disability type: ${disabilityType}
- Disability level: ${disabilityLevel}
- Meal preparation capability: ${mealPreparation}
- Specific needs: ${specificNeeds || "No specific needs mentioned"}` : ''}

IMPORTANT GUIDELINES:
1. For diet type "${dietType}":
   ${getDietTypeGuidelines(dietType)}
   
2. AVOID ALL THESE ALLERGENS: ${allergyList !== "None" ? allergyList.toUpperCase() : "No allergies specified"}
   Ensure no meal contains these ingredients, not even in small amounts.

3. Lifestyle "${lifestyle}":
   ${getLifestyleGuidelines(lifestyle)}
   
${hasDisability ? `4. Disability Accommodations:
   This person has a ${disabilityType} disability with ${disabilityLevel} severity level. 
   Their meal preparation capability is: ${mealPreparation}.${specificNeeds ? ` They mentioned: "${specificNeeds}"` : ''}
   Make the meal plan accessible by:
   - For mobility disability: Focus on easy-to-prepare meals with minimal handling.
   - For visual disability: Include foods with distinct textures and meals that are easy to identify without sight.
   - For hearing disability: Standard meal plan is fine.
   - For cognitive disability: Simple, structured meals with fewer ingredients and clear preparation steps.
   - For other disabilities: Adapt based on specific needs mentioned.
   - Include notes about accessibility in each meal suggestion.` : ''}

${hasDisability ? '5' : '4'}. Include EXACTLY ${junkFoodAmount} junk food meals across the week.
   Include EXACTLY ${sweetsAmount} sweet items or desserts across the week.
   Include EXACTLY ${saladAmount} salad or raw vegetable dishes across the week.
   Distribute these according to preference frequency.

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "Monday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL"},
  "Tuesday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL"},
  "Wednesday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL"},
  "Thursday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL"},
  "Friday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL"},
  "Saturday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL"},
  "Sunday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL"}
}

Each meal must be a specific, descriptive meal (not just "balanced breakfast") and should include main ingredients.
Provide varied meals throughout the week - don't repeat the same meals.
Do NOT include any explanations, comments, or text outside the JSON structure.
Ensure the JSON is valid and properly formatted with all keys and values in double quotes.`;

    // Make up to 3 attempts to get a valid diet plan
    const response = await generateGemmaResponse(prompt, 2);
    let result;
    
    try {
      // First try the parseJsonResponse function
      result = parseJsonResponse(response, "diet");
      
      // Additional check to ensure we got a proper result
      if (!result || Object.keys(result).length === 0) {
        throw new Error("Invalid diet plan format");
      }
      
      // If we did, validate it
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      let missingDays = false;
      
      for (const day of days) {
        if (!result[day]) {
          console.warn(`Diet plan missing day: ${day}, adding default`);
          missingDays = true;
          result[day] = {
            breakfast: dietType === "vegan" ? "Oatmeal with fruits and nuts" : 
                      dietType === "veg" ? "Whole grain toast with avocado and eggs" : 
                      "Protein smoothie with Greek yogurt",
            lunch: dietType === "vegan" ? "Quinoa bowl with roasted vegetables" : 
                  dietType === "veg" ? "Mediterranean salad with feta cheese" : 
                  "Grilled chicken salad with mixed greens",
            dinner: dietType === "vegan" ? "Lentil curry with brown rice" : 
                   dietType === "veg" ? "Vegetable stir-fry with tofu" : 
                   "Baked salmon with roasted vegetables"
          };
        } else {
          // Ensure each day has all meal types
          const meals = ["breakfast", "lunch", "dinner"];
          for (const meal of meals) {
            if (!result[day][meal]) {
              console.warn(`Diet plan missing ${meal} for ${day}, adding default`);
              missingDays = true;
              
              if (meal === "breakfast") {
                result[day][meal] = dietType === "vegan" ? "Oatmeal with fruits and nuts" : 
                                  dietType === "veg" ? "Whole grain toast with avocado" : 
                                  "Protein smoothie with Greek yogurt";
              } else if (meal === "lunch") {
                result[day][meal] = dietType === "vegan" ? "Quinoa bowl with vegetables" : 
                                  dietType === "veg" ? "Mediterranean salad" : 
                                  "Grilled chicken salad";
              } else {
                result[day][meal] = dietType === "vegan" ? "Lentil curry with rice" : 
                                  dietType === "veg" ? "Vegetable stir-fry" : 
                                  "Baked fish with vegetables";
              }
            }
          }
        }
      }
      
      // Flag that we had to use fallbacks if needed
      if (missingDays) {
        console.warn("⚠️ Diet plan had missing days or meals, added defaults");
        result._usedFallback = true;
      }
      
    } catch (parseError) {
      console.error("Error parsing diet plan:", parseError);
      result = generateFallbackDietPlan();
      result._usedFallback = true;
    }
    
    return result;
  } catch (error) {
    console.error("Failed to generate diet plan:", error);
    const fallback = generateFallbackDietPlan();
    fallback._usedFallback = true;
    return fallback;
  }
}

/**
 * Generate a combined workout and diet plan using the AI model
 * @param goals Selected fitness goals
 * @param fitnessLevel User's fitness level
 * @param workoutDays Selected workout days
 * @param sessionDuration Workout session duration
 * @param dietType Type of diet (veg, non-veg, vegan)
 * @param allergies User's food allergies
 * @param lifestyle User's lifestyle
 * @param junkFoodFreq Junk food frequency
 * @param sweetsFreq Sweets frequency
 * @param saladFreq Salad frequency
 * @returns Generated workout and diet plan as a JSON object
 */
/**
 * Generate an adaptive workout plan for people with disabilities
 * @param disabilityType Type of disability (mobility, visual, hearing, etc.)
 * @param mobilityLimitations Specific mobility limitations
 * @param preferredExerciseTypes Preferred types of exercises
 * @param sessionDuration Workout session duration
 * @returns Generated adaptive workout plan as a JSON object
 */
export async function generateAdaptiveWorkoutPlan(
  disabilityType: string,
  mobilityLimitations: string[] = [],
  preferredExerciseTypes: string[] = [],
  sessionDuration: string = "30-45"
): Promise<any> {
  try {
    console.log("♿ Generating adaptive workout plan for:", { disabilityType, mobilityLimitations, preferredExerciseTypes, sessionDuration });
    
    // Check if we're using mock responses or had connectivity issues
    if (USE_MOCK_RESPONSES || API_CONNECTION_FAILED) {
      console.log("Using fallback adaptive workout plan");
      return getFallbackAdaptivePlan(disabilityType, mobilityLimitations, preferredExerciseTypes, sessionDuration);
    }
    
    // Get session duration in minutes
    let durationMinutes = 30; // Default to 30 minutes for adaptive workouts
    if (sessionDuration === "15-30") {
      durationMinutes = 20;
    } else if (sessionDuration === "30-45") {
      durationMinutes = 35;
    } else if (sessionDuration === "45-60") {
      durationMinutes = 50;
    } else if (sessionDuration === "60+") {
      durationMinutes = 60;
    }
    
    // Create string from mobility limitations
    const limitationsString = mobilityLimitations.length > 0 
      ? mobilityLimitations.join(", ") 
      : "No specific mobility limitations";
    
    // Create string from preferred exercise types
    const preferredTypesString = preferredExerciseTypes.length > 0
      ? preferredExerciseTypes.join(", ")
      : "Any appropriate exercises";
    
    const prompt = `Create an adaptive workout plan as JSON for a person with the following parameters:
- Disability type: ${disabilityType}
- Mobility limitations: ${limitationsString}
- Preferred exercise types: ${preferredTypesString}
- Session duration: ${durationMinutes} minutes

IMPORTANT GUIDELINES:
1. Create safe, accessible exercises that accommodate the specific disability type and mobility limitations.
2. Include clear instructions on modifications needed for each exercise.
3. Focus on exercises that can be performed safely with the specified disability.
4. Incorporate the preferred exercise types when possible and safe.
5. Include appropriate warm-up and cool-down activities.
6. Ensure rest periods are adequate for recovery.
7. Structure the plan with progressive difficulty within the person's capabilities.

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "name": "DESCRIPTIVE_NAME_FOR_THE_ADAPTIVE_PLAN",
  "disabilityType": "${disabilityType}",
  "sessionDuration": ${durationMinutes},
  "focusAreas": ["FOCUS_AREA_1", "FOCUS_AREA_2", "FOCUS_AREA_3"],
  "safetyNotes": "IMPORTANT_SAFETY_INFORMATION_FOR_THIS_DISABILITY_TYPE",
  "equipment": ["REQUIRED_EQUIPMENT_1", "REQUIRED_EQUIPMENT_2"],
  "sections": {
    "warmUp": [
      {
        "name": "EXERCISE_NAME",
        "description": "DETAILED_DESCRIPTION_WITH_ADAPTATIONS",
        "duration": "TIME_IN_MINUTES_OR_REPETITIONS",
        "adaptations": "SPECIFIC_ADAPTATIONS_FOR_THIS_DISABILITY"
      }
    ],
    "mainExercises": [
      {
        "name": "EXERCISE_NAME",
        "description": "DETAILED_DESCRIPTION_WITH_ADAPTATIONS",
        "sets": NUMBER,
        "reps": "REPETITIONS_OR_DURATION",
        "rest": "REST_TIME_BETWEEN_SETS",
        "adaptations": "SPECIFIC_ADAPTATIONS_FOR_THIS_DISABILITY",
        "alternatives": "ALTERNATIVE_VERSIONS_IF_NEEDED"
      }
    ],
    "coolDown": [
      {
        "name": "EXERCISE_NAME",
        "description": "DETAILED_DESCRIPTION_WITH_ADAPTATIONS",
        "duration": "TIME_IN_MINUTES_OR_REPETITIONS",
        "adaptations": "SPECIFIC_ADAPTATIONS_FOR_THIS_DISABILITY"
      }
    ]
  },
  "progressionPath": "GUIDANCE_ON_HOW_TO_PROGRESS_OVER_TIME",
  "additionalResources": ["RESOURCE_1", "RESOURCE_2"]
}

Include 2-3 warm-up exercises, 4-6 main exercises, and 2-3 cool-down exercises.
Each exercise should have clear, specific descriptions with adaptations for the disability type.
Ensure all exercises are safe and appropriate for the specified disability type and limitations.
Do NOT include any explanations, comments, or text outside the JSON structure.
Ensure the JSON is valid and properly formatted with all keys and values using double quotes where needed.`;

    // Make up to 3 attempts to get a valid adaptive workout plan
    const response = await generateGemmaResponse(prompt, 2);
    let result;
    
    try {
      // First try the parseJsonResponse function
      result = parseJsonResponse(response, "adaptive");
      
      // Additional check to ensure we got a proper result
      if (!result) {
        throw new Error("Failed to parse adaptive plan - no result returned");
      }
      
      // Validate essential fields
      if (!result.name || !result.sections) {
        console.warn("⚠️ Adaptive plan missing essential fields");
        return getFallbackAdaptivePlan(disabilityType, mobilityLimitations, preferredExerciseTypes, sessionDuration);
      }
      
      return result;
    } catch (parseError) {
      console.error("Error parsing adaptive plan:", parseError);
      return getFallbackAdaptivePlan(disabilityType, mobilityLimitations, preferredExerciseTypes, sessionDuration);
    }
  } catch (error) {
    console.error("Failed to generate adaptive workout plan:", error);
    return getFallbackAdaptivePlan(disabilityType, mobilityLimitations, preferredExerciseTypes, sessionDuration);
  }
}

/**
 * Returns a fallback adaptive workout plan when API calls fail
 */
function getFallbackAdaptivePlan(
  disabilityType: string, 
  mobilityLimitations: string[] = [], 
  preferredExerciseTypes: string[] = [],
  sessionDuration: string = "30-45"
): any {
  console.log("⚠️ Using fallback adaptive workout plan for:", disabilityType);
  
  // Pre-defined plans for different disability types
  const examplePlans: Record<string, any> = {
    "mobility": {
      name: "Seated Strength & Mobility Plan",
      disabilityType: "mobility",
      sessionDuration: 30,
      focusAreas: ["Upper Body Strength", "Core Stability", "Flexibility"],
      safetyNotes: "Ensure proper seating support. Avoid movements that cause pain. Use straps or adaptive equipment as needed. Have a spotter nearby if balance is a concern.",
      equipment: ["Chair with armrests", "Resistance bands", "Light dumbbells (optional)", "Cushion"],
      sections: {
        warmUp: [
          {
            name: "Seated Arm Circles",
            description: "While seated with good posture, extend arms to sides and make small circles, gradually increasing size.",
            duration: "2 minutes",
            adaptations: "If shoulder mobility is limited, reduce range of motion to a comfortable level."
          },
          {
            name: "Seated Neck Stretches",
            description: "Gently tilt head side to side, then forward and back, holding each position briefly.",
            duration: "2 minutes",
            adaptations: "Move slowly and within pain-free range."
          },
          {
            name: "Seated Torso Rotations",
            description: "Place hands on shoulders and gently rotate upper body from side to side.",
            duration: "2 minutes",
            adaptations: "Use chair armrests for support if needed."
          }
        ],
        mainExercises: [
          {
            name: "Seated Shoulder Press",
            description: "Using light weights or resistance bands, press arms upward and return slowly.",
            sets: 3,
            reps: "10-12",
            rest: "60 seconds",
            adaptations: "Use lighter weights or no weights if necessary.",
            alternatives: "Can be done one arm at a time if needed."
          },
          {
            name: "Seated Rows with Resistance Band",
            description: "Secure band in front of you and pull back, squeezing shoulder blades together.",
            sets: 3,
            reps: "12-15",
            rest: "60 seconds",
            adaptations: "Adjust resistance band tension as needed.",
            alternatives: "Can use light dumbbells pulled toward hips."
          },
          {
            name: "Seated Bicep Curls",
            description: "Using resistance bands or light weights, curl arms upward with controlled movement.",
            sets: 3,
            reps: "12-15",
            rest: "60 seconds",
            adaptations: "Can be done alternating arms or both together.",
            alternatives: "Use household items as weights if needed."
          },
          {
            name: "Seated Core Activation",
            description: "Sit tall and engage core muscles, holding for 10 seconds then releasing.",
            sets: 3,
            reps: "10 holds",
            rest: "30 seconds",
            adaptations: "Focus on breathing while maintaining good posture.",
            alternatives: "Can add small torso movements once comfortable."
          },
          {
            name: "Seated Leg Lifts",
            description: "If possible, extend leg straight out and hold briefly before lowering.",
            sets: 3,
            reps: "8-10 each side",
            rest: "60 seconds",
            adaptations: "For limited leg mobility, focus on isometric contractions.",
            alternatives: "Can place hand under thigh to assist if needed."
          }
        ],
        coolDown: [
          {
            name: "Deep Breathing",
            description: "Take slow, deep breaths focusing on expanding the diaphragm.",
            duration: "2 minutes",
            adaptations: "Focus on lengthening the exhale."
          },
          {
            name: "Seated Forward Reach",
            description: "Slowly reach forward with arms extended, feeling the stretch in back.",
            duration: "2 minutes",
            adaptations: "Only reach as far as comfortable."
          },
          {
            name: "Shoulder Relaxation",
            description: "Raise shoulders towards ears, hold briefly, then drop and relax.",
            duration: "1 minute",
            adaptations: "Focus on the relaxation phase."
          }
        ]
      },
      progressionPath: "Begin with fewer repetitions and gradually increase. Add light resistance when comfortable with movements. Increase holding times for isometric exercises. Progress to multiple sets as endurance improves.",
      additionalResources: [
        "National Center on Health, Physical Activity and Disability (NCHPAD)",
        "Adaptive Exercise Equipment Suppliers",
        "Local Adaptive Fitness Programs"
      ]
    },
    
    "visual": {
      name: "Audio-Guided Fitness Program",
      disabilityType: "visual",
      sessionDuration: 30,
      focusAreas: ["Balance", "Strength", "Spatial Awareness"],
      safetyNotes: "Clear workout area of obstacles. Use tactile markers for positioning. Ensure stable surfaces. Have a sighted guide or wall/sturdy furniture nearby for balance support if needed.",
      equipment: ["Yoga mat for tactile boundary", "Wall or sturdy chair for support", "Resistance bands", "Audio timer"],
      sections: {
        warmUp: [
          {
            name: "Standing March",
            description: "March in place lifting knees to hip height. Focus on maintaining balance.",
            duration: "3 minutes",
            adaptations: "Stand near wall or chair for support if needed. Focus on feeling the movement rather than seeing it."
          },
          {
            name: "Arm Swings",
            description: "Swing arms forward and back, then side to side in controlled movements.",
            duration: "2 minutes",
            adaptations: "Begin with smaller movements and gradually increase range."
          }
        ],
        mainExercises: [
          {
            name: "Wall Push-ups",
            description: "Stand facing wall with arms extended, then bend elbows to bring chest toward wall.",
            sets: 3,
            reps: "10-12",
            rest: "60 seconds",
            adaptations: "Use tactile marker on wall for hand placement.",
            alternatives: "Can be done against countertop for less resistance."
          },
          {
            name: "Chair Squats",
            description: "Lower body to touch chair seat then stand back up. Chair provides tactile feedback for depth.",
            sets: 3,
            reps: "10-15",
            rest: "60 seconds",
            adaptations: "Chair provides spatial reference for squat depth.",
            alternatives: "Use arms for balance assistance if needed."
          },
          {
            name: "Standing Leg Curls",
            description: "Hold onto chair or wall, bend knee to bring foot toward buttocks.",
            sets: 3,
            reps: "12 each leg",
            rest: "45 seconds",
            adaptations: "Focus on proprioception (body awareness) rather than visual cues.",
            alternatives: "Can be done seated if balance is challenging."
          },
          {
            name: "Resistance Band Rows",
            description: "Secure band to doorknob or sturdy object, pull band toward body while standing.",
            sets: 3,
            reps: "12-15",
            rest: "60 seconds",
            adaptations: "Use band with distinct texture for easy identification.",
            alternatives: "Can be done seated if preferred."
          },
          {
            name: "Balance Practice",
            description: "Stand near wall, lift one foot slightly off ground and hold, focus on balance.",
            sets: 2,
            reps: "30 seconds each side",
            rest: "30 seconds",
            adaptations: "Keep fingertips lightly touching wall for support.",
            alternatives: "Gradually reduce wall contact as balance improves."
          }
        ],
        coolDown: [
          {
            name: "Standing Hamstring Stretch",
            description: "Place heel on floor with leg extended, lean forward slightly from hips.",
            duration: "30 seconds each leg",
            adaptations: "Hold onto stable surface for balance."
          },
          {
            name: "Chest and Shoulder Stretch",
            description: "Clasp hands behind back and gently lift arms.",
            duration: "30 seconds",
            adaptations: "Focus on feeling the stretch across chest."
          },
          {
            name: "Deep Breathing",
            description: "Inhale slowly for 4 counts, hold briefly, exhale for 6 counts.",
            duration: "2 minutes",
            adaptations: "Focus on the sensation and sound of breathing."
          }
        ]
      },
      progressionPath: "Begin with support (wall or chair) and gradually reduce dependency. Increase repetitions before increasing resistance. Focus on improving balance duration over time. Add complexity to movements as confidence builds.",
      additionalResources: [
        "Audio Workout Apps Designed for Visual Impairments",
        "USABA (United States Association of Blind Athletes)",
        "Descriptive Fitness Video Programs"
      ]
    },
    
    "hearing": {
      name: "Visual-Based Fitness Program",
      disabilityType: "hearing",
      sessionDuration: 30,
      focusAreas: ["Cardiovascular Health", "Strength", "Flexibility"],
      safetyNotes: "Position yourself where you can see all instructions clearly. Use mirrors for form check. Consider visual cues like timers instead of audio cues. Have written instructions available.",
      equipment: ["Visual timer or app", "Mirror for form checking", "Resistance bands", "Exercise mat"],
      sections: {
        warmUp: [
          {
            name: "Dynamic Stretching Sequence",
            description: "Follow visual demonstration of arm circles, hip rotations, and gentle twists.",
            duration: "3 minutes",
            adaptations: "Focus on visual cues and proper form in mirror."
          },
          {
            name: "Marching and High Knees",
            description: "March in place, gradually lifting knees higher to increase heart rate.",
            duration: "2 minutes",
            adaptations: "Use visual timer to track intervals."
          }
        ],
        mainExercises: [
          {
            name: "Bodyweight Squats",
            description: "Stand with feet shoulder-width apart, lower body as if sitting in chair, return to standing.",
            sets: 3,
            reps: "15",
            rest: "45 seconds",
            adaptations: "Use mirror to check form.",
            alternatives: "Hold onto stable surface if balance is a concern."
          },
          {
            name: "Push-ups (Standard or Modified)",
            description: "Either standard push-ups or modified version on knees.",
            sets: 3,
            reps: "10-12",
            rest: "60 seconds",
            adaptations: "Focus on feeling proper alignment rather than hearing instructions.",
            alternatives: "Can be done against wall for easier version."
          },
          {
            name: "Plank Hold",
            description: "Hold forearm plank position with straight body alignment.",
            sets: 3,
            reps: "30 seconds",
            rest: "45 seconds",
            adaptations: "Use visual timer in clear view.",
            alternatives: "Can be done from knees for modified version."
          },
          {
            name: "Resistance Band Pulls",
            description: "Secure band under foot and pull upward with controlled movement.",
            sets: 3,
            reps: "12-15 each arm",
            rest: "45 seconds",
            adaptations: "Follow visual demonstration carefully.",
            alternatives: "Adjust band resistance as needed."
          },
          {
            name: "Bodyweight Reverse Lunges",
            description: "Step backward into lunge position, lowering knee toward floor.",
            sets: 3,
            reps: "10 each leg",
            rest: "60 seconds",
            adaptations: "Use mirror to monitor form.",
            alternatives: "Hold wall or chair for balance if needed."
          }
        ],
        coolDown: [
          {
            name: "Seated Forward Fold",
            description: "Sit with legs extended and reach toward toes.",
            duration: "45 seconds",
            adaptations: "Focus on visual cues for proper alignment."
          },
          {
            name: "Standing Quad Stretch",
            description: "Hold foot behind you, stretching front of thigh.",
            duration: "30 seconds each leg",
            adaptations: "Use wall for balance if needed."
          },
          {
            name: "Visual Breathing Guide",
            description: "Follow visual breathing pattern (expanding circle for inhale, contracting for exhale).",
            duration: "2 minutes",
            adaptations: "Focus on matching breathing to visual cue."
          }
        ]
      },
      progressionPath: "Focus on mastering form before increasing repetitions. Add weights gradually once bodyweight exercises become easier. Incorporate more complex movements as coordination improves. Track progress visually with a workout journal.",
      additionalResources: [
        "Visual Workout Apps and Videos",
        "Fitness Programs with Closed Captioning",
        "Deaf Sports Organizations"
      ]
    },
    
    "cognitive": {
      name: "Structured Routine Exercise Plan",
      disabilityType: "cognitive",
      sessionDuration: 30,
      focusAreas: ["Movement Patterns", "Physical Activity Habit Formation", "Enjoyment of Exercise"],
      safetyNotes: "Use clear, simple instructions. Maintain consistent routine. Provide visual demonstrations. Break exercises into small steps. Offer frequent positive reinforcement. Ensure environment is distraction-free.",
      equipment: ["Visual exercise cards", "Timer with visual cues", "Comfortable clothing", "Familiar environment"],
      sections: {
        warmUp: [
          {
            name: "Simple Movement Patterns",
            description: "Follow simple movements: march in place, arm circles, toe touches.",
            duration: "3 minutes",
            adaptations: "Use visual cards showing each movement. Demonstrate each movement clearly."
          },
          {
            name: "Action Song or Rhythm",
            description: "Follow along with simple, repetitive movements to familiar music or rhythm.",
            duration: "2 minutes",
            adaptations: "Use consistent, predictable patterns that can be easily learned."
          }
        ],
        mainExercises: [
          {
            name: "Step-Touch Movement",
            description: "Step to side and touch opposite foot beside it, then alternate.",
            sets: 2,
            reps: "10 each side",
            rest: "45 seconds",
            adaptations: "Use floor markers to indicate where to step.",
            alternatives: "Can be done seated if needed."
          },
          {
            name: "Chair Stand-Up/Sit-Down",
            description: "Practice standing up from chair and sitting back down with control.",
            sets: 3,
            reps: "8-10",
            rest: "60 seconds",
            adaptations: "Use consistent verbal cues like 'stand' and 'sit'.",
            alternatives: "Use chair with armrests for additional support."
          },
          {
            name: "Wall Push-Away",
            description: "Stand facing wall with hands on wall, push body away and return.",
            sets: 2,
            reps: "10",
            rest: "45 seconds",
            adaptations: "Place colorful markers on wall where hands should be placed.",
            alternatives: "Adjust distance from wall based on ability."
          },
          {
            name: "Structured Walking Path",
            description: "Walk along a predetermined path marked clearly on floor.",
            sets: 2,
            reps: "Complete path 2 times",
            rest: "60 seconds",
            adaptations: "Use colored tape or markers to create clear path.",
            alternatives: "Can include simple obstacles to step over or around."
          }
        ],
        coolDown: [
          {
            name: "Simple Stretching Routine",
            description: "Follow simple, full-body stretches with clear demonstrations.",
            duration: "3 minutes",
            adaptations: "Use consistent sequence every session."
          },
          {
            name: "Relaxation Breathing",
            description: "Practice inhaling and exhaling slowly with visual cues.",
            duration: "2 minutes",
            adaptations: "Use hand movements to indicate breathing in and out."
          }
        ]
      },
      progressionPath: "Maintain consistent routine before adding new movements. Add one new element at a time. Use positive reinforcement to build confidence. Gradually increase duration of activity as tolerance improves. Focus on establishing exercise as enjoyable habit.",
      additionalResources: [
        "Adaptive Physical Education Programs",
        "Exercise Cards with Simple Visual Instructions",
        "Special Olympics Training Resources"
      ]
    },
    
    "other": {
      name: "Personalized Adaptive Fitness Plan",
      disabilityType: "various",
      sessionDuration: 30,
      focusAreas: ["Accessible Fitness", "Overall Wellbeing", "Adapted Movement"],
      safetyNotes: "Always work within your comfortable range of motion. Stop if you experience pain (not to be confused with normal exercise effort). Consider having a support person nearby for new exercises. Adapt all movements to your specific needs and abilities.",
      equipment: ["Resistance bands", "Stable chair", "Cushions or pillows for support", "Water bottle"],
      sections: {
        warmUp: [
          {
            name: "Gentle Joint Mobilization",
            description: "Slowly move each major joint through comfortable range of motion.",
            duration: "3 minutes",
            adaptations: "Focus only on joints that can be moved comfortably and safely."
          },
          {
            name: "Breathing Preparation",
            description: "Practice coordinated breathing with simple movements.",
            duration: "2 minutes",
            adaptations: "Can be done seated, standing, or lying down as appropriate."
          }
        ],
        mainExercises: [
          {
            name: "Adapted Strength Movement 1",
            description: "Basic pushing movement adapted to individual capability.",
            sets: 2,
            reps: "8-10",
            rest: "60 seconds",
            adaptations: "Can be done from any position that works for your body.",
            alternatives: "Use assistance devices if needed."
          },
          {
            name: "Adapted Strength Movement 2",
            description: "Basic pulling movement adapted to individual capability.",
            sets: 2,
            reps: "8-10",
            rest: "60 seconds",
            adaptations: "Adjust range of motion based on comfort and ability.",
            alternatives: "Use resistance bands or household items for resistance."
          },
          {
            name: "Cardiovascular Activity",
            description: "Any movement that slightly elevates heart rate while remaining comfortable.",
            sets: 2,
            reps: "2 minutes",
            rest: "90 seconds",
            adaptations: "Choose movement that works for your body - arm circles, marching, etc.",
            alternatives: "Can be seated or supported as needed."
          },
          {
            name: "Balance Practice",
            description: "Work on steadiness in a safe, supported position.",
            sets: 2,
            reps: "30 seconds",
            rest: "30 seconds",
            adaptations: "Always have support nearby. Focus on small, incremental challenges.",
            alternatives: "Can be done seated if standing balance is not possible."
          }
        ],
        coolDown: [
          {
            name: "Gentle Stretching",
            description: "Slowly stretch major muscle groups used during session.",
            duration: "3 minutes",
            adaptations: "Stay within comfortable range, never forcing a stretch."
          },
          {
            name: "Mindfulness Practice",
            description: "Focus on body awareness and breathing to conclude session.",
            duration: "2 minutes",
            adaptations: "Can be done in any comfortable position."
          }
        ]
      },
      progressionPath: "Focus on consistency rather than intensity. Make small, gradual changes to exercises as comfort and ability improve. Track personal progress rather than comparing to standard benchmarks. Celebrate all improvements, no matter how small they might seem.",
      additionalResources: [
        "Adaptive Sports and Recreation Programs",
        "Disability-Specific Exercise Resources",
        "Online Adaptive Fitness Communities"
      ]
    }
  };
  
  // Get minutes from session duration
  let durationMinutes = 30;
  if (sessionDuration === "15-30") {
    durationMinutes = 20;
  } else if (sessionDuration === "30-45") {
    durationMinutes = 35;
  } else if (sessionDuration === "45-60") {
    durationMinutes = 50;
  } else if (sessionDuration === "60+") {
    durationMinutes = 60;
  }
  
  // Get the appropriate fallback plan based on disability type
  let plan = examplePlans[disabilityType.toLowerCase()];
  
  // If no specific plan matches, use the "other" plan
  if (!plan) {
    plan = examplePlans["other"];
    plan.disabilityType = disabilityType; // Update the disability type in the plan
  }
  
  // Adjust session duration
  plan.sessionDuration = durationMinutes;
  
  // Incorporate preferred exercise types if provided
  if (preferredExerciseTypes && preferredExerciseTypes.length > 0) {
    plan.focusAreas = [...new Set([...plan.focusAreas, ...preferredExerciseTypes.slice(0, 2)])];
  }
  
  // Adjust for mobility limitations if provided
  if (mobilityLimitations && mobilityLimitations.length > 0) {
    plan.safetyNotes = `${plan.safetyNotes} Pay special attention to these mobility limitations: ${mobilityLimitations.join(", ")}.`;
    
    // Add note about adaptations
    plan.mainExercises = plan.mainExercises.map((exercise: any) => {
      return {
        ...exercise,
        adaptations: `${exercise.adaptations} Modify further as needed for specific mobility limitations.`
      };
    });
  }
  
  return plan;
}

export async function generateCombinedPlan(
  // Workout parameters
  goals: string[],
  fitnessLevel: string,
  workoutDays: string[],
  sessionDuration: string,
  // Diet parameters
  dietType: string,
  allergies: string,
  lifestyle: string,
  junkFoodFreq: string,
  sweetsFreq: string,
  saladFreq: string
): Promise<any> {
  try {
    console.log("🏋️+🥗 Generating combined workout and diet plan");
    
    // Get session duration in minutes
    let durationMinutes = 45; // Default to 45 minutes
    if (sessionDuration === "15-30") {
      durationMinutes = 30;
    } else if (sessionDuration === "30-45") {
      durationMinutes = 45;
    } else if (sessionDuration === "45-60") {
      durationMinutes = 60;
    } else if (sessionDuration === "60+") {
      durationMinutes = 75;
    }
    
    // Create array of day names that match the selected workout days
    const selectedDays = workoutDays.map(day => {
      const capitalized = day.charAt(0).toUpperCase() + day.slice(1);
      return capitalized;
    });
    
    // Generate workout types based on goals
    const workoutTypes = getWorkoutTypesForGoals(goals);
    
    // Calculate appropriate calories and intensity based on fitness level
    const caloriesPerMin = getFitnessLevelCalories(fitnessLevel);
    
    // Process allergies to create a clean list
    const allergyList = allergies 
      ? allergies.split(',').map(a => a.trim()).filter(Boolean).join(', ')
      : "None";
    
    // Determine meal frequency preferences
    const junkFoodAmount = getFrequencyAmount(junkFoodFreq);
    const sweetsAmount = getFrequencyAmount(sweetsFreq);
    const saladAmount = getFrequencyAmount(saladFreq);
    
    const prompt = `Create a comprehensive fitness program that includes both a personalized workout plan AND a complementary diet plan tailored to work together. The plan should be returned as a single JSON object.

WORKOUT PARAMETERS:
- Goals: ${goals.join(", ")}
- Fitness level: ${fitnessLevel}
- Workout days: ${selectedDays.join(", ")}
- Session duration: ${durationMinutes} minutes

DIET PARAMETERS:
- Diet type: ${dietType} (${getDietTypeDescription(dietType)})
- Allergies: ${allergyList}
- Lifestyle: ${lifestyle}
- Junk food frequency: ${junkFoodFreq}
- Sweets frequency: ${sweetsFreq}
- Salad frequency: ${saladFreq}

WORKOUT GUIDELINES:
1. For goals "${goals.join(", ")}":
   ${getGoalsGuidelines(goals)}
   
2. For fitness level "${fitnessLevel}":
   ${getFitnessLevelGuidelines(fitnessLevel)}

3. Create a progressive plan where exercises appropriately target the specified goals.

DIET GUIDELINES:
1. For diet type "${dietType}":
   ${getDietTypeGuidelines(dietType)}
   
2. AVOID ALL THESE ALLERGENS: ${allergyList !== "None" ? allergyList.toUpperCase() : "No allergies specified"}

3. Lifestyle "${lifestyle}":
   ${getLifestyleGuidelines(lifestyle)}

4. Include appropriate junk food, sweets, and salad frequency as specified.

IMPORTANT: The diet plan MUST complement the workout plan. For example:
- Higher protein on strength training days
- More carbs before cardio sessions
- Recovery nutrition after intense workouts
- Specific timing suggestions (what to eat before/after workouts)

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "workoutPlan": {
    "name": "MEANINGFUL_NAME_THAT_REFLECTS_GOALS_AND_LEVEL",
    "difficulty": "${fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1)}",
    "duration": "1 week",
    "totalWorkouts": ${selectedDays.length},
    "estimatedCalories": NUMBER_BETWEEN_${durationMinutes * caloriesPerMin * selectedDays.length - 200}_AND_${durationMinutes * caloriesPerMin * selectedDays.length + 200},
    "schedule": [
      ${selectedDays.map((day, index) => `{
        "day": "${day}",
        "type": "${workoutTypes[index % workoutTypes.length] || "Full Body"}",
        "duration": ${durationMinutes},
        "exercises": [
          {"name": "SPECIFIC_EXERCISE_NAME", "sets": NUMBER, "reps": "SPECIFIC_REPS_OR_DURATION", "rest": "SPECIFIC_REST_PERIOD"}
          // Include 4-6 exercises per workout day with specific details
        ],
        "calories": NUMBER_BETWEEN_${durationMinutes * caloriesPerMin - 50}_AND_${durationMinutes * caloriesPerMin + 50}
      }`).join(',\n      ')}
    ]
  },
  "dietPlan": {
    "name": "DIET_PLAN_NAME_THAT_COMPLEMENTS_WORKOUT",
    "type": "${dietType}",
    "dailyCalories": APPROPRIATE_NUMBER_BASED_ON_GOALS_AND_ACTIVITY,
    "macroBreakdown": {
      "protein": "PERCENTAGE",
      "carbs": "PERCENTAGE",
      "fat": "PERCENTAGE"
    },
    "schedule": {
      "Monday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL", "snacks": ["SNACK1", "SNACK2"]},
      "Tuesday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL", "snacks": ["SNACK1", "SNACK2"]},
      "Wednesday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL", "snacks": ["SNACK1", "SNACK2"]},
      "Thursday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL", "snacks": ["SNACK1", "SNACK2"]},
      "Friday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL", "snacks": ["SNACK1", "SNACK2"]},
      "Saturday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL", "snacks": ["SNACK1", "SNACK2"]},
      "Sunday": {"breakfast": "SPECIFIC_BREAKFAST_MEAL", "lunch": "SPECIFIC_LUNCH_MEAL", "dinner": "SPECIFIC_DINNER_MEAL", "snacks": ["SNACK1", "SNACK2"]}
    }
  },
  "recommendations": {
    "preworkoutNutrition": "WHAT_TO_EAT_BEFORE_WORKOUTS",
    "postworkoutNutrition": "WHAT_TO_EAT_AFTER_WORKOUTS", 
    "hydration": "HYDRATION_GUIDELINES",
    "supplements": ["OPTIONAL_SUPPLEMENT_RECOMMENDATIONS_BASED_ON_GOALS"]
  }
}

For each workout day, provide 4-6 specific exercises with appropriate sets, reps, and rest periods.
For each day's diet plan, provide specific meal descriptions that align with that day's workout (or recovery).
Do NOT include any explanations, comments, or text outside the JSON structure.
Ensure the JSON is valid and properly formatted with all keys and values using double quotes where needed.`;

    // Make up to 3 attempts to get a valid response
    const response = await generateGemmaResponse(prompt, 2);
    let result;
    
    try {
      // Parse the JSON response
      console.log("🔍 Parsing combined plan response...");
      console.log("Response preview:", response.substring(0, 200));
      
      result = JSON.parse(response);
      console.log("✅ Successfully parsed combined plan JSON");
      
      // Validate structure
      if (!result.workoutPlan || !result.dietPlan) {
        console.error("❌ Missing required top-level keys:", Object.keys(result));
        throw new Error("Response missing workoutPlan or dietPlan");
      }
      
      // Ensure schedule arrays exist
      if (!result.workoutPlan.schedule) {
        result.workoutPlan.schedule = [];
      }
      if (!result.dietPlan.schedule) {
        result.dietPlan.schedule = {};
      }
      if (!result.recommendations) {
        result.recommendations = {
          preworkoutNutrition: "Eat a balanced meal 1-2 hours before workout",
          postworkoutNutrition: "Consume protein within 30 minutes after workout",
          hydration: "Drink 2-3 liters of water daily",
          supplements: []
        };
      }
      
      console.log("✅ Combined plan validated successfully");
      return result;
      
    } catch (parseError) {
      console.error("❌ Error parsing combined plan response:", parseError);
      console.error("Full response:", response);
      throw new Error("Failed to parse workout plan from API. Please try again.");
    }
  } catch (error) {
    console.error("❌ Failed to generate combined plan:", error);
    throw error;
  }
}

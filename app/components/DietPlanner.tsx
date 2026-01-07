import React, { useState } from "react";
import { generateDietPlan } from "@/lib/gemma-api";
import { Accessibility } from "lucide-react";

// Types for preferences and diet plan
type DietType = "veg" | "non-veg" | "vegan";
type Lifestyle = "balanced" | "junk food" | "salad" | "sweets";
type Frequency = "never" | "rarely" | "sometimes" | "often" | "daily";
type DisabilityType = "none" | "mobility" | "visual" | "hearing" | "cognitive" | "other";
type DisabilityLevel = "mild" | "moderate" | "severe";
type MealPreparation = "independent" | "with-assistance" | "full-assistance";

type Preference = {
  dietType: DietType;
  allergies: string[];
  lifestyle: Lifestyle;
  junkFoodFreq: Frequency;
  sweetsFreq: Frequency;
  saladFreq: Frequency;
  hasDisability?: boolean;
  disabilityType?: DisabilityType;
  disabilityLevel?: DisabilityLevel;
  mealPreparation?: MealPreparation;
  specificNeeds?: string;
};

type DietPlan = {
  [day: string]: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
};


const DietPlanner: React.FC = () => {
  const [dietType, setDietType] = useState<DietType>("veg");
  const [allergies, setAllergies] = useState<string>("");
  const [lifestyle, setLifestyle] = useState<Lifestyle>("balanced");
  const [junkFoodFreq, setJunkFoodFreq] = useState<Frequency>("rarely");
  const [sweetsFreq, setSweetsFreq] = useState<Frequency>("rarely");
  const [saladFreq, setSaladFreq] = useState<Frequency>("rarely");
  const [hasDisability, setHasDisability] = useState(false);
  const [disabilityType, setDisabilityType] = useState<DisabilityType>("none");
  const [disabilityLevel, setDisabilityLevel] = useState<DisabilityLevel>("moderate");
  const [mealPreparation, setMealPreparation] = useState<MealPreparation>("independent");
  const [specificNeeds, setSpecificNeeds] = useState("");
  const [showPlan, setShowPlan] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietPlanData, setDietPlanData] = useState<DietPlan | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const preference: Preference = {
    dietType,
    allergies: allergies.split(",").map(a => a.trim()).filter(Boolean),
    lifestyle,
    junkFoodFreq,
    sweetsFreq,
    saladFreq,
    hasDisability,
    disabilityType: hasDisability ? disabilityType : "none",
    disabilityLevel: hasDisability ? disabilityLevel : "moderate",
    mealPreparation: hasDisability ? mealPreparation : "independent",
    specificNeeds: hasDisability ? specificNeeds : "",
  };

  const generateDietPlanInternal = async (
    dietType: DietType,
    allergies: string,
    lifestyle: Lifestyle,
    junkFoodFreq: Frequency,
    sweetsFreq: Frequency,
    saladFreq: Frequency,
    hasDisability: boolean = false,
    disabilityType: DisabilityType = "none",
    disabilityLevel: DisabilityLevel = "moderate",
    mealPreparation: MealPreparation = "independent",
    specificNeeds: string = ""
  ) => {
    setIsGenerating(true);
    try {
      console.log("⚙️ Generating diet plan with parameters:", {
        dietType,
        allergies,
        lifestyle,
        junkFoodFreq,
        sweetsFreq,
        saladFreq,
        hasDisability,
        disabilityType: hasDisability ? disabilityType : "none",
        disabilityLevel: hasDisability ? disabilityLevel : "moderate",
        mealPreparation: hasDisability ? mealPreparation : "independent",
        specificNeeds: hasDisability ? specificNeeds : ""
      });
      
      // Make up to 3 attempts to get a good response
      let plan = null;
      let attempts = 0;
      
      while (attempts < 3 && (!plan || (plan && plan._usedFallback))) {
        attempts++;
        if (attempts > 1) {
          console.log(`Retry attempt ${attempts}/3 for diet plan generation`);
        }
        
        plan = await generateDietPlan(
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
      
      console.log("🍽️ Received diet plan:", plan);
      
      if (plan && typeof plan === 'object') {
        // Check if the API indicated it used fallback values
        if (plan._usedFallback) {
          console.warn("⚠️ API used fallback values for diet plan");
          setUsedFallback(true);
        }
        
        // Ensure plan has all required days
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const validatedPlan: DietPlan = {};
        let isUsingFallback = false;
        
        // Process each day and ensure it has all meal types
        days.forEach(day => {
          const dayPlan = plan[day] || {};
          if (!plan[day]) isUsingFallback = true;
          
          validatedPlan[day] = {
            breakfast: dayPlan.breakfast || "Balanced meal based on your preferences",
            lunch: dayPlan.lunch || "Balanced meal based on your preferences",
            dinner: dayPlan.dinner || "Balanced meal based on your preferences"
          };
        });
        
        // Track if we had to use fallbacks
        if (isUsingFallback) {
          console.warn("⚠️ Diet plan missing some days, using fallback values");
          setUsedFallback(true);
        } else if (!plan._usedFallback) {
          setUsedFallback(false);
        }
        
        setDietPlanData(validatedPlan);
        setShowPlan(true);
      } else {
        console.error("❌ Invalid diet plan structure:", plan);
        alert("Could not generate a proper diet plan. The AI response was not in the expected format. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error generating diet plan:", error);
      alert("Failed to generate diet plan: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePlan = () => {
    generateDietPlanInternal(
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
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mt-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 dark:text-blue-300">Personalized Weekly Diet Planner</h2>
      <form className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-medium w-40" htmlFor="diet-type">Diet Type:</label>
          <select
            id="diet-type"
            title="Diet Type"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
            value={dietType}
            onChange={e => setDietType(e.target.value as DietType)}
          >
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-medium w-40" htmlFor="allergies">Allergies (comma separated):</label>
          <input
            id="allergies"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
            type="text"
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            placeholder="e.g. nuts, dairy"
          />
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-medium w-40" htmlFor="lifestyle">Lifestyle:</label>
          <select
            id="lifestyle"
            title="Lifestyle"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
            value={lifestyle}
            onChange={e => setLifestyle(e.target.value as Lifestyle)}
          >
            <option value="balanced">Balanced</option>
            <option value="junk food">Junk Food Lover</option>
            <option value="salad">Salad Lover</option>
            <option value="sweets">Sweets Lover</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-medium w-40" htmlFor="junk-food">Junk Food Frequency:</label>
          <select
            id="junk-food"
            title="Junk Food Frequency"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
            value={junkFoodFreq}
            onChange={e => setJunkFoodFreq(e.target.value as Frequency)}
          >
            <option value="never">Never</option>
            <option value="rarely">Rarely</option>
            <option value="sometimes">Sometimes</option>
            <option value="often">Often</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-medium w-40" htmlFor="sweets">Sweets Frequency:</label>
          <select
            id="sweets"
            title="Sweets Frequency"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
            value={sweetsFreq}
            onChange={e => setSweetsFreq(e.target.value as Frequency)}
          >
            <option value="never">Never</option>
            <option value="rarely">Rarely</option>
            <option value="sometimes">Sometimes</option>
            <option value="often">Often</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-medium w-40" htmlFor="salad">Salad Frequency:</label>
          <select
            id="salad"
            title="Salad Frequency"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
            value={saladFreq}
            onChange={e => setSaladFreq(e.target.value as Frequency)}
          >
            <option value="never">Never</option>
            <option value="rarely">Rarely</option>
            <option value="sometimes">Sometimes</option>
            <option value="often">Often</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        
        <div className="mt-8 mb-4 border-t border-blue-200 dark:border-blue-800 pt-4">
          <h3 className="font-bold text-lg mb-3 text-blue-600 dark:text-blue-300 flex items-center">
            <Accessibility className="h-5 w-5 mr-2" />
            Accessibility Options
          </h3>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-medium w-40" htmlFor="has-disability">I have a disability:</label>
          <div className="flex items-center">
            <input
              id="has-disability"
              type="checkbox"
              checked={hasDisability}
              onChange={e => setHasDisability(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <span>Yes</span>
          </div>
        </div>
        
        {hasDisability && (
          <>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="font-medium w-40" htmlFor="disability-type">Type of Disability:</label>
              <select
                id="disability-type"
                title="Disability Type"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={disabilityType}
                onChange={e => setDisabilityType(e.target.value as DisabilityType)}
              >
                <option value="mobility">Mobility Impairment</option>
                <option value="visual">Visual Impairment</option>
                <option value="hearing">Hearing Impairment</option>
                <option value="cognitive">Cognitive Disability</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="font-medium w-40" htmlFor="disability-level">Disability Level:</label>
              <select
                id="disability-level"
                title="Disability Level"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={disabilityLevel}
                onChange={e => setDisabilityLevel(e.target.value as DisabilityLevel)}
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="font-medium w-40" htmlFor="meal-preparation">Meal Preparation:</label>
              <select
                id="meal-preparation"
                title="Meal Preparation"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                value={mealPreparation}
                onChange={e => setMealPreparation(e.target.value as MealPreparation)}
              >
                <option value="independent">Independent</option>
                <option value="with-assistance">With Assistance</option>
                <option value="full-assistance">Full Assistance</option>
              </select>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="font-medium w-40" htmlFor="specific-needs">Specific Needs:</label>
              <input
                id="specific-needs"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                type="text"
                value={specificNeeds}
                onChange={e => setSpecificNeeds(e.target.value)}
                placeholder="Describe any specific dietary needs related to your disability"
              />
            </div>
          </>
        )}
        <button
          type="button"
          onClick={generatePlan}
          disabled={isGenerating}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition-colors disabled:opacity-70"
        >
          {isGenerating ? "Generating..." : "Generate Diet Plan with Gemma AI"}
        </button>
      </form>
      {showPlan && dietPlanData && (
        <>
          <div className="mt-8 bg-blue-50 dark:bg-gray-800 rounded-lg p-4">
            <strong className="block text-lg text-blue-700 dark:text-blue-300 mb-2">Your Preferences:</strong>
            <div className="text-gray-700 dark:text-gray-200">Diet Type: <span className="font-medium">{preference.dietType}</span></div>
            <div className="text-gray-700 dark:text-gray-200">Allergies: <span className="font-medium">{preference.allergies.length ? preference.allergies.join(", ") : "None"}</span></div>
            <div className="text-gray-700 dark:text-gray-200">Lifestyle: <span className="font-medium">{preference.lifestyle}</span></div>
            <div className="text-gray-700 dark:text-gray-200">Junk Food: <span className="font-medium">{preference.junkFoodFreq}</span></div>
            <div className="text-gray-700 dark:text-gray-200">Sweets: <span className="font-medium">{preference.sweetsFreq}</span></div>
            <div className="text-gray-700 dark:text-gray-200">Salad: <span className="font-medium">{preference.saladFreq}</span></div>
            {hasDisability && (
              <>
                <div className="text-gray-700 dark:text-gray-200 mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="font-bold">Accessibility Adaptations:</span>
                </div>
                <div className="text-gray-700 dark:text-gray-200">Disability Type: <span className="font-medium">{disabilityType}</span></div>
                <div className="text-gray-700 dark:text-gray-200">Disability Level: <span className="font-medium">{disabilityLevel}</span></div>
                <div className="text-gray-700 dark:text-gray-200">Meal Preparation: <span className="font-medium">{mealPreparation === 'independent' ? 'Independent' : mealPreparation === 'with-assistance' ? 'With Assistance' : 'Full Assistance'}</span></div>
                {specificNeeds && (
                  <div className="text-gray-700 dark:text-gray-200">Specific Needs: <span className="font-medium">{specificNeeds}</span></div>
                )}
                <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-sm">
                  <p className="text-blue-800 dark:text-blue-300">Your meal plan has been adapted for {disabilityType} accessibility needs with {disabilityLevel} severity level and {mealPreparation === 'independent' ? 'independent' : mealPreparation === 'with-assistance' ? 'some assistance' : 'full assistance'} meal preparation capabilities. Each meal includes appropriate preparation recommendations.</p>
                </div>
              </>
            )}
          </div>
          
          {usedFallback && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Diet plan partially generated</p>
                  <p className="text-sm mt-1">Some meals were filled in with balanced options. Try generating again for a more personalized plan.</p>
                  <button
                    type="button"
                    onClick={() => {
                      // Reset states
                      setUsedFallback(false);
                      setDietPlanData(null);
                      setShowPlan(false);
                      
                      // Retry with a slight delay
                      setTimeout(() => {
                        generateDietPlanInternal(
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
                      }, 100);
                    }}
                    className="mt-2 px-3 py-1 text-sm border border-amber-200 rounded bg-white text-amber-700 hover:bg-amber-50"
                  >
                    Try generating again
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="overflow-x-auto mt-8">
            <table className="min-w-full border border-blue-200 dark:border-gray-700 rounded-lg overflow-hidden shadow">
              <thead className="bg-blue-100 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 border-b border-blue-200 dark:border-gray-600 text-left text-blue-800 dark:text-blue-200">Day</th>
                  <th className="py-2 px-4 border-b border-blue-200 dark:border-gray-600 text-left text-blue-800 dark:text-blue-200">Breakfast</th>
                  <th className="py-2 px-4 border-b border-blue-200 dark:border-gray-600 text-left text-blue-800 dark:text-blue-200">Lunch</th>
                  <th className="py-2 px-4 border-b border-blue-200 dark:border-gray-600 text-left text-blue-800 dark:text-blue-200">Dinner</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(dietPlanData).map(([day, meals]) => (
                  <tr key={day} className="even:bg-blue-50 dark:even:bg-gray-800">
                    <td className="py-2 px-4 border-b border-blue-100 dark:border-gray-700 font-semibold">{day}</td>
                    <td className="py-2 px-4 border-b border-blue-100 dark:border-gray-700">{meals.breakfast}</td>
                    <td className="py-2 px-4 border-b border-blue-100 dark:border-gray-700">{meals.lunch}</td>
                    <td className="py-2 px-4 border-b border-blue-100 dark:border-gray-700">{meals.dinner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DietPlanner;
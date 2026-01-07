import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import "./config" // Import the original config first to initialize i18n

// Define the resources structure
const resources = {
  en: {
    translation: {
      // Common
      "welcome": "Welcome",
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "cancel": "Cancel",
      "save": "Save",
      "edit": "Edit",
      "delete": "Delete",
      "close": "Close",
      "back": "Back",
      // Example keys with spaces instead of underscores
      "daily desc": "Complete your daily workout routine with AI-powered form analysis and personalized guidance.",
      "fitness tracker": "Fitness Tracker",
      "daily exercises": "Daily Exercises",
      "welcome back": "Welcome Back!"
    }
  }
};

// Function to convert all resources from underscores to spaces
const convertTranslations = () => {
  // Get all current resources from i18n
  const currentResources = i18n.services.resourceStore.data;
  
  // For each language
  Object.keys(currentResources).forEach(lang => {
    if (currentResources[lang]?.translation) {
      const translation = currentResources[lang].translation;
      
      // Convert keys with underscores to space format and add them
      Object.keys(translation).forEach(key => {
        if (key.includes('_')) {
          const spaceKey = key.replace(/_/g, ' ');
          // Add the space-formatted key with the same value
          translation[spaceKey] = translation[key];
        }
      });
    }
  });
};

// Convert existing translations to space format
convertTranslations();

// Override the t function to automatically convert underscore keys to space keys
const originalT = i18n.t.bind(i18n);
i18n.t = function(key: any, ...args: any[]) {
  // If the key has underscores, convert it to spaces
  if (typeof key === 'string' && key.includes('_')) {
    const keyWithSpaces = key.replace(/_/g, ' ');
    return originalT(keyWithSpaces, ...args);
  }
  
  // Use the original key
  return originalT(key, ...args);
};

export default i18n;
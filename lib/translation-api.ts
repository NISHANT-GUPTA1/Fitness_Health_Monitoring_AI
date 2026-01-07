// Translation API service supporting multiple translation providers

// API Keys for different translation services
const GOOGLE_TRANSLATE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY || "";
const MICROSOFT_TRANSLATOR_KEY = process.env.NEXT_PUBLIC_MICROSOFT_TRANSLATOR_KEY || "";
const MICROSOFT_TRANSLATOR_REGION = process.env.NEXT_PUBLIC_MICROSOFT_TRANSLATOR_REGION || "global";
const DEEPL_API_KEY = process.env.NEXT_PUBLIC_DEEPL_API_KEY || "";
const LIBRETRANSLATE_API_URL = process.env.NEXT_PUBLIC_LIBRETRANSLATE_API_URL || "https://libretranslate.com";
const LIBRETRANSLATE_API_KEY = process.env.NEXT_PUBLIC_LIBRETRANSLATE_API_KEY || "";

// Fallback to OpenRouter/OpenAI if no translation-specific API is configured
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
const USE_OPENAI = process.env.NEXT_PUBLIC_USE_OPENAI === "true";
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

// Determine which translation service to use (priority order)
const getTranslationProvider = (): string => {
  if (GOOGLE_TRANSLATE_API_KEY) return "google";
  if (DEEPL_API_KEY) return "deepl";
  if (MICROSOFT_TRANSLATOR_KEY) return "microsoft";
  if (LIBRETRANSLATE_API_KEY || LIBRETRANSLATE_API_URL) return "libretranslate";
  if (USE_OPENAI && OPENAI_API_KEY) return "openai";
  if (OPENROUTER_API_KEY) return "openrouter";
  return "none";
};

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

// In-memory cache for translations
const translationCache: TranslationCache = {};

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = "en"
): Promise<string> {
  // Check cache first
  const cacheKey = `${sourceLanguage}:${text}`;
  if (translationCache[cacheKey]?.[targetLanguage]) {
    return translationCache[cacheKey][targetLanguage];
  }

  // If same language, return original
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  const provider = getTranslationProvider();
  
  if (provider === "none") {
    console.warn("No translation API configured. Using original text.");
    return text;
  }

  try {
    let translatedText: string;

    switch (provider) {
      case "google":
        translatedText = await translateWithGoogle(text, targetLanguage, sourceLanguage);
        break;
      case "deepl":
        translatedText = await translateWithDeepL(text, targetLanguage, sourceLanguage);
        break;
      case "microsoft":
        translatedText = await translateWithMicrosoft(text, targetLanguage, sourceLanguage);
        break;
      case "libretranslate":
        translatedText = await translateWithLibreTranslate(text, targetLanguage, sourceLanguage);
        break;
      case "openai":
        translatedText = await translateWithOpenAI(text, targetLanguage, sourceLanguage);
        break;
      case "openrouter":
        translatedText = await translateWithOpenRouter(text, targetLanguage, sourceLanguage);
        break;
      default:
        translatedText = text;
    }

    // Cache the translation
    if (!translationCache[cacheKey]) {
      translationCache[cacheKey] = {};
    }
    translationCache[cacheKey][targetLanguage] = translatedText;

    return translatedText;
  } catch (error) {
    console.error(`Translation error with ${provider}:`, error);
    // If LibreTranslate fails, log a helpful message
    if (provider === "libretranslate") {
      console.warn("LibreTranslate might be rate-limited or unavailable. Consider using a different service or self-hosting.");
    }
    return text; // Return original text as fallback
  }
}

// Google Translate API
async function translateWithGoogle(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string> {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

// DeepL API
async function translateWithDeepL(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string> {
  // DeepL uses uppercase language codes
  const targetLangUpper = targetLang.toUpperCase();
  const sourceLangUpper = sourceLang.toUpperCase();

  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      auth_key: DEEPL_API_KEY,
      text: text,
      source_lang: sourceLangUpper,
      target_lang: targetLangUpper,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepL API error: ${response.statusText}`);
  }
if (sourceLanguage === targetLanguage) {
    return texts;
  }

  const provider = getTranslationProvider();
  
  if (provider === "none") {
    console.warn("No translation API configured.");
    return texts;
  }

  // For dedicated translation APIs, translate individually (they're optimized)
  if (["google", "deepl", "microsoft", "libretranslate"].includes(provider)) {
    try {
      const promises = texts.map((text) =>
        translateText(text, targetLanguage, sourceLanguage)
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error("Batch translation error:", error);
      return texts;
    }
  }

  // For AI-based APIs, use batch approach
  return translateBatchWithAI(texts, targetLanguage, sourceLanguage, provider);
}

async function translateBatchWithAI(
  texts: string[],
  targetLanguage: string,
  sourceLanguage: string,
  provider: string
): Promise<string[]> {
  try {
    const languageNames: { [key: string]: string } = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      hi: "Hindi",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    const numberedTexts = texts.map((text, idx) => `${idx + 1}. ${text}`).join("\n");
    const prompt = `Translate the following fitness app texts from ${languageNames[sourceLanguage]} to ${targetLangName}. Maintain the numbering. Only provide translations:\n\n${numberedTexts}`;

    let response;

    if (provider === "openai") {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional translator for a fitness application.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });
    } else {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001:free",
          messages: [
            {
              role: "system",
              content: "You are a professional translator for a fitness application.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedContent = data.choices?.[0]?.message?.content?.trim() || "";
    const lines = translatedContent.split("\n");
    const translations: string[] = [];

    lines.forEach((line: string) => {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        translations.push(match[1].trim());
      }
    });

    if (translations.length !== texts.length) {
      console.warn("Batch translation parsing failed, using originals");
      return texts;
    }

    return translations;
  } catch (error) {
    console.error("Batch translation error:", error);
    return texts;
  }
}

export function getActiveTranslationProvider(): string {
  return getTranslationProvider();

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || text;
}

// OpenRouter Translation (Fallback)
async function translateWithOpenRouter(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string> {
  const languageNames: { [key: string]: string } = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    hi: "Hindi",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
  };

  const targetLangName = languageNames[targetLang] || targetLang;
  const prompt = `Translate the following fitness app text from ${languageNames[sourceLang]} to ${targetLangName}. Only provide the translation, no explanations:\n\n${text}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001:free",
      messages: [
        {
          role: "system",
          content: "You are a professional translator for a fitness application.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || text;
}

export async function translateBatch(
  texts: string[],
  targetLanguage: string,
  sourceLanguage: string = "en"
): Promise<string[]> {
  // For batch translation, we can optimize by combining texts
  if (sourceLanguage === targetLanguage) {
    return texts;
  }

  try {
    const languageNames: { [key: string]: string } = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      hi: "Hindi",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    
    // Create numbered list for batch translation
    const numberedTexts = texts.map((text, idx) => `${idx + 1}. ${text}`).join("\n");
    
    const prompt = `Translate the following fitness app texts from ${languageNames[sourceLanguage]} to ${targetLangName}. Maintain the numbering. Only provide translations:\n\n${numberedTexts}`;

    let response;

    if (USE_OPENAI && OPENAI_API_KEY) {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional translator for a fitness application.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });
    } else if (OPENROUTER_API_KEY) {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001:free",
          messages: [
            {
              role: "system",
              content: "You are a professional translator for a fitness application.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });
    } else {
      throw new Error("No translation API key configured");
    }

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedContent = data.choices?.[0]?.message?.content?.trim() || "";

    // Parse the numbered response
    const lines = translatedContent.split("\n");
    const translations: string[] = [];
    
    lines.forEach((line: string) => {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        translations.push(match[1].trim());
      }
    });

    // If parsing failed, fall back to original texts
    if (translations.length !== texts.length) {
      console.warn("Batch translation parsing failed, using originals");
      return texts;
    }

    return translations;
  } catch (error) {
    console.error("Batch translation error:", error);
    return texts;
  }
}

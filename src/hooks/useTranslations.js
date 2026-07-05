"use client";

import { useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Load messages once at module level to avoid re-requiring on every render
const messages = {
  ar: require("../messages/ar.json"),
  en: require("../messages/en.json"),
};

const hardcodedFallbacks = {
  en: {
    "theme.calm": "Calm (Ambient)",
    "theme.focus": "Focus (Ambient)",
    "theme.vibrant": "Vibrant (Ambient)"
  },
  ar: {
    "theme.calm": "هادئ (محسن)",
    "theme.focus": "تركيز (محسن)",
    "theme.vibrant": "حيوي (محسن)"
  }
};

export const useTranslations = (namespace = null) => {
  const { language, isLoading } = useLanguage();

  const t = useCallback((key, params = {}) => {
    // Return empty string or key while loading
    if (isLoading) {
      return '';
    }
    const keys = key.split('.');
    const msgs = messages;
    let translation = msgs[language];

    // Navigate through nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to English if key not found in current language
        translation = messages['en'];
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            // Before returning the raw key, see if we have a hardcoded fallback
            const fallback = hardcodedFallbacks[language]?.[key] || hardcodedFallbacks['en']?.[key];
            return fallback || key; // Return key if not found in both languages
          }
        }
        break;
      }
    }

    // If translation is still an object, return the key
    if (typeof translation === 'object') {
      return key;
    }

    // Replace parameters in translation
    let result = translation || key;
    Object.keys(params).forEach(param => {
      result = result.replace(`{${param}}`, params[param]);
    });

    return result;
  }, [language, isLoading]);

  const result = useMemo(() => {
    // If namespace is provided, return a function that prefixes keys with namespace
    if (namespace) {
      return (key, params) => t(`${namespace}.${key}`, params);
    }
    return { t };
  }, [t, namespace]);

  return result;
};

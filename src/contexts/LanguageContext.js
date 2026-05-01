"use client";

import { createContext, useContext, useEffect, useState } from "react";
const LanguageContext = createContext();

export const languages = {
  ar: "ar",
  en: "en"
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(languages.ar);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && Object.values(languages).includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;
    const body = document.body;

    root.setAttribute("lang", language);

    const direction = language === languages.ar ? "rtl" : "ltr";
    root.setAttribute("dir", direction);
    body.setAttribute("dir", direction);

    root.classList.remove("rtl", "ltr");
    root.classList.add(direction);

    localStorage.setItem("language", language);
    document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=31536000`;
  }, [language, isLoading]);

  const switchLanguage = () => {
    const newLanguage = language === languages.ar ? languages.en : languages.ar;
    setLanguage(newLanguage);
  };

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case languages.en:
        return "English";
      case languages.ar:
        return "العربية";
      default:
        return "العربية";
    }
  };

  const getLanguageDirection = (lang) => {
    return lang === languages.ar ? "rtl" : "ltr";
  };

  const isRTL = language === languages.ar;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        switchLanguage,
        languages,
        getLanguageLabel,
        getLanguageDirection,
        isRTL,
        isLoading
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

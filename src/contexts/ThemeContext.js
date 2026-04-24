"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const themes = {
  light: "light",
  dark: "dark", 
  blue: "blue",
  blueNew: "blue-new",
  green: "green",
  orange: "orange",
  orangeGold: "orange-gold",
  violet: "violet",
  yellow: "yellow",
  rose: "rose",
  calm: "calm",
  focus: "focus",
  vibrant: "vibrant"
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.light);
  const [readerMode, setReaderMode] = useState(false);

  useEffect(() => {
    // Get theme from localStorage on component mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && Object.values(themes).includes(savedTheme)) {
      setTheme(savedTheme);
    }
    const savedReader = localStorage.getItem("readerMode");
    if (savedReader === "true") {
      setReaderMode(true);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    // Temporarily disable all transitions to prevent slow repaints during theme change
    const css = document.createElement('style');
    css.appendChild(
      document.createTextNode(
        `* {
          -webkit-transition: none !important;
          -moz-transition: none !important;
          -o-transition: none !important;
          -ms-transition: none !important;
          transition: none !important;
        }`
      )
    );
    document.head.appendChild(css);

    // Remove all theme classes
    Object.values(themes).forEach(t => {
      root.classList.remove(t);
    });
    
    // Add current theme class
    if (theme !== themes.light) {
      root.classList.add(theme);
    }
    
    // Save theme to localStorage
    localStorage.setItem("theme", theme);

    // Force a reflow so the theme applies instantly without transition
    const _ = window.getComputedStyle(css).opacity;
    document.head.removeChild(css);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (readerMode) {
      root.classList.add("reader-mode");
    } else {
      root.classList.remove("reader-mode");
    }
    localStorage.setItem("readerMode", readerMode ? "true" : "false");
  }, [readerMode]);

  const toggleTheme = () => {
    const themeValues = Object.values(themes);
    const currentIndex = themeValues.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeValues.length;
    setTheme(themeValues[nextIndex]);
  };

  const setThemeDirectly = (newTheme) => {
    if (Object.values(themes).includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: setThemeDirectly, 
      toggleTheme,
      themes,
      readerMode,
      setReaderMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

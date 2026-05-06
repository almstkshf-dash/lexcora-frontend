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
    // Apply theme to document without blocking the main thread.
    //
    // OLD approach: inject a <style>*{transition:none}</style> then call
    // window.getComputedStyle() to force a synchronous style recalc before
    // removing it. That recalc was the 200ms main-thread block.
    //
    // NEW approach:
    //  1. Add a CSS class that suppresses transitions via globals.css.
    //  2. Swap theme classes in the same microtask (no layout triggered).
    //  3. Remove the no-transition class after ONE rAF so the browser can
    //     repaint the new theme without any animated flash, then re-enable
    //     transitions for subsequent interactions.
    const root = document.documentElement;

    // Step 1 — freeze transitions via a class (defined in globals.css)
    root.classList.add('theme-switching');

    // Step 2 — swap theme classes (pure class-list mutation, no reflow)
    Object.values(themes).forEach(t => root.classList.remove(t));
    if (theme !== themes.light) {
      root.classList.add(theme);
    }

    // Save preference
    localStorage.setItem("theme", theme);

    // Step 3 — unfreeze after the browser has painted the new theme.
    // Double-rAF ensures the new frame is committed before transitions resume.
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-switching');
      });
    });

    return () => cancelAnimationFrame(rafId);
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

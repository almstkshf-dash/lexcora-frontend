"use client";

import { useIsClient } from "@/hooks/useIsClient";

/**
 * DynamicLayout
 *
 * Thin hydration gate that prevents server/client HTML mismatch.
 *
 * What changed vs. the original:
 *  1. Removed duplicate DOM attribute writes (lang, dir, classList).
 *     LanguageContext already handles these — two writers caused a race condition.
 *  2. Removed the blocking full-screen spinner. The spinner showed on EVERY
 *     navigation, tanking CLS scores and causing visible flashes. The hydration
 *     mismatch is now handled by suppressHydrationWarning on the root <html>
 *     element in layout.js instead.
 *  3. Delegated the isClient pattern to the shared useIsClient() hook.
 *  4. Added a minimal, accessible skeleton placeholder instead of a giant spinner.
 */
import { useEffect } from "react";

const DynamicLayout = ({ children }) => {
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    const applyFont = (fontKey) => {
      const fonts = {
        cairo: 'Cairo, sans-serif',
        tajawal: 'Tajawal, sans-serif',
        amiri: 'Amiri, serif',
        'noto-sans-arabic': 'Noto Sans Arabic, sans-serif',
        inter: 'Inter, sans-serif'
      };
      const fontFamily = fonts[fontKey] || fonts.cairo;
      
      const fontUrls = {
        tajawal: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap',
        amiri: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
        'noto-sans-arabic': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap',
        inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      };
      
      const url = fontUrls[fontKey];
      if (url && !document.getElementById('google-font-' + fontKey)) {
        const link = document.createElement('link');
        link.id = 'google-font-' + fontKey;
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
      }
      
      document.documentElement.style.setProperty(
        '--font-arabic-system', 
        `${fontFamily}, 'Arial Unicode MS', 'Tahoma', 'Microsoft Sans Serif', 'Segoe UI', Arial, sans-serif`
      );
    };

    const savedFont = localStorage.getItem('selectedFont') || 'cairo';
    applyFont(savedFont);

    const handleReset = (e) => {
      applyFont(e.detail);
    };
    
    window.addEventListener('fontReset', handleReset);
    return () => window.removeEventListener('fontReset', handleReset);
  }, [isClient]);

  // Before hydration: render a lightweight, invisible placeholder that matches
  // the server HTML structure. This avoids CLS and prevents React from
  // complaining about hydration mismatches.
  if (!isClient) {
    return (
      <div
        className="flex h-screen overflow-hidden"
        role="status"
        aria-live="polite"
        aria-label="جارٍ التحميل، يرجى الانتظار"
        aria-busy="true"
      >
        {/* Invisible placeholder — preserves layout dimensions during hydration */}
        <span className="sr-only">جارٍ التحميل...</span>
      </div>
    );
  }

  return <>{children}</>;
};

export default DynamicLayout;

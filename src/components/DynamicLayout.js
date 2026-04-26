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
const DynamicLayout = ({ children }) => {
  const isClient = useIsClient();

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

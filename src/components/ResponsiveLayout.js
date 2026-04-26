"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsClient } from "@/hooks/useIsClient";
import AppSidebar from "@/app/components/navigation/AppSidebar";
import Header from "@/app/components/Header";
import MobileHeader from "@/app/components/MobileHeader";
import AiButton from "@/app/components/ai/AiButton";
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { isPublicRoute } from "@/constants/publicRoutes";

/**
 * ResponsiveLayout
 *
 * Shell layout that renders the sidebar, header, and main content area.
 * Conditionally shows the authenticated shell only when the user is logged in
 * and not on a public route.
 *
 * What changed vs. the original:
 *  1. Delegated isClient to the shared useIsClient() hook — no more local useState/useEffect.
 *  2. isLoginPage hardcode replaced with isPublicRoute() from publicRoutes.js
 *     — future public routes (register, forgot-password) are handled automatically.
 *  3. Auth loading state is now respected: shows a neutral skeleton during the
 *     Redux selector resolution window to prevent FOUC (flash of unauthenticated UI).
 *  4. Inline lambda `onMobileSidebarClose` wrapped in useCallback to prevent
 *     unnecessary re-renders of AppSidebar on every render cycle.
 *  5. Only `isRTL` is destructured from useLanguage — consuming `language` and
 *     `isLoading` here was triggering extra renders on every language change.
 *  6. AiButton moved OUTSIDE the scrollable content div so it stays fixed in
 *     the viewport corner even on long/scrolling pages.
 *  7. `pb-24` bottom padding is now `pb-24 md:pb-4` — mobile needs clearance for
 *     the floating AiButton, but desktop does not.
 *  8. `<main>` has id="main-content" for skip-navigation link support.
 */
const ResponsiveLayout = ({ children }) => {
  // Only destructure isRTL — the rest is handled by LanguageContext internally
  const { isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const isClient = useIsClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Pull loading state so we can avoid FOUC while Redux rehydrates auth
  const { isAuth, loading: authLoading } = useAuth();
  const pathname = usePathname();

  // Handler — stable reference, won't cause AppSidebar re-renders
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  // Stable close handler — previously an inline lambda, causing AppSidebar re-renders
  const handleMobileSidebarClose = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Before hydration: render a layout-shaped placeholder to prevent CLS
  if (!isClient) {
    return (
      <div className="flex h-screen overflow-hidden" aria-hidden="true">
        {children}
      </div>
    );
  }

  // While Redux is resolving auth state (e.g. SSR rehydration), show a neutral
  // shell to avoid the sidebar flashing in/out
  if (authLoading) {
    return (
      <div
        className="flex h-screen overflow-hidden"
        role="status"
        aria-live="polite"
        aria-label="جارٍ التحقق من الهوية"
        aria-busy="true"
      >
        <span className="sr-only">جارٍ التحقق من الهوية...</span>
      </div>
    );
  }

  // Public routes and unauthenticated users: render children without shell
  const showLayout = isAuth && !isPublicRoute(pathname);

  if (!showLayout) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"}>
        {children}
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex h-screen overflow-hidden">
      {/* Sidebar — positioned right for RTL, left for LTR (handled by CSS dir) */}
      <AppSidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        onMobileSidebarClose={handleMobileSidebarClose}
      />

      {/* Main content area */}
      <main
        id="main-content"
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Skip-navigation target — screen readers jump here */}
        {/* Responsive header: mobile variant on small screens, desktop on larger */}
        {isMobile ? (
          <MobileHeader onMenuToggle={handleMobileMenuToggle} />
        ) : (
          <Header />
        )}

        {/* Scrollable content area
            pb-24: clears the floating AiButton on mobile
            md:pb-4: normal padding on desktop (AiButton is position:fixed there) */}
        <div className="flex-1 overflow-auto px-3 md:px-4 lg:px-6 py-3 md:py-4 pb-24 md:pb-4 relative">
          {children}
        </div>
      </main>

      {/* AiButton lives OUTSIDE the scroll container so it stays fixed
          in the viewport corner even when content scrolls */}
      <AiButton />
    </div>
  );
};

export default ResponsiveLayout;

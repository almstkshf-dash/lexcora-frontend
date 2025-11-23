"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "@/app/components/navigation/AppSidebar";
import Header from "@/app/components/Header";
import MobileHeader from "@/app/components/MobileHeader";
import AiButton from "@/app/components/ai/AiButton";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
const ResponsiveLayout = ({ children }) => {
  const { isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isAuth } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if we're on the login page
  const isLoginPage = pathname === '/login';

  // Don't show sidebar and header if not authenticated or on login page
  const showLayout = isAuth && !isLoginPage;

  // Handler to toggle mobile sidebar from mobile header
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  // Prevent hydration mismatch by using consistent initial render
  if (!isClient) {
    return (
      <div className="flex h-screen overflow-hidden">
        {children}
      </div>
    );
  }

  // If not authenticated or on login page, just render children without layout
  if (!showLayout) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"}>
        {children}
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex h-screen overflow-hidden">
      {/* Sidebar - will be on right for RTL, left for LTR */}
      <AppSidebar 
        isMobileSidebarOpen={isMobileSidebarOpen}
        onMobileSidebarClose={() => setIsMobileSidebarOpen(false)}
      />
      
      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Responsive Header - Mobile header on small screens, Desktop header on larger screens */}
        {isMobile ? (
          <MobileHeader onMenuToggle={handleMobileMenuToggle} />
        ) : (
          <Header />
        )}
        
        {/* Content area with proper spacing - no overlapping */}
        <div className="flex-1 overflow-auto px-3 md:px-4 lg:px-6 py-3 md:py-4 pb-24 relative">
          {children}
          {/* Floating AI assistant (bottom corner) */}
          <AiButton />
        </div>
      </main>
    </div>
  );
};

export default ResponsiveLayout;

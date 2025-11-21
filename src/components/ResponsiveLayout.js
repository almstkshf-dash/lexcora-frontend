"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "@/app/components/navigation/AppSidebar";
import Header from "@/app/components/Header";
import MobileHeader from "@/app/components/MobileHeader";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import LegalChatPopup from "@/app/components/ai/LegalChatPopup";

const ResponsiveLayout = ({ children }) => {
  const { isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
          
          <button
            onClick={() => setIsChatOpen(true)}
            className={`fixed ${isRTL ? 'left-6' : 'right-6'} z-50 p-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 shadow-lg hover:shadow-2xl transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4`}
            style={{
              bottom: 'clamp(1rem, 1.5rem + env(safe-area-inset-bottom, 0px), 2.5rem)',
            }}
            aria-label={isRTL ? "مساعد الذكاء الاصطناعي" : "AI Assistant"}
          >
            <Sparkles 
              size={24} 
              className="text-white group-hover:scale-110 group-hover:rotate-12 transition-transform" 
            />
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 animate-ping opacity-75"></span>
            
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/50 to-blue-400/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>

          <LegalChatPopup 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        </div>
      </main>
    </div>
  );
};

export default ResponsiveLayout;

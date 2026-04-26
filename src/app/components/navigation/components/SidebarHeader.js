'use client';

import React from 'react';
import Image from 'next/image';
import { CircleX, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * Sidebar Header Component
 * Displays the logo and office name with modern design
 */
const SidebarHeader = ({ isRTL, isMobile, onClose, isCollapsed, onToggleCollapse }) => {
  const t = useTranslations('navigation');

  return (
    <header className={`relative py-9.5 border-b border-sidebar-border/50 bg-gradient-to-br from-sidebar-accent/30 via-transparent to-transparent ${isCollapsed ? 'px-2 flex justify-center' : 'px-6'}`}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
      
      <div className={`relative flex items-center gap-4 ${isCollapsed ? 'justify-center flex-col' : ''}`}>
        {/* Logo Container with Gradient Border */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-2 shadow-lg transform group-hover:scale-105 transition-all duration-300 border border-sidebar-border/30 flex items-center justify-center">
            <Image 
              height={56} 
              width={56} 
              src="/log_in_card_logo.png" 
              alt="Law Office Logo" 
              className="max-w-full max-h-full object-contain drop-shadow-sm" 
            />
          </div>
        </div>

        {/* Brand Info */}
        {!isCollapsed && (
          <div className="flex-1 min-w-0 transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                LEXCORA
              </h1>
              <Sparkles className="w-4 h-4 text-primary/60 animate-pulse" />
            </div>
            <p className="text-xs text-sidebar-foreground/60 font-medium tracking-wide truncate">
              {t('appSubtitle')}
            </p>
          </div>
        )}

        {/* Toggle Button for Desktop */}
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`absolute ${isRTL ? 'left-[-1rem]' : 'right-[-1rem]'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-sidebar-accent border border-sidebar-border shadow-md flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 transition-all z-50`}
            aria-label={isCollapsed ? (isRTL ? "توسيع القائمة" : "Expand Menu") : (isRTL ? "طي القائمة" : "Collapse Menu")}
          >
            {isRTL ? (
              isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Close Button for Mobile */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="relative p-2.5 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground bg-sidebar-accent/50 hover:bg-sidebar-accent transition-all duration-300 hover:scale-110 active:scale-95 group shadow-sm"
            aria-label={isRTL ? "إغلاق القائمة" : "Close Menu"}
          >
            <CircleX className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          </button>
        )}
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </header>
  );
};

export default SidebarHeader;

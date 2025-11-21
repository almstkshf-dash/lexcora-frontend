import React from 'react';
import Image from 'next/image';
import { CircleX, Sparkles } from 'lucide-react';

/**
 * Sidebar Header Component
 * Displays the logo and office name with modern design
 */
const SidebarHeader = ({ isRTL, isMobile, onClose }) => {
  return (
    <header className="relative px-6 py-9.5 border-b border-sidebar-border/50 bg-gradient-to-br from-sidebar-accent/30 via-transparent to-transparent">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
      
      <div className="relative flex items-center gap-4">
        {/* Logo Container with Gradient Border */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
          <div className="relative w-16 h-16 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-2 shadow-lg transform group-hover:scale-105 transition-all duration-300 border border-sidebar-border/30">
            <Image 
              height={56} 
              width={56} 
              src="/log_in_card_logo.png" 
              alt="Law Office Logo" 
              className="w-full h-full object-contain drop-shadow-sm" 
            />
          </div>
        </div>

        {/* Brand Info */}
        <div className="flex-1 min-w-0 transition-all duration-300">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              LEXCORA
            </h1>
            <Sparkles className="w-4 h-4 text-primary/60 animate-pulse" />
          </div>
          <p className="text-xs text-sidebar-foreground/60 font-medium tracking-wide">
            {isRTL ? 'النظام الذكي للمحاماة' : 'Legal Management System'}
          </p>
        </div>

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

'use client';

import ThemeSwitcher from '@/components/ThemeSwitcher'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import NotificationMenu from '@/app/components/notifications/NotificationMenu'
import ExternalLinksMenu from '@/app/components/ExternalLinksMenu'
import SearchBar from '@/app/components/search'
import QuickActionsBar from '@/app/components/QuickActionsBar'
import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import FocusCycleBar from '@/components/FocusCycleBar'

/**
 * Desktop/Tablet Header Component
 * Responsive header optimized for medium to large screens with modern design
 */
function Header() {
  const { isRTL } = useLanguage();
  
  return (
    <>
      <header className="relative flex-shrink-0 px-6 py-3 border-b border-sidebar-border/50 bg-gradient-to-br from-sidebar-accent/30 via-transparent to-transparent">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
        
        <div className="relative flex items-center justify-between gap-4">
          {/* Left/Right Side: Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative">
                <ExternalLinksMenu />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative">
                <NotificationMenu />
              </div>
            </div>
          </div>
          
          {/* Center: Search Bar - Responsive width */}
          <div className="flex-1 max-w-md lg:max-w-2xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative">
              <SearchBar />
            </div>
          </div>
          
          {/* Right/Left Side: Theme and Language Switchers */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative">
                <ThemeSwitcher />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </header>

      <div className="px-6 pb-2 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <FocusCycleBar />
      </div>

      {/* Quick Actions Bar - Below Header */}
      <QuickActionsBar />
    </>
  )
}

export default Header

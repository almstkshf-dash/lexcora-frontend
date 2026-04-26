'use client';

import ThemeSwitcher from '@/components/ThemeSwitcher'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import NotificationMenu from '@/app/components/notifications/NotificationMenu'
import ExternalLinksMenu from '@/app/components/ExternalLinksMenu'
import SearchBar from '@/app/components/search'
import QuickActionsBar from '@/app/components/QuickActionsBar'
import FocusCycleBar from '@/components/FocusCycleBar'

/**
 * GlowWrapper
 *
 * Extracted from the 4× copy-pasted glow pattern in the original file.
 * Each child button gets a coloured ambient glow on hover without the
 * parent having to re-render.
 */
function GlowWrapper({ color = 'primary', children }) {
  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 bg-${color}/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300`}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </div>
  )
}

/**
 * Header (Desktop / Tablet)
 *
 * Changes vs. original:
 *  1. Removed `useLanguage()` — isRTL was destructured but never used,
 *     causing Header to re-render on every language switch.
 *  2. All three decorative blur divs now have aria-hidden="true".
 *  3. Replaced 4× copy-pasted glow-wrapper blocks with <GlowWrapper />.
 */
function Header() {
  return (
    <>
      <header className="relative flex-shrink-0 px-6 py-3 border-b border-sidebar-border/50 bg-gradient-to-br from-sidebar-accent/30 via-transparent to-transparent">
        {/* Decorative background elements — hidden from a11y tree */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" aria-hidden="true" />

        <div className="relative flex items-center justify-between gap-4">
          {/* Left / Right: action buttons */}
          <div className="flex items-center gap-2">
            <GlowWrapper color="primary">
              <ExternalLinksMenu />
            </GlowWrapper>
            <GlowWrapper color="blue-500">
              <NotificationMenu />
            </GlowWrapper>
          </div>

          {/* Center: search */}
          <div className="flex-1 max-w-md lg:max-w-2xl mx-auto relative">
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 rounded-2xl blur-xl opacity-50"
              aria-hidden="true"
            />
            <div className="relative">
              <SearchBar />
            </div>
          </div>

          {/* Right / Left: theme + language */}
          <div className="flex items-center gap-2">
            <GlowWrapper color="purple-500">
              <ThemeSwitcher />
            </GlowWrapper>
            <GlowWrapper color="blue-500">
              <LanguageSwitcher />
            </GlowWrapper>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          aria-hidden="true"
        />
      </header>

      <div className="px-6 pt-2 pb-2 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <FocusCycleBar />
      </div>

      {/* Quick Actions Bar — below header */}
      <QuickActionsBar />
    </>
  )
}

export default Header

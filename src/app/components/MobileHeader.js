'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Menu, Search } from 'lucide-react';
import Image from 'next/image';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationMenu from '@/app/components/notifications/NotificationMenu';
import ExternalLinksMenu from '@/app/components/ExternalLinksMenu';
import SearchBar from '@/app/components/search';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * MobileHeader
 *
 * Changes vs. original:
 *  1. Removed unused lucide icons: Bell, Globe, Sun, Moon.
 *  2. Removed unused `useTheme` hook — was imported but never called.
 *  3. Removed unused `useLanguage` hook — replaced with useTranslations.
 *  4. <img> → <Image> (Next.js optimised, WebP, lazy).
 *  5. Hardcoded bilingual ternaries → t('navigation.openMenu') / t('navigation.toggleSearch').
 *  6. <h1> → <span> — avoids duplicate heading landmark (each page has its own h1).
 *  7. "LEXCORA" string → t('navigation.appTitle') for i18n completeness.
 *  8. Search toggle button now carries aria-expanded + aria-controls.
 *  9. Pressing Escape inside the expanded search closes it.
 * 10. Inline lambdas replaced with useCallback-stable handlers.
 */
const MobileHeader = ({ onMenuToggle }) => {
  const { t } = useTranslations();
  const [showSearch, setShowSearch] = useState(false);

  const handleMenuToggle = useCallback(() => {
    onMenuToggle?.();
  }, [onMenuToggle]);

  const handleSearchToggle = useCallback(() => {
    setShowSearch(prev => !prev);
  }, []);

  const handleSearchSelect = useCallback(() => {
    setShowSearch(false);
  }, []);

  // Close search on Escape — standard UX for collapsible overlays
  useEffect(() => {
    if (!showSearch) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowSearch(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Main Header Bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">

        {/* Menu Button */}
        <button
          type="button"
          onClick={handleMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('navigation.openMenu')}
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" aria-hidden="true" />
        </button>

        {/* Logo + Title
            Uses <span> not <h1> — the page itself provides the heading landmark */}
        <div className="flex items-center gap-2 flex-1">
          <Image
            src="/log_in_card_logo.png"
            alt={t('navigation.appTitle')}
            width={28}
            height={28}
            className="object-cover rounded"
            priority
          />
          <span className="text-gray-900 dark:text-white font-bold text-base sm:text-lg select-none">
            {t('navigation.appTitle')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Search toggle */}
          <button
            type="button"
            onClick={handleSearchToggle}
            aria-label={t('navigation.toggleSearch')}
            aria-expanded={showSearch}
            aria-controls="mobile-search-panel"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" aria-hidden="true" />
          </button>

          <NotificationMenu />
          <ExternalLinksMenu />
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Expandable Search Bar */}
      {showSearch && (
        <div
          id="mobile-search-panel"
          className="px-3 pb-2 animate-in slide-in-from-top-2"
        >
          <SearchBar
            onSelect={handleSearchSelect}
            autoFocus
          />
        </div>
      )}
    </header>
  );
};

export default MobileHeader;

'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * Static action definitions — shape never changes at runtime so this
 * lives outside the component and is never reallocated.
 *
 * `theme` maps to the CSS class suffix defined in globals.css:
 *   .qa-btn-{theme}  /  .qa-icon-wrapper-{theme}
 */
const ACTION_DEFINITIONS = [
  {
    icon: '/41.png',
    labelKey: 'sessions',
    path: '/cases/sessions',
    theme: 'indigo',
    shadow: 'rgba(99, 102, 241, 0.15)',
  },
  {
    icon: '/36.png',
    labelKey: 'tasks',
    path: '/cases/my-tasks',
    theme: 'emerald',
    shadow: 'rgba(16, 185, 129, 0.15)',
  },
  {
    icon: '/archive.png',
    labelKey: 'cases',
    path: '/cases',
    theme: 'amber',
    shadow: 'rgba(251, 146, 60, 0.15)',
  },
];

/**
 * QuickActionsBar
 *
 * Changes vs. original:
 *  1. Removed 350-line <style jsx> block — it silently does nothing in the
 *     App Router. All CSS moved to globals.css under the "QUICK ACTIONS BAR"
 *     section with properly scoped class names.
 *  2. `quickActions` array moved outside the component (never recreated).
 *  3. Labels are resolved inside `useMemo` so t() is only called when the
 *     locale changes, not on every render.
 *  4. Navigation onClick handlers use a single `useCallback`-stable factory.
 *  5. `theme` key replaces brittle index-based class names (action-btn-0 etc).
 *  6. `title` attribute removed — the visible <span> text is already the
 *     accessible name; a redundant title causes screen reader double-reading.
 *  7. Decorative elements have aria-hidden="true".
 */
function QuickActionsBar() {
  const router = useRouter();
  const { t } = useTranslations();

  // Resolve translated labels only when locale changes
  const quickActions = useMemo(
    () => ACTION_DEFINITIONS.map(def => ({
      ...def,
      label: t(`navigation.${def.labelKey}`),
    })),
    [t]
  );

  // Stable navigation handler — avoids a new closure per button per render
  const handleNavigate = useCallback(
    (path) => () => router.push(path),
    [router]
  );

  return (
    <div className="relative bg-gradient-to-br from-sidebar-accent/30 via-transparent to-transparent border-b border-sidebar-border/50">
      {/* Decorative elements — hidden from a11y tree */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" aria-hidden="true" />

      {/* Actions */}
      <div className="relative flex items-center justify-center gap-2 gap-x-4 px-2 md:px-6 py-3">
        {quickActions.map((action, index) => (
          <button
            key={action.path}
            type="button"
            onClick={handleNavigate(action.path)}
            className={`qa-btn qa-btn-${action.theme} relative flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-sm`}
            style={{
              animationDelay: `${index * 0.15}s`,
              boxShadow: `0 10px 15px -3px ${action.shadow}, 0 4px 6px -4px ${action.shadow}`,
            }}
          >
            <div className={`qa-icon-wrapper qa-icon-wrapper-${action.theme} relative w-7 h-7 flex items-center justify-center z-10`}>
              <Image
                src={action.icon}
                alt=""
                aria-hidden="true"
                width={36}
                height={36}
                className="object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 relative z-10"
              />
            </div>
            <span className="text-sm font-semibold group-hover:text-sidebar-foreground transition-all duration-300 relative z-10 group-hover:tracking-wide">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

export default QuickActionsBar;

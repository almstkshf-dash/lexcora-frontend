'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Color theme definitions — complete Tailwind class strings so the purger
 * never strips them. Add new themes here; all widgets inherit automatically.
 */
const WIDGET_THEMES = {
  purple: {
    header: 'bg-gradient-to-r from-purple-50/50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10 border-b border-purple-100 dark:border-purple-900/30',
    title: 'text-purple-900 dark:text-purple-100',
    badge: 'bg-purple-500',
  },
  amber: {
    header: 'bg-gradient-to-r from-amber-50/50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/10 border-b border-amber-100 dark:border-amber-900/30',
    title: 'text-amber-900 dark:text-amber-100',
    badge: 'bg-amber-600',
  },
  blue: {
    header: 'bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/10 border-b border-blue-100 dark:border-blue-900/30',
    title: 'text-blue-900 dark:text-blue-100',
    badge: 'bg-blue-500',
  },
  orange: {
    header: 'bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-900/10 dark:to-orange-800/10 border-b border-orange-100 dark:border-orange-900/30',
    title: 'text-orange-900 dark:text-orange-100',
    badge: 'bg-orange-700',
  },
}

/** Loading skeleton — shares the same card chrome as the real widget */
function WidgetSkeleton({ theme, title }) {
  const colors = WIDGET_THEMES[theme] || WIDGET_THEMES.blue
  return (
    <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none shadow-sm p-0 gap-0">
      <CardHeader className={`${colors.header} p-4`}>
        <CardTitle className={`${colors.title} text-lg`}>{title}</CardTitle>
      </CardHeader>
      <CardContent
        className="flex-1 p-4 space-y-4"
        role="status"
        aria-busy="true"
        aria-label="جارٍ التحميل"
      >
        <span className="sr-only">جارٍ التحميل...</span>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * DashboardWidgetCard
 *
 * Single shared shell for all home dashboard widget cards.
 * Replaces the 4× copy-pasted loading / error / empty / content JSX across
 * AppealsAndChallenges, CasePetitions, LastWeekSessions, SessionWithNoDecision.
 *
 * @param {string}          theme          - 'purple' | 'amber' | 'blue' | 'orange'
 * @param {string}          title          - Card header title (pre-translated)
 * @param {number}          count          - Badge count, shown when > 0
 * @param {string}          badgeAriaLabel - Accessible label for the count badge
 * @param {boolean}         isLoading      - SWR loading state
 * @param {Error|null}      error          - SWR error object
 * @param {string}          errorMessage   - Translated error message
 * @param {boolean}         isEmpty        - Whether the data list is empty
 * @param {string}          emptyMessage   - Translated empty state message
 * @param {React.ReactNode} children       - Rendered list items
 */
function DashboardWidgetCard({
  theme = 'blue',
  title,
  count = 0,
  badgeAriaLabel,
  isLoading,
  error,
  errorMessage,
  isEmpty,
  emptyMessage,
  children,
}) {
  const colors = WIDGET_THEMES[theme] || WIDGET_THEMES.blue

  if (isLoading) {
    return <WidgetSkeleton theme={theme} title={title} />
  }

  if (error) {
    return (
      <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none shadow-sm p-0 gap-0">
        <CardHeader className={`${colors.header} p-4`}>
          <CardTitle className={`${colors.title} text-lg flex items-center justify-center gap-3`}>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center text-red-500 dark:text-red-400" role="alert">
            {errorMessage}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden p-0 gap-0">
      <CardHeader className={`${colors.header} p-4`}>
        <CardTitle className={`${colors.title} text-lg flex items-center justify-center gap-3`}>
          <span>{title}</span>
          {count > 0 && (
            <span
              className={`relative flex items-center justify-center min-w-[24px] h-[24px] px-1.5 text-xs font-bold ${colors.badge} text-white rounded-full shadow-sm ring-2 ring-white dark:ring-gray-900`}
            >
              <span className="sr-only">{badgeAriaLabel}</span>
              <span className="relative z-10" aria-hidden="true">{count}</span>
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent
        className="flex-1 p-4 overflow-y-auto max-h-[600px] space-y-3 bg-gray-50/50 dark:bg-gray-800/20"
        role="list"
        aria-label={title}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-full min-h-[200px] text-center text-gray-500 dark:text-gray-400 py-4">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

export default DashboardWidgetCard

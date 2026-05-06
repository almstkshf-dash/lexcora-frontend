import { useTranslations } from '@/hooks/useTranslations'
import { formatDate } from '@/lib/dateUtils'

/**
 * Complete Tailwind class strings per color — must be full strings so
 * Tailwind's purger never strips them at build time.
 */
const COLOR_THEMES = {
  blue: {
    wrapper: 'border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/30',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 group-hover/item:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    label: 'text-blue-900 dark:text-blue-300',
  },
  purple: {
    wrapper: 'border-purple-100 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-50 dark:hover:bg-purple-900/30',
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 group-hover/item:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    label: 'text-purple-900 dark:text-purple-300',
  },
  red: {
    wrapper: 'border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/30',
    iconBg: 'bg-red-500/10 dark:bg-red-500/20 group-hover/item:bg-red-500/20',
    iconColor: 'text-red-600 dark:text-red-400',
    label: 'text-red-900 dark:text-red-300',
  },
}

const URGENCY_STYLES = {
  overdue: {
    circle: 'bg-red-600',
    pulse: 'bg-red-200/50 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  },
  urgent: {
    circle: 'bg-orange-600',
    pulse: 'bg-orange-200/50 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
  },
  safe: {
    circle: 'bg-green-700',
    pulse: 'bg-green-200/50 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
  },
}

/**
 * DeadlinePeriodRow
 *
 * Single reusable row for a legal deadline period (Objection / Appeal / Cassation).
 * Replaces the 3× copy-pasted ~40-line JSX blocks in AppealsAndChallengesItem.
 *
 * @param {string}           color   - 'blue' | 'purple' | 'red'
 * @param {React.ElementType} Icon   - Lucide icon component (passed as element type)
 * @param {string}           label   - Section label, e.g. "آخر موعد للتظلم" (pre-translated)
 * @param {string}           endDate - ISO deadline date string
 * @param {object|null}      info    - Result of calculateDaysRemaining(), or null
 */
function DeadlinePeriodRow({ color = 'blue', Icon, label, endDate, info }) {
  const { t } = useTranslations()
  const theme = COLOR_THEMES[color] || COLOR_THEMES.blue

  const urgencyKey = info?.isOverdue ? 'overdue' : info?.isUrgent ? 'urgent' : 'safe'
  const urgency = URGENCY_STYLES[urgencyKey]

  const statusLabel = info
    ? `${Math.abs(info.days)} ${t('home.days')} ${info.isOverdue ? t('home.overdue') : t('home.remaining')}`
    : undefined

  return (
    <div
      className={`flex items-start justify-between p-3 rounded-xl border ${theme.wrapper} transition-colors gap-3 group/item`}
      role="listitem"
    >
      {/* Icon + label + date */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`p-1.5 ${theme.iconBg} rounded-lg flex-shrink-0 transition-colors`}>
          <Icon className={`w-4 h-4 ${theme.iconColor}`} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-xs sm:text-sm font-semibold ${theme.label} break-words uppercase tracking-wider`}>
            {label}
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
            {formatDate(endDate)}
          </div>
        </div>
      </div>

      {/* Days-remaining badge */}
      {info && (
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm relative z-10 transition-colors ${urgency.circle}`}
              aria-hidden="true"
            >
              {Math.abs(info.days)}
            </div>
            <span className="sr-only">{statusLabel}</span>
            <div
              className={`absolute inset-[-4px] rounded-full animate-pulse ${urgency.pulse}`}
              aria-hidden="true"
            />
          </div>
          <span 
            className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-center ${urgency.text}`}
            aria-hidden="true"
          >
            {info.isOverdue ? t('home.overdue') : t('home.remaining')}
          </span>
        </div>
      )}
    </div>
  )
}

export default DeadlinePeriodRow

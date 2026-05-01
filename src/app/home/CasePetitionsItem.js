import { Calendar1, Clock, File, FileSpreadsheet, FileText, Info } from 'lucide-react'
import Link from 'next/link';
import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from '@/hooks/useTranslations'
import { DECISION_STATUS } from '@/lib/constants'
import { calculateDaysRemaining, formatDate } from '@/lib/dateUtils'

/**
 * Returns Tailwind color classes for a given decision status badge.
 * Falls back to a neutral style for null / unknown values (previously returned undefined).
 */
function getDecisionColor(decision) {
  switch (decision) {
    case DECISION_STATUS.REJECTED:
      return 'text-yellow-700 bg-yellow-100/80 dark:text-yellow-400 dark:bg-yellow-900/30'
    case DECISION_STATUS.ACCEPTED:
      return 'text-green-700 bg-green-100/80 dark:text-green-400 dark:bg-green-900/30'
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
  }
}

/**
 * Returns the translated label for a given decision status.
 * Falls back to t('home.unknown') for null / unknown values.
 */
function getDecisionStatus(decision, t) {
  switch (decision) {
    case DECISION_STATUS.REJECTED:
      return t('home.rejected')
    case DECISION_STATUS.ACCEPTED:
      return t('home.accepted')
    default:
      return t('home.unknown')
  }
}

/**
 * CasePetitionsItem
 *
 * Changes vs. original:
 *  1. IIFE inside JSX replaced with useMemo — eliminates the 240ms INP block
 *     caused by recalculating daysInfo inline on every render.
 *  2. getDecisionColor / getDecisionStatus now have default cases — previously
 *     both returned `undefined` for null/unknown decision values.
 *  3. Both helper functions moved outside the component so they are never
 *     recreated on render (they are pure functions with no closure deps).
 */
const CasePetitionsItem = React.memo(function CasePetitionsItem({ petition }) {
  const { t } = useTranslations()

  // Memoize the date calculation — was previously an IIFE inside JSX
  const daysInfo = useMemo(
    () => calculateDaysRemaining(petition.appeal_date),
    [petition.appeal_date]
  )

  const decisionColor = getDecisionColor(petition.decision)
  const decisionLabel = getDecisionStatus(petition.decision, t)

  return (
    <Card
      className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-300/50 dark:hover:border-amber-600/50 dark:bg-gray-900 dark:border-gray-800"
      role="listitem"
    >
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-2">

          {/* File Number */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <FileText className="w-4 h-4 flex-shrink-0 text-orange-500 dark:text-orange-400" aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.fileNumber')}:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{petition.file_number}</span>
          </div>

          {/* Case Topic */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <File className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.caseTopic')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{petition.case_topic}</span>
          </div>

          {/* Petition Type */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap pb-2 border-b border-gray-100 dark:border-gray-800">
            <FileSpreadsheet className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.petition')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{petition.type}</span>
          </div>

          {/* Date Details */}
          <div className="grid grid-cols-1 gap-2">

            {/* Submission Date */}
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <Calendar1 className="w-4 h-4 flex-shrink-0 text-purple-500 dark:text-purple-400" aria-hidden="true" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.submissionDate')}:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                {formatDate(petition.date, { year: 'numeric', month: 'short', day: 'numeric' }) || t('home.notSpecified')}
              </span>
            </div>

            {/* Last Date */}
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <Clock className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                {petition.decision === DECISION_STATUS.ACCEPTED
                  ? t('petitions.lastDateToRegisterCase')
                  : t('petitions.lastDateToAppeal')}:
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                {formatDate(petition.appeal_date, { year: 'numeric', month: 'short', day: 'numeric' }) || t('home.notSpecified')}
              </span>
            </div>

            {/* Days Remaining */}
            {daysInfo && (
              <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
                <Clock className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" aria-hidden="true" />
                <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.daysRemaining')}:</span>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${daysInfo.isOverdue ? 'bg-red-600' : daysInfo.isUrgent ? 'bg-orange-600' : 'bg-green-700'}`}
                    aria-hidden="true"
                  >
                    {Math.abs(daysInfo.days)}
                  </div>
                  <span className={`text-xs font-semibold truncate ${daysInfo.isOverdue ? 'text-red-600' : daysInfo.isUrgent ? 'text-orange-600' : 'text-green-700'}`}>
                    {Math.abs(daysInfo.days) === 1 ? t('home.day') : t('home.days')} {daysInfo.isOverdue ? t('home.overdue') : t('home.remaining')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer: decision badge + details link */}
          <div className="pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap">
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${decisionColor}`}>
              {decisionLabel}
            </div>
            <Link
              href={`/cases/${petition.case_id}/edit`}
              className="p-1.5 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-all duration-200 text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
              title={t('home.viewDetails')}
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

        </div>
      </CardContent>
    </Card>
  )
})

export default CasePetitionsItem

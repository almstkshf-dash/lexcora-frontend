import { Calendar1, Clock, File, FileSpreadsheet, FileText, Info } from 'lucide-react'
import Link from 'next/link'
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
        <div className="space-y-3">

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
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <FileSpreadsheet className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.petition')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{petition.type}</span>
          </div>

          {/* Date Details */}
          <div className="space-y-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">

            {/* Submission Date */}
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
              <Calendar1 className="w-4 h-4 flex-shrink-0 text-purple-500 dark:text-purple-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <span className="block font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                  {t('home.submissionDate')}
                </span>
                <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                  {formatDate(petition.date, { year: 'numeric', month: 'short', day: 'numeric' }) || t('home.notSpecified')}
                </span>
              </div>
            </div>

            {/* Last Date */}
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <span className="block font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                  {petition.decision === DECISION_STATUS.ACCEPTED
                    ? t('petitions.lastDateToRegisterCase')
                    : t('petitions.lastDateToAppeal')}
                </span>
                <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                  {formatDate(petition.appeal_date, { year: 'numeric', month: 'short', day: 'numeric' }) || t('home.notSpecified')}
                </span>
              </div>
            </div>

            {/* Days Remaining — now driven by memoized daysInfo, not an IIFE */}
            {daysInfo && (
              <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <span className="block font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                    {t('home.daysRemaining')}
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 flex items-center gap-2 text-sm font-medium mt-0.5">
                    {daysInfo.isOverdue && (
                      <span className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded flex items-center font-bold">
                        ⚠️ {t('home.overdue')}
                      </span>
                    )}
                    <div
                      className="relative inline-flex items-center justify-center flex-shrink-0"
                      aria-label={`${Math.abs(daysInfo.days)} ${Math.abs(daysInfo.days) === 1 ? t('home.day') : t('home.days')} ${t('home.daysRemaining')}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white relative z-10 transition-colors ${daysInfo.isOverdue ? 'bg-red-600' : daysInfo.isUrgent ? 'bg-orange-600' : 'bg-green-700'
                          }`}
                        aria-hidden="true"
                      >
                        {Math.abs(daysInfo.days)}
                      </div>
                      <div
                        className={`absolute inset-[-4px] rounded-full animate-pulse ${daysInfo.isOverdue
                            ? 'bg-red-200/50 dark:bg-red-900/30'
                            : daysInfo.isUrgent
                              ? 'bg-orange-200/50 dark:bg-orange-900/30'
                              : 'bg-green-200/50 dark:bg-green-900/30'
                          }`}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {Math.abs(daysInfo.days) === 1 ? t('home.day') : t('home.days')}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer: decision badge + details link */}
          <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${decisionColor}`}>
              {decisionLabel}
            </div>
            <Link
              href={`/cases/${petition.case_id}/edit`}
              className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
            >
              <Info className="w-4 h-4" aria-hidden="true" />
              <span>{t('home.viewDetails')}</span>
            </Link>
          </div>

        </div>
      </CardContent>
    </Card>
  )
})

export default CasePetitionsItem
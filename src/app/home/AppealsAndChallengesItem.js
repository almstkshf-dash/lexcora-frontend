import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Hash, FileText, User, Clock, Calendar, File, Scale, AlertTriangle } from 'lucide-react'
import Actions from './Actions'
import DeadlinePeriodRow from './DeadlinePeriodRow'
import { useTranslations } from '@/hooks/useTranslations'
import { formatDate, calculateDaysRemaining } from '@/lib/dateUtils'

/**
 * AppealsAndChallengesItem
 *
 * Changes vs. original:
 *  1. Removed 22-line data-shape comment block (moved to API types).
 *  2. Removed unused `tSessions` hook call.
 *  3. Removed `getDeadlineBadgeStyle` — was defined but never referenced in JSX.
 *  4. Removed `getMostUrgent` — was computed on every render but never used in JSX.
 *  5. All three deadline blocks (Objection / Appeal / Cassation) replaced by
 *     <DeadlinePeriodRow /> — removes ~120 lines of duplicated JSX.
 *  6. Wrapped in React.memo to prevent re-renders from parent list re-renders.
 */
const AppealsAndChallengesItem = React.memo(function AppealsAndChallengesItem({ session }) {
  const { t } = useTranslations()

  // Derive display values once
  const displayRuling = session?.ruling || t('home.ruling')
  const displayTopic = session?.topic || t('home.notSpecified')
  const displayClientParties = session?.clientParties || []
  const displayFileNumber = session?.file_number
  const displayCaseNumber = session?.case_number

  // Memoize deadline calculations — these run date math on every render otherwise
  const objectionInfo = useMemo(
    () => (session?.has_objection ? calculateDaysRemaining(session.objection_end_date) : null),
    [session?.has_objection, session?.objection_end_date]
  )
  const appealInfo = useMemo(
    () => (session?.has_appeal ? calculateDaysRemaining(session.appeal_end_date) : null),
    [session?.has_appeal, session?.appeal_end_date]
  )
  const cassationInfo = useMemo(
    () => (session?.has_cassation ? calculateDaysRemaining(session.cassation_end_date) : null),
    [session?.has_cassation, session?.cassation_end_date]
  )

  const hasAnyPeriod = session?.has_objection || session?.has_appeal || session?.has_cassation

  return (
    <Card
      className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-300/50 dark:hover:border-purple-600/50 dark:bg-gray-900 dark:border-gray-800"
      role="listitem"
    >
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-2">

          {/* Ruling Date */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <Clock className="w-4 h-4 flex-shrink-0 text-purple-500 dark:text-purple-400" aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.rulingDate')}:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{formatDate(session?.session_date)}</span>
          </div>

          {/* File Number */}
          {displayFileNumber && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <File className="w-4 h-4 flex-shrink-0 text-orange-600 dark:text-orange-300" aria-hidden="true" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.fileNumber')}:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayFileNumber}</span>
            </div>
          )}

          {/* Case Number */}
          {displayCaseNumber && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <FileText className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.caseNo')}:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayCaseNumber}</span>
            </div>
          )}

          {/* Client Parties */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <User className="w-4 h-4 flex-shrink-0 text-amber-500 dark:text-amber-400" aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.clientNames')}:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {displayClientParties.length > 0 ? displayClientParties.join('، ') : t('home.notSpecified')}
            </span>
          </div>

          {/* Ruling */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap pb-2 border-b border-gray-100 dark:border-gray-800">
            <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.ruling')}:</span>
            <span className="font-semibold text-purple-900 dark:text-purple-300 truncate bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
              {displayRuling}
            </span>
          </div>

          {/* Legal Deadline Periods — replaced 3× copy-pasted blocks with DeadlinePeriodRow */}
          {hasAnyPeriod && (
            <div className="mt-3 sm:mt-4 space-y-3" role="list" aria-label={t('home.legalPeriods')}>
              {session?.has_objection && (
                <DeadlinePeriodRow
                  color="blue"
                  Icon={FileText}
                  label={`${t('home.lastDateFor')} ${t('home.objection')}`}
                  endDate={session.objection_end_date}
                  info={objectionInfo}
                />
              )}
              {session?.has_appeal && (
                <DeadlinePeriodRow
                  color="purple"
                  Icon={Scale}
                  label={`${t('home.lastDateFor')} ${t('home.appeal')}`}
                  endDate={session.appeal_end_date}
                  info={appealInfo}
                />
              )}
              {session?.has_cassation && (
                <DeadlinePeriodRow
                  color="red"
                  Icon={AlertTriangle}
                  label={`${t('home.lastDateFor')} ${t('home.cassation')}`}
                  endDate={session.cassation_end_date}
                  info={cassationInfo}
                />
              )}
            </div>
          )}

          {/* No legal periods fallback */}
          {!hasAnyPeriod && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                {t('home.noLegalPeriods')}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Actions theme="purple" caseId={session?.case_id} />
          </div>

        </div>
      </CardContent>
    </Card>
  )
})

export default AppealsAndChallengesItem

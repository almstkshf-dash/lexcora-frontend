import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hash, FileText, User, Clock, Calendar, AlertTriangle, File, Scale } from 'lucide-react'
import Actions from './Actions'
import { useTranslations } from '@/hooks/useTranslations'
import { formatDate, calculateDaysRemaining } from '@/lib/dateUtils'

function AppealsAndChallengesItem({ session }) {
  // data =       {
  //           "id": 81,
  //           "case_id": 150,
  //           "session_date": "2025-10-28 01:00:00",
  //           "ruling": "test2",
  //           "case_number": "980",
  //           "file_number": "20251027074715",
  //           "topic": "رأي عام طبعا",
  //           "objection_days": null,
  //           "appeal_days": 30,
  //           "cassation_days": null,
  //           "legal_period_name": "التجارية والمدنية والعمالية اقل من 500,000 درهم",
  //           "objection_end_date": null,
  //           "appeal_end_date": "2025-11-27 01:00:00",
  //           "cassation_end_date": null,
  //           "has_objection": false,
  //           "has_appeal": true,
  //           "has_cassation": false,
  //           "clientParties": [
  //               "تامر"
  //           ]
  //       },
  const { t } = useTranslations()
  const tSessions = useTranslations('sessions')

  // Get deadline badge styles
  const getDeadlineBadgeStyle = (daysInfo) => {
    if (!daysInfo) return { bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-gray-400' }
    if (daysInfo.isOverdue) return { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-400' }
    if (daysInfo.isUrgent) return { bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-400' }
    return { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-400' }
  }

  // Format ruling text
  const displayRuling = session?.ruling || t('home.ruling')
  const displayTopic = session?.topic || t('home.notSpecified')
  const displayClientParties = session?.clientParties || []
  const displayFileNumber = session?.file_number
  const displayCaseNumber = session?.case_number

  // Calculate deadline info for each type
  const objectionInfo = session?.has_objection ? calculateDaysRemaining(session.objection_end_date) : null
  const appealInfo = session?.has_appeal ? calculateDaysRemaining(session.appeal_end_date) : null
  const cassationInfo = session?.has_cassation ? calculateDaysRemaining(session.cassation_end_date) : null

  // Find the most urgent deadline
  const getMostUrgent = () => {
    const deadlines = [
      { name: t('home.objection'), info: objectionInfo, date: session?.objection_end_date, days: session?.objection_days },
      { name: t('home.appeal'), info: appealInfo, date: session?.appeal_end_date, days: session?.appeal_days },
      { name: t('home.cassation'), info: cassationInfo, date: session?.cassation_end_date, days: session?.cassation_days }
    ].filter(d => d.info !== null)

    if (deadlines.length === 0) return null

    // Sort by days remaining (most urgent first)
    deadlines.sort((a, b) => a.info.days - b.info.days)
    return deadlines[0]
  }

  const mostUrgent = getMostUrgent()

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-300/50 dark:hover:border-purple-600/50 dark:bg-gray-900 dark:border-gray-800">
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-3">
          {/* Ruling Date */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <Clock className="w-4 h-4 flex-shrink-0 text-purple-500 dark:text-purple-400" />
            <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.rulingDate')}:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatDate(session?.session_date)}
            </span>
          </div>

          {/* File Number */}
          {displayFileNumber && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <File className="w-4 h-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
              <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.fileNumber')}:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 break-all">{displayFileNumber}</span>
            </div>
          )}

          {/* Case Number */}
          {displayCaseNumber && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <FileText className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
              <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.caseNumber')}:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 break-all">{displayCaseNumber}</span>
            </div>
          )}

          {/* Client Parties */}
          <div className="flex items-start gap-2.5 text-sm text-gray-500 dark:text-gray-400">
            <User className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
            <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
              <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.clientNames')}:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 break-words">
                {displayClientParties.length > 0 ? displayClientParties.join('، ') : t('home.notSpecified')}
              </span>
            </div>
          </div>

          {/* Ruling */}
          <div className="flex items-start gap-2.5 text-sm text-gray-500 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
              <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.ruling')}:</span>
              <span className="font-semibold text-purple-900 dark:text-purple-300 break-words bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">{displayRuling}</span>
            </div>
          </div>

          {/* Legal Periods Section - Compact Design */}
          {(session?.has_objection || session?.has_appeal || session?.has_cassation) && (
            <div className="mt-3 sm:mt-4">
              <div className="space-y-3">
                {/* Objection (تظلم) */}
                {session?.has_objection && (
                  <div className="flex items-start justify-between p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors gap-3 group/item">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-1.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex-shrink-0 group-hover/item:bg-blue-500/20 transition-colors">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300 break-words uppercase tracking-wider">{t('home.lastDateFor')} {t('home.objection')}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{formatDate(session.objection_end_date)}</div>
                      </div>
                    </div>
                    {objectionInfo && (
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm relative z-10 transition-colors ${
                            objectionInfo.isOverdue 
                              ? 'bg-red-600' 
                              : objectionInfo.isUrgent 
                                ? 'bg-orange-600' 
                                : 'bg-green-700'
                          }`}>
                            {Math.abs(objectionInfo.days)}
                          </div>
                          <div className={`absolute inset-[-4px] rounded-full animate-pulse ${
                            objectionInfo.isOverdue ? 'bg-red-200/50 dark:bg-red-900/30' : objectionInfo.isUrgent ? 'bg-orange-200/50 dark:bg-orange-900/30' : 'bg-green-200/50 dark:bg-green-900/30'
                          }`}></div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-center ${
                          objectionInfo.isOverdue 
                            ? 'text-red-600 dark:text-red-400' 
                            : objectionInfo.isUrgent 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-green-600 dark:text-green-400'
                        }`}>
                          {objectionInfo.isOverdue ? t('home.overdue') : t('home.remaining')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Appeal (استئناف) */}
                {session?.has_appeal && (
                  <div className="flex items-start justify-between p-3 rounded-xl border border-purple-100 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors gap-3 group/item">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-1.5 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg flex-shrink-0 group-hover/item:bg-purple-500/20 transition-colors">
                        <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-300 break-words uppercase tracking-wider">{t('home.lastDateFor')} {t('home.appeal')}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{formatDate(session.appeal_end_date)}</div>
                      </div>
                    </div>
                    {appealInfo && (
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm relative z-10 transition-colors ${
                            appealInfo.isOverdue 
                              ? 'bg-red-600' 
                              : appealInfo.isUrgent 
                                ? 'bg-orange-600' 
                                : 'bg-green-700'
                          }`}>
                            {Math.abs(appealInfo.days)}
                          </div>
                          <div className={`absolute inset-[-4px] rounded-full animate-pulse ${
                            appealInfo.isOverdue ? 'bg-red-200/50 dark:bg-red-900/30' : appealInfo.isUrgent ? 'bg-orange-200/50 dark:bg-orange-900/30' : 'bg-green-200/50 dark:bg-green-900/30'
                          }`}></div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-center ${
                          appealInfo.isOverdue 
                            ? 'text-red-600 dark:text-red-400' 
                            : appealInfo.isUrgent 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-green-600 dark:text-green-400'
                        }`}>
                          {appealInfo.isOverdue ? t('home.overdue') : t('home.remaining')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Cassation (طعن) */}
                {session?.has_cassation && (
                  <div className="flex items-start justify-between p-3 rounded-xl border border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors gap-3 group/item">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-1.5 bg-red-500/10 dark:bg-red-500/20 rounded-lg flex-shrink-0 group-hover/item:bg-red-500/20 transition-colors">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-red-900 dark:text-red-300 break-words uppercase tracking-wider">{t('home.lastDateFor')} {t('home.cassation')}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{formatDate(session.cassation_end_date)}</div>
                      </div>
                    </div>
                    {cassationInfo && (
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm relative z-10 transition-colors ${
                            cassationInfo.isOverdue 
                              ? 'bg-red-600' 
                              : cassationInfo.isUrgent 
                                ? 'bg-orange-600' 
                                : 'bg-green-700'
                          }`}>
                            {Math.abs(cassationInfo.days)}
                          </div>
                          <div className={`absolute inset-[-4px] rounded-full animate-pulse ${
                            cassationInfo.isOverdue ? 'bg-red-200/50 dark:bg-red-900/30' : cassationInfo.isUrgent ? 'bg-orange-200/50 dark:bg-orange-900/30' : 'bg-green-200/50 dark:bg-green-900/30'
                          }`}></div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-center ${
                          cassationInfo.isOverdue 
                            ? 'text-red-600 dark:text-red-400' 
                            : cassationInfo.isUrgent 
                              ? 'text-orange-600 dark:text-orange-400' 
                              : 'text-green-600 dark:text-green-400'
                        }`}>
                          {cassationInfo.isOverdue ? t('home.overdue') : t('home.remaining')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No legal periods */}
          {!session?.has_objection && !session?.has_appeal && !session?.has_cassation && (
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
}

export default AppealsAndChallengesItem

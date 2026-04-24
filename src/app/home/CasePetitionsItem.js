import { Calendar1, Clock, File, FileSpreadsheet, FileText, Info } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from '@/hooks/useTranslations'
import { DECISION_STATUS } from '@/lib/constants'
import { calculateDaysRemaining, formatDate } from '@/lib/dateUtils'

function CasePetitionsItem({ petition }) {
  const { t } = useTranslations()

  // Get decision status color
  const getDecisionColor = (decision) => {
    switch (decision) {
      case DECISION_STATUS.REJECTED: return 'text-yellow-700 bg-yellow-100/80 dark:text-yellow-400 dark:bg-yellow-900/30'
      case DECISION_STATUS.ACCEPTED: return 'text-green-700 bg-green-100/80 dark:text-green-400 dark:bg-green-900/30'
    }
  }

  // Get decision status text
  const getDecisionStatus = (decision) => {
    switch (decision) {
      case DECISION_STATUS.REJECTED: return t('home.rejected')
      case DECISION_STATUS.ACCEPTED: return t('home.accepted')
    }
  }

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-300/50 dark:hover:border-amber-600/50 dark:bg-gray-900 dark:border-gray-800">
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-3">
          {/* File Number */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <FileText className="w-4 h-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
            <span className="whitespace-nowrap">{t('home.fileNumber')}:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 break-all">{petition.file_number}</span>
          </div>

          {/* Case Topic */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <File className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{t('home.caseTopic')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{petition.case_topic}</span>
          </div>

          {/* Petition Type */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <FileSpreadsheet className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
            <span className="whitespace-nowrap">{t('home.petition')}:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{petition.type}</span>
          </div>

          {/* Date Details Section */}
          <div className="space-y-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
            {/* Submission Date */}
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
              <Calendar1 className="w-4 h-4 flex-shrink-0 text-purple-500 dark:text-purple-400" />
              <div className="min-w-0 flex-1">
                <span className="block font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('home.submissionDate')}</span>
                <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{formatDate(petition.date, { year: 'numeric', month: 'short', day: 'numeric' }) || t('home.notSpecified')}</span>
              </div>
            </div>

            {/* Last Date */}
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
              <div className="min-w-0 flex-1">
                <span className="block font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">
                  {petition.decision === DECISION_STATUS.ACCEPTED ? t('petitions.lastDateToRegisterCase') : t('petitions.lastDateToAppeal')}
                </span>
                <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{formatDate(petition.appeal_date, { year: 'numeric', month: 'short', day: 'numeric' }) || t('home.notSpecified')}</span>
              </div>
            </div>

            {/* Days Remaining */}
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <span className="block font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">{t('home.daysRemaining')}</span>
                  <span className="text-gray-800 dark:text-gray-200 flex items-center gap-2 text-sm font-medium mt-0.5">
                    {(() => {
                      const daysInfo = calculateDaysRemaining(petition.appeal_date);
                      if (!daysInfo) return null;
                      
                      const { days: daysRemaining, isOverdue, isUrgent } = daysInfo;
                      
                      return (
                        <>
                          {isOverdue && <span className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded flex items-center font-bold">⚠️ {t('home.overdue')}</span>}
                          <div className="relative inline-flex items-center justify-center flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white relative z-10 transition-colors ${
                              isOverdue ? 'bg-red-500' : isUrgent ? 'bg-orange-500' : 'bg-green-500'
                            }`}>
                              {Math.abs(daysRemaining)}
                            </div>
                            <div className={`absolute inset-[-4px] rounded-full animate-pulse ${
                              isOverdue ? 'bg-red-200/50 dark:bg-red-900/30' : isUrgent ? 'bg-orange-200/50 dark:bg-orange-900/30' : 'bg-green-200/50 dark:bg-green-900/30'
                            }`}></div>
                          </div>
                          <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">{Math.abs(daysRemaining) === 1 ? t('home.day') : t('home.days')}</span>
                        </>
                      );
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        
          {/* Action Button */}
          <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getDecisionColor(petition.decision)}`}>
              {getDecisionStatus(petition.decision)}
            </div>
            <Link 
              href={`/cases/${petition.case_id}/edit`}
              className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
            >
              <Info className="w-4 h-4" />
              <span>{t('home.viewDetails')}</span>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CasePetitionsItem
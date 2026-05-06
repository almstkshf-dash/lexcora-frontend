import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Hash, FileText, User, Clock, Calendar, Pen } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'
import EditSessionModal from '@/app/cases/sessions/EditSessionModal'
import { formatDate, formatTime } from '@/lib/dateUtils'

function SessionWithNoDecisionItem({ 
  session,
  title, 
  date, 
  caseNumber, 
  clientName,
  time
}) {
  const { t } = useTranslations()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Handle both direct props (for backward compatibility) and session object
  const sessionData = session || {
    title,
    date,
    caseNumber,
    clientName,
    time
  }

  const getDegreeBadge = (degree) => {
    if (!degree || degree === "0") {
      return null
    }
    
    const degreeConfig = {
      appeal: { label: t('home.appeal'), color: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
      first_instance: { label: t('home.firstInstance'), color: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300' },
      cassation: { label: t('home.cassation'), color: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' }
    }
    
    return degreeConfig[degree] || { label: degree, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300' }
  }

  // Extract data from API response or use props
  const displayDate = session ? formatDate(session.session_date) : sessionData.date
  const displayTime = session ? formatTime(session.session_date) : sessionData.time
  const displayCaseNumber = session ? session.case_number : sessionData.caseNumber
  const displayClientName = session ? (session.clientParties?.[0] || t('home.notSpecified')) : sessionData.clientName
  const displayDegree = session ? session.degree : sessionData.degree
  const displayFileNumber = session ? session.file_number : sessionData.fileNumber

  const degreeInfo = getDegreeBadge(displayDegree)

  return (
    <>
      <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-orange-300/50 dark:hover:border-orange-600/50 dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
                <FileText className="w-4 h-4 flex-shrink-0 text-orange-600 dark:text-orange-300" aria-hidden="true" />
                <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.fileNumber')}: </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayFileNumber || t('home.notSpecified')}</span>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
                <Calendar className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.sessionDate')}: </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayDate}</span>
              </div>

              {displayTime && (
                <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
                  <Clock className="w-4 h-4 flex-shrink-0 text-orange-600 dark:text-orange-300" aria-hidden="true" />
                  <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.sessionTime')}: </span>
                  <span className="font-semibold text-orange-700 dark:text-orange-300 truncate">{displayTime}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
                <Hash className="w-4 h-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.caseNumber')}: </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayCaseNumber}</span>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
                <User className="w-4 h-4 flex-shrink-0 text-amber-500 dark:text-amber-400" aria-hidden="true" />
                <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.firstInstanceClient')}: </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayClientName}</span>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
                <Pen className="w-4 h-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.decision')}: </span>
                <span className="font-bold text-orange-700 dark:text-orange-300 truncate bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                  {session.is_judgment_deferred ? t('home.judgmentDeferred') : session.is_judgment_reserved ? t('home.judgmentReserved') : t('home.noDecisionYet')}
                </span>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="ml-auto p-1.5 bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded transition-colors group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30"
                  title={t('home.editSession')}
                  aria-label={t('home.editSession')}
                >
                  <Pen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only">{t('home.editSession')}</span>
                </button>
              </div>
            </div>
        </CardContent>
      </Card>
      
      {session?.id && (
        <EditSessionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          sessionId={session.id}
        />
      )}
    </>
  )
}

export default SessionWithNoDecisionItem
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
      first_instance: { label: t('home.firstInstance'), color: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400' },
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
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <FileText className="w-4 h-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
              <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.fileNumber')}: </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayFileNumber || t('home.notSpecified')}</span>
            </div>

            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.sessionDate')}: <span className="text-gray-900 dark:text-gray-100">{displayDate}</span></span>
              {displayTime && <span className="text-orange-500 dark:text-orange-400 font-semibold whitespace-nowrap">• {displayTime}</span>}
            </div>
            
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <Hash className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.caseNumber')}: </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayCaseNumber}</span>
              {degreeInfo && (
                <Badge className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${degreeInfo.color}`}>
                  {degreeInfo.label}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.client')}: </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayClientName}</span>
            </div>
            
            
            <div className="flex items-start sm:items-center justify-between gap-2.5 text-sm text-orange-600 dark:text-orange-400 flex-col sm:flex-row pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="font-bold bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded text-orange-700 dark:text-orange-300">  {session.is_judgment_deferred ? t('home.judgmentDeferred') : session.is_judgment_reserved ? t('home.judgmentReserved') : t('home.noDecisionYet')}</span>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors self-end sm:self-auto flex-shrink-0 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30"
                title={t('home.editSession')}
              >
                <Pen className="w-4 h-4" />
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
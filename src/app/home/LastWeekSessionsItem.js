import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hash, FileText, User, Clock, Calendar, Pen } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'
import EditSessionModal from '@/app/cases/sessions/EditSessionModal'
import { formatDate, formatTime } from '@/lib/dateUtils'

function LastWeekSessionsItem({ 
  session,
  title, 
  date, 
  caseNumber, 
  clientName,
  status,
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
    status,
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

  const getSessionStatus = (sessionDate, decision) => {
    const now = new Date()
    const sessionDateTime = new Date(sessionDate)
    
    if (decision) {
      return 'completed'
    } else if (sessionDateTime > now) {
      return 'upcoming'
    } else {
      return 'postponed'
    }
  }

  // Extract data from API response or use props
  const displayTitle = session ? (session.decision || t('home.noDecision')) : sessionData.title
  const displayDate = session ? formatDate(session.session_date) : sessionData.date
  const displayTime = session ? formatTime(session.session_date) : sessionData.time
  const displayCaseNumber = session ? session.case_number : sessionData.caseNumber
  const displayClientName = session ? (session.clientParties?.[0] || t('home.notSpecified')) : sessionData.clientName
  const displayDegree = session ? session.degree : sessionData.degree
  const displayFileNumber = session ? session.file_number : sessionData.fileNumber

  const degreeInfo = getDegreeBadge(displayDegree)

  return (
    <>
      <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300/50 dark:hover:border-blue-600/50 dark:bg-gray-900 dark:border-gray-800">
      <CardContent className="p-4 sm:p-5">
     
        <div className="grid grid-cols-1 gap-2">
          {displayFileNumber && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <FileText className="w-4 h-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.fileNumber')}: </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayFileNumber}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <Calendar className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.sessionDate')}: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayDate}</span>
          </div>
          
          {displayTime && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <Clock className="w-4 h-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.sessionTime')}: </span>
              <span className="font-semibold text-orange-600 dark:text-orange-400 truncate">{displayTime}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <Hash className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.caseNo')}: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayCaseNumber}</span>
            {degreeInfo && (
              <Badge className={`ml-2 text-[10px] font-semibold px-1.5 py-0 rounded-full truncate ${degreeInfo.color}`}>
                {degreeInfo.label}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap pt-2 border-t border-gray-100 dark:border-gray-800">
            <User className="w-4 h-4 flex-shrink-0 text-amber-500 dark:text-amber-400" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.client')}: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate flex-1">{displayClientName}</span>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1.5 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-all duration-200 text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
              title={t('home.editSession')}
            >
              <Pen className="w-3.5 h-3.5" />
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

export default LastWeekSessionsItem
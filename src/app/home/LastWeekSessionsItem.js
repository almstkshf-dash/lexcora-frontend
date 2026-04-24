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

  const degreeInfo = getDegreeBadge(displayDegree)

  return (
    <>
      <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300/50 dark:hover:border-blue-600/50 dark:bg-gray-900 dark:border-gray-800">
      <CardContent className="p-4 sm:p-5">
     
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <Clock className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
            <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.sessionDate')}: <span className="text-gray-900 dark:text-gray-100">{displayDate}</span></span>
            {displayTime && <span className="text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap">• {displayTime}</span>}
          </div>
          
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.caseNumber')}: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 break-all">{displayCaseNumber}</span>
            {degreeInfo && (
              <Badge className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${degreeInfo.color}`}>
                {degreeInfo.label}
              </Badge>
            )}
          </div>
          
          <div className="flex items-start sm:items-center justify-between gap-2.5 text-sm text-gray-500 dark:text-gray-400 flex-col sm:flex-row border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 flex-wrap">
              <User className="w-4 h-4 flex-shrink-0 text-amber-500 dark:text-amber-400" />
              <span className="whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">{t('home.client')}: </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 break-words">{displayClientName}</span>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 text-blue-600 dark:text-blue-400 self-end sm:self-auto flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
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

export default LastWeekSessionsItem
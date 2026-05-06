import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hash, FileText, User, Clock, Calendar, AlertTriangle, File } from 'lucide-react'
import Actions from './Actions'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguage } from '@/contexts/LanguageContext'

const SessionsWithDecisionItem = React.memo(function SessionsWithDecisionItem({ 
  session,
  title, 
  date, 
  caseNumber, 
  clientName,
  time
}) {
  // Translation hooks
  const { t } = useTranslations()
  const tCaseTypes = useTranslations('caseTypes')
  const tSessions = useTranslations('sessions')
  const { language } = useLanguage()
  
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
      appeal: { label: tCaseTypes('degrees.appeal'), color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
      first_instance: { label: tCaseTypes('degrees.first_instance'), color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
      cassation: { label: tCaseTypes('degrees.cassation'), color: 'bg-red-100 text-red-800 hover:bg-red-200' }
    }
    
    return degreeConfig[degree] || { label: degree, color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' }
  }

  // Helper function to get translated case type
  const getCaseTypeTranslation = (caseType) => {
    if (!caseType) return t('common.notSpecified')
    
    // If we have both Arabic and English in the session object, use the appropriate one
    if (language === 'ar' && session?.case_type_ar) {
      return session.case_type_ar
    } else if (language === 'en' && session?.case_type_en) {
      return session.case_type_en
    }
    
    // Fallback to translation keys for common case types
    const caseTypeKey = caseType.toLowerCase().trim()
    const translationKey = `types.${caseTypeKey}`
    
    // Try to get translation, fallback to original value
    const translation = tCaseTypes(translationKey)
    return translation !== translationKey ? translation : caseType
  }

  // Helper functions to format API data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ar-AE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Calculate deadline based on case type
  const calculateDeadline = (sessionDate, caseType) => {
    const sessionDateTime = new Date(sessionDate)
    const deadlineDays = caseType?.toLowerCase().trim() === 'criminal' ? 15 : 30
    const deadlineDate = new Date(sessionDateTime)
    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays)
    
    const now = new Date()
    const daysRemaining = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
    
    return {
      deadlineDate: formatDate(deadlineDate),
      daysRemaining: daysRemaining,
      isOverdue: daysRemaining < 0,
      isUrgent: daysRemaining <= 7 && daysRemaining > 0
    }
  }

  // Extract data from API response or use props
  const displayDate = session ? formatDate(session.session_date) : sessionData.date
  const displayTime = session ? formatTime(session.session_date) : sessionData.time
  const displayCaseNumber = session ? session.case_number : sessionData.caseNumber
  const displayClientParties = session ? (session.clientParties || []) : (sessionData.clientName ? [sessionData.clientName] : [])
  const displayOpponentParties = session ? (session.opponentParties || []) : []
  const displayDegree = session ? session.degree : sessionData.degree
  const displayTopic = session ? session.topic : sessionData.topic
  const displayCaseType = session ? session.case_type_en : sessionData.caseType
  const displayCaseTypeTranslated = getCaseTypeTranslation(displayCaseType)

  // Memoize expensive derived values — deadline math + badge config run
  // on every render otherwise, multiplied across every list item.
  const degreeInfo = useMemo(
    () => getDegreeBadge(displayDegree),
    [displayDegree] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const deadlineInfo = useMemo(
    () => session ? calculateDeadline(session.session_date, session.case_type_en) : null,
    [session?.session_date, session?.case_type_en] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Create title with deadline information
  const createDeadlineTitle = () => {
    if (!deadlineInfo) return displayTopic || 'غير محدد'
    
    const { deadlineDate, daysRemaining, isOverdue, isUrgent } = deadlineInfo
    const statusText = isOverdue 
      ? `متأخر ${Math.abs(daysRemaining)} يوم` 
      : `${daysRemaining} يوم متبقي`
    
    return `${displayTopic || 'غير محدد'} • آخر موعد: ${deadlineDate} (${statusText})`
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02] dark:bg-gray-900 dark:border-gray-700">
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-2">
          
          {/* Ruling Date */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <Clock className="w-4 h-4 flex-shrink-0 text-purple-500 dark:text-purple-400" aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.rulingDate')}: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayDate}</span>
            {displayTime && <span className="text-purple-600 dark:text-purple-400 font-semibold truncate">• {displayTime}</span>}
          </div>
          
          {/* File Number */}
          {session?.file_number && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <File className="w-4 h-4 flex-shrink-0 text-orange-600 dark:text-orange-300" aria-hidden="true" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.fileNumber')}: </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{session.file_number}</span>
            </div>
          )}

          {/* Case Number */}
          {session?.case_number && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <FileText className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.caseNo')}: </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayCaseNumber}</span>
              {degreeInfo && (
                <Badge className={`ml-2 truncate flex-shrink-0 ${degreeInfo.color}`}>
                  {degreeInfo.label}
                </Badge>
              )}
            </div>
          )}
          
          {/* Client Names */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <User className="w-4 h-4 flex-shrink-0 text-amber-500 dark:text-amber-400" aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.clientNames')}: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {displayClientParties.length > 0 ? displayClientParties.join('، ') : t('common.notSpecified')}
            </span>
          </div>

          {/* Ruling */}
          {session?.decision && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap pb-2 border-b border-gray-100 dark:border-gray-800">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.ruling')}: </span>
              <span className="font-semibold text-green-900 dark:text-green-300 truncate bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                {session.decision}
              </span>
            </div>
          )}

          {/* Legal Periods */}
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <Calendar className={`w-4 h-4 flex-shrink-0 ${deadlineInfo?.isUrgent ? 'animate-pulse text-orange-600 dark:text-orange-300' : 'text-purple-500'}`} aria-hidden="true" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{t('home.legalPeriodsSpecified')}: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {deadlineInfo ? `(${deadlineInfo.deadlineDate})` : tSessions('labels.notCalculated')}
            </span>
            {deadlineInfo && (
               <div className="flex items-center gap-1.5 ml-2">
                 <div 
                   className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${deadlineInfo.isOverdue ? 'bg-red-600' : deadlineInfo.isUrgent ? 'bg-orange-600' : 'bg-green-700'}`}
                   aria-hidden="true"
                 >
                   {Math.abs(deadlineInfo.daysRemaining)}
                 </div>
                 <span className="sr-only">
                    {Math.abs(deadlineInfo.daysRemaining)} {t('home.days')} {deadlineInfo.isOverdue ? tSessions('labels.overdue') : tSessions('labels.remaining')}
                 </span>
                 <span 
                   className={`text-xs font-semibold truncate ${deadlineInfo.isOverdue ? 'text-red-600' : deadlineInfo.isUrgent ? 'text-orange-700' : 'text-green-700'}`}
                   aria-hidden="true"
                 >
                   {deadlineInfo.isOverdue ? tSessions('labels.overdue') : tSessions('labels.remaining')}
                 </span>
               </div>
            )}
          </div>
          <Actions theme="red" sessionId={session?.id} />   
        
        </div>
      </CardContent>
    </Card>
  )
})

export default SessionsWithDecisionItem
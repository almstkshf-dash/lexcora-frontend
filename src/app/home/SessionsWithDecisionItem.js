import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hash, FileText, User, Clock, Calendar, AlertTriangle, File } from 'lucide-react'
import Actions from './Actions'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguage } from '@/contexts/LanguageContext'
import { se } from 'date-fns/locale'

function SessionsWithDecisionItem({ 
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

  const degreeInfo = getDegreeBadge(displayDegree)
  const deadlineInfo = session ? calculateDeadline(session.session_date, session.case_type_en) : null

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
      <CardContent className="p-4">
        <div className="flex items-center justify-center mb-4 p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-red-200 dark:bg-red-700 rounded-full relative z-10">
                {deadlineInfo?.isOverdue ? (
                  <AlertTriangle className="w-5 h-5 text-red-700 dark:text-red-200" />
                ) : deadlineInfo?.isUrgent ? (
                  <Clock className="w-5 h-5 text-red-700 dark:text-red-200" />
                ) : (
                  <Hash className="w-5 h-5 text-red-700 dark:text-red-200" />
                )}
              </div>
              {/* Expanding ring animations */}
              <div className="absolute inset-0 rounded-full border-2 border-red-300 dark:border-red-600 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full border border-red-200 dark:border-red-500 animate-pulse opacity-50" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute inset-[-4px] rounded-full border border-red-100 dark:border-red-400 animate-ping opacity-30" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
            </div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100 text-center leading-tight">
              {displayTopic}
              {deadlineInfo && (
                <div className="text-sm font-medium mt-1">
                  آخر موعد {degreeInfo?.label}: {deadlineInfo.deadlineDate}
                </div>
              )}
            </h3>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{tSessions('labels.sessionDate')}</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayDate}</span>
            {displayTime && <span className="text-purple-600 dark:text-purple-400 font-semibold truncate">• {displayTime}</span>}
          </div>
          
          {session?.file_number && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <File className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{tSessions('labels.fileNumber')} </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{session.file_number}</span>
            </div>
          )}

          {session?.case_number && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{tSessions('labels.caseNumber')} </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{displayCaseNumber}</span>
              {degreeInfo && (
                <Badge className={`ml-2 truncate flex-shrink-0 ${degreeInfo.color}`}>
                  {degreeInfo.label}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{tSessions('labels.client')} </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {displayClientParties.length > 0 ? displayClientParties.join('، ') : t('common.notSpecified')}
            </span>
          </div>

          {displayOpponentParties.length > 0 && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{tSessions('labels.opponent')} </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {displayOpponentParties.join('، ')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{tSessions('labels.caseType')} </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {displayCaseTypeTranslated}          
            </span>
          </div>

          {/* Decision Field */}
          {session?.decision && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{tSessions('labels.decision')} </span>
              <span className="font-semibold text-green-900 dark:text-green-300 truncate">
                {session.decision}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap">
            <Calendar className="w-4 h-4 animate-pulse text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span className="font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{tSessions('labels.deadline')} </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {deadlineInfo ? `(${deadlineInfo.deadlineDate})` : tSessions('labels.notCalculated')}
            </span>
          </div>
          
          {deadlineInfo && (
            <div className={`flex items-center gap-2 text-sm font-medium ${
              deadlineInfo.isOverdue 
                ? 'text-red-600 dark:text-red-400' 
                : deadlineInfo.isUrgent 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-green-600 dark:text-green-400'
            }`}>
              {deadlineInfo.isOverdue ? (
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              ) : (
                <Clock className="w-4 h-4 animate-pulse" />
              )}
              <span className="flex items-center gap-2">
                {/* {deadlineInfo.isOverdue ? '⚠️' : '⏰'}  */}
                {deadlineInfo.isOverdue 
                  ? `${tSessions('labels.overdue')} `
                  : `${tSessions('labels.remaining')} `
                }
                <div 
                  className="relative inline-flex items-center justify-center"
                  aria-label={`${Math.abs(deadlineInfo.daysRemaining)} ${deadlineInfo.daysRemaining === 1 || Math.abs(deadlineInfo.daysRemaining) === 1 ? tSessions('labels.day') : tSessions('labels.days')} ${deadlineInfo.isOverdue ? tSessions('labels.overdue') : tSessions('labels.remaining')}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white relative z-10 ${
                    deadlineInfo.isOverdue 
                      ? 'bg-red-500' 
                      : deadlineInfo.isUrgent 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                  }`} aria-hidden="true">
                    {Math.abs(deadlineInfo.daysRemaining)}
                  </div>
                  {/* Glowing/flashing rings */}
                  <div className={`absolute inset-0 rounded-full animate-ping ${
                    deadlineInfo.isOverdue 
                      ? 'bg-red-400' 
                      : deadlineInfo.isUrgent 
                        ? 'bg-orange-400' 
                        : 'bg-green-400'
                  } opacity-75`} aria-hidden="true"></div>
                  <div className={`absolute inset-[-2px] rounded-full animate-pulse ${
                    deadlineInfo.isOverdue 
                      ? 'bg-red-300' 
                      : deadlineInfo.isUrgent 
                        ? 'bg-orange-300' 
                        : 'bg-green-300'
                  } opacity-50`} style={{animationDelay: '0.5s'}} aria-hidden="true"></div>
                </div>
                {deadlineInfo.daysRemaining === 1 || Math.abs(deadlineInfo.daysRemaining) === 1 
                  ? ` ${tSessions('labels.day')}` 
                  : ` ${tSessions('labels.days')}`
                }
              </span>
            </div>
          )}
          <Actions theme="red" sessionId={session?.id} />   
        
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionsWithDecisionItem
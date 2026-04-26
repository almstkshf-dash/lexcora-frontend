'use client'

import { getSessionsWithDecisions } from "../services/api/sessions"
import SessionsWithDecisionItem from "./SessionsWithDecisionItem"
import DashboardWidgetCard from "./DashboardWidgetCard"
import useSWR from 'swr'
import { useTranslations } from '@/hooks/useTranslations'

const SWR_OPTIONS = { revalidateOnFocus: false, errorRetryCount: 2 }

/**
 * SessionsWithDecision
 *
 * Fully rewritten from scratch to match the dashboard design system.
 * Previous version had: hardcoded Arabic strings, emoji in UI, bare <div>
 * instead of Card, no Skeleton, no i18n, a dead commented-out import, and
 * was not rendered anywhere in Home.js.
 *
 * This component is now ready to be added to Home.js when needed.
 */
function SessionsWithDecision() {
  const { t } = useTranslations()
  const { data, error, isLoading } = useSWR('sessions-with-decisions', getSessionsWithDecisions, SWR_OPTIONS)

  const sessions = data?.success ? data.data : []

  return (
    <DashboardWidgetCard
      theme="purple"
      title={t('home.sessionsWithDecision')}
      count={sessions.length}
      badgeAriaLabel={`${sessions.length} ${t('home.sessionsWithDecision')}`}
      isLoading={isLoading}
      error={error}
      errorMessage={t('home.errorLoadingData')}
      isEmpty={sessions.length === 0}
      emptyMessage={t('home.noSessionsWithDecision')}
    >
      {sessions.map((session) => (
        <SessionsWithDecisionItem key={session.id} session={session} />
      ))}
    </DashboardWidgetCard>
  )
}

export default SessionsWithDecision